import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  light: 'Low Light' | 'Bright Indirect' | 'Full Sun';
  size: 'Small' | 'Medium' | 'Large';
  rating: number;
  review_count: number;
  description: string;
  tag?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  joined: string;
  orders: Order[];
}

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartCount: number;
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  isLoadingSession: boolean;
  logout: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoadingSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUserSession(null);
        setIsLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch orders for a given user from Supabase.
  // Row Level Security on the orders table ensures auth.uid() = user_id,
  // so every query is automatically scoped to the calling user only.
  async function fetchUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at, order_items ( name, image, price, quantity )')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch orders:', error.message);
        return [];
      }

      return (data ?? []).map((row) => ({
        id: row.id as string,
        date: new Date(row.created_at as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: row.status as Order['status'],
        total: row.total as number,
        items: (row.order_items as OrderItem[]) ?? [],
      }));
    } catch {
      console.warn('Unexpected error fetching orders');
      return [];
    }
  }

  async function fetchUserProfile(user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, string>;
    created_at?: string;
  }) {
    try {
      const metadata = user.user_metadata || {};
      const orders = await fetchUserOrders(user.id);

      setUserSession({
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || user.email?.split('@')[0] || 'User',
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
        phone: metadata.phone || '',
        address: { street: '', city: '', state: '', zip: '', country: '' },
        joined: user.created_at
          ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        orders,
      });
    } catch {
      console.error('Failed to load user profile');
    } finally {
      setIsLoadingSession(false);
    }
  }

  // Call this after a new order is placed so ProfilePage shows it immediately
  const refreshOrders = useCallback(async () => {
    if (!userSession?.id) return;
    const orders = await fetchUserOrders(userSession.id);
    setUserSession(prev => prev ? { ...prev, orders } : null);
  }, [userSession?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
  };

  const addToCart = (product: Product) => {
    if (!product || !product.id) return;
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    if (!Number.isFinite(delta)) return;
    setCartItems(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        userSession,
        setUserSession,
        isLoadingSession,
        logout,
        refreshOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
