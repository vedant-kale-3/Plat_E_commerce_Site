import { createContext, useContext, useState, ReactNode } from 'react';

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
  name: string;
  email: string;
}

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  cartCount: number;
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

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
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount, userSession, setUserSession }}
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
