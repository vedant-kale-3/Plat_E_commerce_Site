import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CartPage, {
  calculateCartTotals,
  roundToTwoDecimals,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  TAX_RATE,
} from '../CartPage';
import * as AppContextModule from '../../context/AppContext';
import { CartItem } from '../../context/AppContext';

const createMockCartItem = (overrides: Partial<CartItem>): CartItem => ({
  id: 'plant-test',
  name: 'Test Plant',
  price: 19.99,
  image: '/test.jpg',
  category: 'Tropical',
  light: 'Bright Indirect',
  size: 'Medium',
  rating: 4.8,
  review_count: 50,
  description: 'Test description',
  tag: null,
  quantity: 1,
  ...overrides,
});

describe('Financial & Checkout Calculations - CartPage.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('EX-FIN-01: Price Calculation with Recurring Floating-Point Decimals', () => {
    it('calculates totals with exact 2-decimal precision avoiding IEEE 754 precision bugs ($19.99 * 3 = $59.97 + 8% tax)', () => {
      // 3 items at $19.99 each
      // In JavaScript: 19.99 * 3 = 59.970000000000006
      // Tax: 59.97 * 0.08 = 4.797600000000001
      // Shipping: 8.95 (since 59.97 < 60)
      // Total: 59.97 + 8.95 + 4.80 = 73.72
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', name: 'Monstera', price: 19.99, quantity: 3 }),
      ];

      const totals = calculateCartTotals(items);

      expect(totals.subtotal).toBe(59.97);
      expect(totals.tax).toBe(4.8);
      expect(totals.tax.toFixed(2)).toBe('4.80');
      expect(totals.shipping).toBe(STANDARD_SHIPPING_FEE);
      expect(totals.total).toBe(73.72);
      expect(totals.total.toFixed(2)).toBe('73.72');
      expect(totals.remainingForFreeShipping).toBe(0.03);
    });

    it('formats total, tax, and subtotals to exactly 2 decimal places in rendered UI without raw float artifacts', () => {
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', name: 'Monstera', price: 19.99, quantity: 3 }),
      ];

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        cartItems: items,
        cartCount: 3,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });

      const { container } = render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );

      // Verify subtotal and line-item total displays (both show ₹59.97)
      expect(screen.getAllByText('₹59.97')).toHaveLength(2);

      // Verify line-item unit and total prices
      expect(screen.getByText('₹19.99 each')).toBeInTheDocument();

      // Verify tax is formatted to 2 decimals ($4.80)
      expect(screen.getByText('₹4.80')).toBeInTheDocument();

      // Verify shipping is formatted to 2 decimals ($8.95)
      expect(screen.getByText('₹8.95')).toBeInTheDocument();

      // Verify total is formatted to 2 decimals ($73.72)
      expect(screen.getByText('₹73.72')).toBeInTheDocument();

      // Ensure no raw IEEE 754 precision bugs are present in rendered text
      const pageText = container.textContent || '';
      expect(pageText).not.toMatch(/64\.7676/);
      expect(pageText).not.toMatch(/73\.7176/);
      expect(pageText).not.toMatch(/59\.97000/);
      expect(pageText).not.toMatch(/4\.7976/);
    });

    it('handles multiple items with floating point cents accurately', () => {
      // 0.10 + 0.20 float imprecision test: 0.10 + 0.20 = 0.30000000000000004
      const items = [
        { price: 10.1, quantity: 1 },
        { price: 20.2, quantity: 1 },
      ];

      const totals = calculateCartTotals(items);
      expect(totals.subtotal).toBe(30.3);
      expect(totals.subtotal.toFixed(2)).toBe('30.30');
      // Tax: 30.30 * 0.08 = 2.424 -> 2.42
      expect(totals.tax).toBe(2.42);
      expect(totals.tax.toFixed(2)).toBe('2.42');
      // Shipping: 8.95
      // Total: 30.30 + 8.95 + 2.42 = 41.67
      expect(totals.total).toBe(41.67);
      expect(totals.total.toFixed(2)).toBe('41.67');
    });

    it('roundToTwoDecimals correctly handles epsilon boundaries', () => {
      expect(roundToTwoDecimals(19.99 * 3)).toBe(59.97);
      expect(roundToTwoDecimals(59.97 * 0.08)).toBe(4.8);
      expect(roundToTwoDecimals(1.005)).toBe(1.01);
      expect(roundToTwoDecimals(0)).toBe(0);
    });
  });

  describe('EX-FIN-02: Shipping Threshold Boundary Conditions ($59.99 vs $60.00)', () => {
    it('charges shipping ($8.95) and shows remaining progress ($0.01) when subtotal is $59.99', () => {
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', price: 59.99, quantity: 1 }),
      ];

      const totals = calculateCartTotals(items);

      expect(totals.subtotal).toBe(59.99);
      expect(totals.shipping).toBe(STANDARD_SHIPPING_FEE);
      expect(totals.remainingForFreeShipping).toBe(0.01);
      expect(totals.remainingForFreeShipping.toFixed(2)).toBe('0.01');
      // Tax: 59.99 * 0.08 = 4.7992 -> 4.80
      expect(totals.tax).toBe(4.8);
      // Total: 59.99 + 8.95 + 4.80 = 73.74
      expect(totals.total).toBe(73.74);
    });

    it('renders shipping progress banner with exactly ₹0.01 remaining and ₹8.95 shipping at $59.99 subtotal', () => {
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', price: 59.99, quantity: 1 }),
      ];

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        cartItems: items,
        cartCount: 1,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });

      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );

      // Banner should be present stating remaining amount
      expect(screen.getByText(/Add/)).toBeInTheDocument();
      expect(screen.getByText('₹0.01')).toBeInTheDocument();
      expect(screen.getByText(/more for free shipping!/)).toBeInTheDocument();

      // Shipping should be ₹8.95, NOT Free
      expect(screen.getByText('₹8.95')).toBeInTheDocument();
      expect(screen.queryByText('Free')).not.toBeInTheDocument();

      // Total should include the shipping cost
      expect(screen.getByText('₹73.74')).toBeInTheDocument();
    });

    it('qualifies for free shipping ($0.00) and hides remaining progress banner when subtotal is exactly $60.00', () => {
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', price: 60.0, quantity: 1 }),
      ];

      const totals = calculateCartTotals(items);

      expect(totals.subtotal).toBe(60.0);
      expect(totals.shipping).toBe(0);
      expect(totals.remainingForFreeShipping).toBe(0);
      // Tax: 60.00 * 0.08 = 4.80
      expect(totals.tax).toBe(4.8);
      // Total: 60.00 + 0 + 4.80 = 64.80
      expect(totals.total).toBe(64.8);
      expect(totals.total.toFixed(2)).toBe('64.80');
    });

    it('renders "Free" shipping and omits progress banner at exactly $60.00 subtotal in UI', () => {
      const items: CartItem[] = [
        createMockCartItem({ id: 'item-1', price: 60.0, quantity: 1 }),
      ];

      vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
        cartItems: items,
        cartCount: 1,
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        updateQuantity: vi.fn(),
        userSession: null,
        setUserSession: vi.fn(),
        isLoadingSession: false,
        logout: vi.fn(),
        refreshOrders: vi.fn(),
      });

      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );

      // Shipping should display "Free"
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.queryByText('₹8.95')).not.toBeInTheDocument();

      // Progress banner for free shipping should NOT be rendered
      expect(screen.queryByText(/more for free shipping!/)).not.toBeInTheDocument();

      // Total should be exactly subtotal + tax = ₹64.80
      expect(screen.getByText('₹64.80')).toBeInTheDocument();
    });

    it('qualifies for free shipping when subtotal exceeds $60.00 (e.g. $60.01)', () => {
      const items = [{ price: 60.01, quantity: 1 }];
      const totals = calculateCartTotals(items);

      expect(totals.subtotal).toBe(60.01);
      expect(totals.shipping).toBe(0);
      expect(totals.remainingForFreeShipping).toBe(0);
      expect(totals.total).toBe(roundToTwoDecimals(60.01 + 60.01 * TAX_RATE));
    });

    it('returns 0 shipping and 0 totals for empty cart', () => {
      const totals = calculateCartTotals([]);

      expect(totals.subtotal).toBe(0);
      expect(totals.shipping).toBe(0);
      expect(totals.tax).toBe(0);
      expect(totals.total).toBe(0);
      expect(totals.remainingForFreeShipping).toBe(FREE_SHIPPING_THRESHOLD);
    });
  });
});
