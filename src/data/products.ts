import { supabase } from '../lib/supabase';
import type { Product } from '../context/AppContext';

export const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    price: 49.99,
    image: '/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg',
    category: 'Tropical',
    light: 'Bright Indirect',
    size: 'Large',
    rating: 4.8,
    review_count: 142,
    description: 'The iconic split-leaf philodendron. A bold statement plant that thrives in bright indirect light and brings lush tropical vibes to any room.',
    tag: 'Best Seller',
  },
  {
    id: '2',
    name: 'Swiss Cheese Vine',
    price: 24.99,
    image: '/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg',
    category: 'Tropical',
    light: 'Bright Indirect',
    size: 'Small',
    rating: 4.6,
    review_count: 89,
    description: 'A compact and charming Monstera adansonii. Perfect for shelves and tabletops with its delicate fenestrated leaves.',
    tag: null,
  },
  {
    id: '3',
    name: 'Peperomia Hanging',
    price: 19.99,
    image: '/1_69c03517-6f5a-4f05-baa1-06df9db2c9d2.jpg',
    category: 'Hanging',
    light: 'Low Light',
    size: 'Small',
    rating: 4.7,
    review_count: 63,
    description: 'A trailing peperomia that cascades beautifully from hanging baskets. Incredibly low-maintenance and drought-tolerant.',
    tag: 'New Arrival',
  },
  {
    id: '4',
    name: 'Netted Ficus Tree',
    price: 89.99,
    image: '/netted-ficus-tree-32169816686724.jpg',
    category: 'Trees',
    light: 'Bright Indirect',
    size: 'Large',
    rating: 4.9,
    review_count: 47,
    description: 'A stunning braided ficus bonsai with a sculptural latticed trunk. An artistic centerpiece that commands attention in any space.',
    tag: 'Premium',
  },
  {
    id: '5',
    name: 'Golden Pothos',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    category: 'Trailing',
    light: 'Low Light',
    size: 'Small',
    rating: 4.9,
    review_count: 218,
    description: 'The ultimate beginner plant. Golden heart-shaped leaves on trailing vines that purify air and grow in almost any condition.',
    tag: 'Best Seller',
  },
  {
    id: '6',
    name: 'Bird of Paradise',
    price: 74.99,
    image: '/A_image_10_06ce6eee-f675-41b8-b461-efb57f8c42a2.webp',
    category: 'Tropical',
    light: 'Bright Indirect',
    size: 'Large',
    rating: 4.7,
    review_count: 95,
    description: 'Dramatic paddle-shaped leaves bring a resort-like atmosphere to living spaces. A floor plant that makes a grand statement.',
    tag: null,
  },
  {
    id: '7',
    name: 'Aloe Vera',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=600&q=80',
    category: 'Succulent',
    light: 'Bright Indirect',
    size: 'Small',
    rating: 4.5,
    review_count: 176,
    description: 'The timeless healing succulent. Thrives on neglect, loves sunshine, and offers natural soothing gel for skin care.',
    tag: null,
  },
  {
    id: '8',
    name: 'ZZ Plant',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    category: 'Foliage',
    light: 'Low Light',
    size: 'Medium',
    rating: 4.8,
    review_count: 134,
    description: 'Glossy dark-green leaves on graceful arching stems. An architectural plant that tolerates low light and irregular watering.',
    tag: null,
  },
  {
    id: '9',
    name: 'Peace Lily',
    price: 28.99,
    image: '/DSC_0263.jpg',
    category: 'Flowering',
    light: 'Low Light',
    size: 'Medium',
    rating: 4.6,
    review_count: 108,
    description: 'Elegant white blooms emerge from deep green foliage. One of the best air-purifying plants and thrives in low light.',
    tag: null,
  },
  {
    id: '10',
    name: 'Rubber Plant',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1598880940078-47f12e5a2e28?auto=format&fit=crop&w=600&q=80',
    category: 'Foliage',
    light: 'Bright Indirect',
    size: 'Medium',
    rating: 4.7,
    review_count: 82,
    description: 'Bold burgundy and dark-green leaves on an upright stem. Adds a sculptural, modern feel to any interior space.',
    tag: 'New Arrival',
  },
];

/**
 * Fetches active products from Supabase.
 * If Supabase is paused, offline, or returns empty, falls back gracefully to `fallbackProducts`.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
    if (error) {
      console.warn('Supabase query error for products; serving fallback data:', error?.message ?? String(error));
    }
    return fallbackProducts;
  } catch (err) {
    console.warn('Network error reaching Supabase products; serving fallback data:', err);
    return fallbackProducts;
  }
}

/**
 * Fetches featured products from Supabase with a limit.
 * If Supabase is paused, offline, or returns empty, falls back gracefully.
 */
export async function fetchFeaturedProducts(limit = 3): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
    if (error) {
      console.warn('Supabase query error for featured products; serving fallback data:', error?.message ?? String(error));
    }
    return fallbackProducts.slice(0, limit);
  } catch (err) {
    console.warn('Network error reaching Supabase featured products; serving fallback data:', err);
    return fallbackProducts.slice(0, limit);
  }
}
