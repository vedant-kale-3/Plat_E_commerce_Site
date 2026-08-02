import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  light: 'Low Light' | 'Bright Indirect' | 'Full Sun';
  size: 'Small' | 'Medium' | 'Large';
  rating: number;
  reviewCount: number;
  description: string;
  tag?: string;
}

export interface CartItem extends Product {
  quantity: number;
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
  orders: any[]; // We can strictly type this later when we build the orders table fully
}

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  cartCount: number;
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  isLoadingSession: boolean;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoadingSession(false);
      }
    });

    // 2. Listen for auth changes (login/logout)
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

  async function fetchUserProfile(user: any) {
    try {
      const metadata = user.user_metadata || {};

      setUserSession({
        id: user.id,
        email: user.email || '',
        name: metadata.full_name || user.email?.split('@')[0] || 'User',
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
        phone: metadata.phone || '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        joined: user.created_at 
          ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        orders: [], // Fetching orders would go here
      });
    } catch (err) {
      console.error('Failed to load user profile');
    } finally {
      setIsLoadingSession(false);
    }
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
  };

  const addToCart = (product: Product) => {
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

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
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
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
