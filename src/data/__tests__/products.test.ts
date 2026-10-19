import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProducts, fallbackProducts } from '../products';
import { supabase } from '../../lib/supabase';

describe('Data Layer - products.ts exception handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('EX-DATA-01: fetchProducts() error handling', () => {
    it('logs warning and returns fallbackProducts when Supabase returns an explicit error', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock supabase query chain returning an error
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection refused' },
        }),
      };

      vi.spyOn(supabase, 'from').mockReturnValue(mockQuery as any);

      const result = await fetchProducts();

      // 1. Should not throw
      expect(result).toBeDefined();

      // 2. Should log a console warning with the error message
      expect(warnSpy).toHaveBeenCalledWith(
        'Supabase query error for products; serving fallback data:',
        'Database connection refused'
      );

      // 3. Should return the full fallbackProducts array
      expect(result).toEqual(fallbackProducts);
      expect(result).toHaveLength(10);
    });
  });
});
