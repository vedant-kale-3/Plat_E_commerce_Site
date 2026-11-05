import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StarRating, { clampRating } from '../components/StarRating';
import CareGuidePage from '../pages/CareGuidePage';
import { plantGuides } from '../data/careGuide';
import { supabase } from '../lib/supabase';

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
});
