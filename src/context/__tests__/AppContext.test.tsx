import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useApp, AppProvider } from '../AppContext';

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
});
