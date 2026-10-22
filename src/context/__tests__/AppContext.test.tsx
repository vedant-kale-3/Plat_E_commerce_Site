import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useApp, AppProvider, Product } from '../AppContext';

const mockProduct1: Product = {
  id: 'plant-1',
  name: 'Monstera Deliciosa',
  price: 49.99,
  image: '/monstera.jpg',
  category: 'Tropical',
  light: 'Bright Indirect',
  size: 'Large',
  rating: 4.8,
  review_count: 142,
  description: 'A bold statement plant.',
  tag: 'Best Seller',
};

const mockProduct2: Product = {
  id: 'plant-2',
  name: 'Snake Plant',
  price: 29.99,
  image: '/snake.jpg',
  category: 'Succulent',
  light: 'Low Light',
  size: 'Medium',
  rating: 4.9,
  review_count: 88,
  description: 'Hardy and architectural.',
  tag: null,
};

describe('Global State - AppContext.tsx exception handling', () => {
  describe('EX-CTX-01: useApp() outside of AppProvider', () => {
    it('throws descriptive error when invoked outside of AppProvider', () => {
      // Suppress React error boundary console noise during expected throw
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within an AppProvider');

      consoleErrorSpy.mockRestore();
    });

    it('successfully provides context when wrapped within AppProvider', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
      expect(typeof result.current.addToCart).toBe('function');
    });
  });

  describe('EX-CTX-02: addToCart(product) duplicate ID & rapid addition resilience', () => {
    it('increments quantity without duplicate cart items when added repeatedly in rapid succession', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      // Rapidly add the exact same product 5 times
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
      });

      // Assert only 1 unique cart item exists with quantity 5
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe(mockProduct1.id);
      expect(result.current.cartItems[0].quantity).toBe(5);
      expect(result.current.cartCount).toBe(5);
    });

    it('manages distinct products independently during rapid additions', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cartItems).toHaveLength(2);

      const item1 = result.current.cartItems.find(item => item.id === mockProduct1.id);
      const item2 = result.current.cartItems.find(item => item.id === mockProduct2.id);

      expect(item1?.quantity).toBe(3);
      expect(item2?.quantity).toBe(2);
      expect(result.current.cartCount).toBe(5);
    });

    it('gracefully ignores invalid product or missing ID without throwing', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(null as unknown as Product);
        result.current.addToCart({} as unknown as Product);
      });

      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
    });
  });

  describe('EX-CTX-03: updateQuantity(id, delta) boundary condition (delta = -1 at quantity = 1)', () => {
    it('automatically removes item from cart when quantity drops to 0 via delta = -1', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(1);
      expect(result.current.cartCount).toBe(1);

      // Decrement by 1 (1 + (-1) = 0)
      act(() => {
        result.current.updateQuantity(mockProduct1.id, -1);
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
    });

    it('decrements quantity normally when quantity is greater than 1', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cartItems[0].quantity).toBe(2);

      act(() => {
        result.current.updateQuantity(mockProduct1.id, -1);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(1);
      expect(result.current.cartCount).toBe(1);
    });

    it('removes only the targeted item when multiple products are present', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.cartItems).toHaveLength(2);

      act(() => {
        result.current.updateQuantity(mockProduct1.id, -1);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe(mockProduct2.id);
      expect(result.current.cartCount).toBe(1);
    });
  });

  describe('EX-CTX-04: updateQuantity(id, delta) large negative delta handling', () => {
    it('cleanly removes item without negative quantity artifacts when delta is large negative number', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cartItems[0].quantity).toBe(2);

      // Large negative delta e.g. -50
      act(() => {
        result.current.updateQuantity(mockProduct1.id, -50);
      });

      expect(result.current.cartItems).toHaveLength(0);
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
    });

    it('preserves other items intact when one item is removed via large negative delta', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.addToCart(mockProduct2);
        result.current.addToCart(mockProduct2);
      });

      expect(result.current.cartCount).toBe(5);

      act(() => {
        result.current.updateQuantity(mockProduct1.id, -999);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe(mockProduct2.id);
      expect(result.current.cartItems[0].quantity).toBe(3);
      expect(result.current.cartCount).toBe(3);
    });

    it('safely ignores non-finite delta values without throwing or creating NaN quantities', () => {
      const { result } = renderHook(() => useApp(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AppProvider>{children}</AppProvider>
        ),
      });

      act(() => {
        result.current.addToCart(mockProduct1);
      });

      act(() => {
        result.current.updateQuantity(mockProduct1.id, NaN);
        result.current.updateQuantity(mockProduct1.id, Infinity);
      });

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(1);
      expect(result.current.cartCount).toBe(1);
    });
  });
});
