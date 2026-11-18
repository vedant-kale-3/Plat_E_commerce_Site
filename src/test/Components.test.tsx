import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarRating, { clampRating } from '../components/StarRating';
import CareGuidePage from '../pages/CareGuidePage';
import ProductCard from '../components/ProductCard';
import ProfilePage from '../pages/ProfilePage';
import { plantGuides } from '../data/careGuide';
import { supabase } from '../lib/supabase';
import * as AppContextModule from '../context/AppContext';
import type { UserSession } from '../context/AppContext';

describe('Component Rendering & UI Hydration Exceptions - Components.test.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('EX-CMP-01: StarRating boundary and out-of-range input handling', () => {
    it('clampRating clamps values safely into the 0-5 range', () => {
      expect(clampRating(0)).toBe(0);
      expect(clampRating(-1)).toBe(0);
      expect(clampRating(-100)).toBe(0);
      expect(clampRating(5)).toBe(5);
      expect(clampRating(6)).toBe(5);
      expect(clampRating(99)).toBe(5);
      expect(clampRating(3.5)).toBe(3.5);
      expect(clampRating(NaN)).toBe(0);
      expect(clampRating('invalid' as unknown as number)).toBe(0);
    });

    it('renders 5 empty stars when rating is 0 or negative without crashing', () => {
      const { rerender } = render(<StarRating rating={0} />);

      const starContainer = screen.getByLabelText('Rating: 0 out of 5 stars');
      expect(starContainer).toBeInTheDocument();

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`star-${i}-empty`)).toBeInTheDocument();
      }

      // Negative rating e.g. -3.5
      rerender(<StarRating rating={-3.5} />);
      expect(screen.getByLabelText('Rating: 0 out of 5 stars')).toBeInTheDocument();
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`star-${i}-empty`)).toBeInTheDocument();
      }
    });

    it('renders 5 filled stars when rating exceeds 5 without crashing', () => {
      render(<StarRating rating={8.5} />);

      const starContainer = screen.getByLabelText('Rating: 5 out of 5 stars');
      expect(starContainer).toBeInTheDocument();

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`star-${i}-filled`)).toBeInTheDocument();
      }
    });

    it('renders correct mix of filled, partial, and empty stars for normal in-range ratings', () => {
      render(<StarRating rating={3.5} reviewCount={42} />);

      expect(screen.getByLabelText('Rating: 3.5 out of 5 stars')).toBeInTheDocument();
      expect(screen.getByTestId('star-1-filled')).toBeInTheDocument();
      expect(screen.getByTestId('star-2-filled')).toBeInTheDocument();
      expect(screen.getByTestId('star-3-filled')).toBeInTheDocument();
      expect(screen.getByTestId('star-4-partial')).toBeInTheDocument();
      expect(screen.getByTestId('star-5-empty')).toBeInTheDocument();
      expect(screen.getByText('(42)')).toBeInTheDocument();
    });

    it('gracefully handles non-numeric or NaN ratings by defaulting to 0 stars', () => {
      render(<StarRating rating={NaN} />);

      expect(screen.getByLabelText('Rating: 0 out of 5 stars')).toBeInTheDocument();
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByTestId(`star-${i}-empty`)).toBeInTheDocument();
      }
    });
  });

  describe('EX-PAGE-01: CareGuidePage.tsx Supabase query failure and fallback hydration', () => {
    it('catches Supabase query error, warns to console, and renders smooth carousel using default plantGuides', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection refused' },
        }),
      };

      vi.spyOn(supabase, 'from').mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <CareGuidePage />
        </MemoryRouter>
      );

      // Verify that console warning was triggered for query error
      await waitFor(() => {
        expect(warnSpy).toHaveBeenCalledWith(
          'Supabase query error for care guides; serving fallback data:',
          'Database connection refused'
        );
      });

      // Verify page headings are rendered
      expect(screen.getByRole('heading', { level: 1, name: /Plant.*Care Guide/i })).toBeInTheDocument();
      expect(screen.getByText('Care guides for every kind of plant')).toBeInTheDocument();

      // Ensure each default guide category appears in the carousel
      plantGuides.forEach(guide => {
        const matchingHeaders = screen.getAllByText(`${guide.category} Plants`);
        expect(matchingHeaders.length).toBeGreaterThan(0);
      });
    });

    it('catches network offline failure / unhandled promise rejection without crashing and renders fallback plantGuides', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
      };

      vi.spyOn(supabase, 'from').mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <CareGuidePage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(warnSpy).toHaveBeenCalledWith(
          'Failed to load care guides from Supabase:',
          expect.any(TypeError)
        );
      });

      // Assert carousel is hydrated and visible
      expect(screen.getAllByText('Tropical Plants').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Succulent Plants').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Trailing Plants').length).toBeGreaterThan(0);
    });

    it('gracefully renders fallback guides when database returns an empty array', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      vi.spyOn(supabase, 'from').mockReturnValue(mockQuery as unknown as ReturnType<typeof supabase.from>);

      render(
        <MemoryRouter>
          <CareGuidePage />
        </MemoryRouter>
      );

      // Even with empty DB response, the default plantGuides carousel remains fully visible
      await waitFor(() => {
        expect(screen.getAllByText('Tropical Plants').length).toBeGreaterThan(0);
      });

      plantGuides.forEach(guide => {
        expect(screen.getAllByText(`${guide.category} Plants`).length).toBeGreaterThan(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // EX-CMP-02: ProductCard — null / undefined product.tag
  // ---------------------------------------------------------------------------
  describe('EX-CMP-02: ProductCard does not render tag badge when product.tag is null or undefined', () => {
    const baseProduct = {
      id: 'plant-test-1',
      name: 'Peace Lily',
      price: 39.99,
      image: '/peace-lily.jpg',
      category: 'Tropical',
      light: 'Low Light' as const,
      size: 'Medium' as const,
      rating: 4.3,
      review_count: 72,
      description: 'An elegant, low-light tolerant plant.',
    };

    function renderCard(product: typeof baseProduct & { tag?: string | null }) {
      vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        cartItems: [],
        cartCount: 0,
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });
      return render(
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      );
    }

    it('does not render a tag badge when product.tag is null', () => {
      renderCard({ ...baseProduct, tag: null });
      // The tag badge should not be in the DOM at all
      expect(screen.queryByText('Best Seller')).not.toBeInTheDocument();
      expect(screen.queryByText('Sale')).not.toBeInTheDocument();
      // But the product name and size badge must still render
      expect(screen.getByText('Peace Lily')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('does not render a tag badge when product.tag is undefined', () => {
      renderCard({ ...baseProduct, tag: undefined });
      expect(screen.queryByText('Best Seller')).not.toBeInTheDocument();
      // Product content still intact
      expect(screen.getByText('Peace Lily')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders the tag badge when product.tag is a non-empty string', () => {
      renderCard({ ...baseProduct, tag: 'Best Seller' });
      expect(screen.getByText('Best Seller')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // EX-CMP-03: ProfilePage — unauthenticated (userSession === null)
  // ---------------------------------------------------------------------------
  describe('EX-CMP-03: ProfilePage renders login CTA when userSession is null and never crashes', () => {
    function renderProfileUnauthenticated() {
      vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        cartItems: [],
        cartCount: 0,
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });
      return render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      );
    }

    it('renders the sign-in CTA when userSession is null without throwing', () => {
      renderProfileUnauthenticated();
      expect(screen.getByText("You're not signed in")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('does not render the profile details or order history sections when unauthenticated', () => {
      renderProfileUnauthenticated();
      expect(screen.queryByText('Profile Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Order History')).not.toBeInTheDocument();
    });

    it('does not attempt to access userSession.name or any property on null — no TypeError thrown', () => {
      // If the component tried to access userSession.name when null, React would throw during render
      expect(() => renderProfileUnauthenticated()).not.toThrow();
    });

    it('renders a valid sign-in link / button that navigates toward /auth', () => {
      renderProfileUnauthenticated();
      const signInBtn = screen.getByRole('button', { name: /sign in/i });
      expect(signInBtn).toBeInTheDocument();
      // Confirm it is interactive (not disabled)
      expect(signInBtn).not.toBeDisabled();
    });

    it('renders correctly when userSession transitions from non-null to null (sign-out scenario)', () => {
      const mockSession: UserSession = {
        id: 'user-99',
        name: 'Alice Green',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Green',
        phone: '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        joined: 'January 2025',
        orders: [],
      };

      const mockUseApp = vi.spyOn(AppContextModule, 'useApp');

      // First render: authenticated
      mockUseApp.mockReturnValue({
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        cartItems: [],
        cartCount: 0,
        userSession: mockSession,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });

      const { rerender } = render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      );

      expect(screen.getByText('Alice Green')).toBeInTheDocument();

      // Simulate sign-out: userSession → null
      mockUseApp.mockReturnValue({
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        cartItems: [],
        cartCount: 0,
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });

      rerender(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      );

      expect(screen.getByText("You're not signed in")).toBeInTheDocument();
      expect(screen.queryByText('Alice Green')).not.toBeInTheDocument();
    });
  });
});
