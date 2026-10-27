import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Leaf, Package, Home as HomeIcon, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const { cartItems, removeFromCart, userSession, refreshOrders } = useApp();

  // Snapshot the cart on first render — before the useEffect wipes it.
  // This ensures the order summary stays visible on the confirmation screen.
  const snapshotRef = useRef(cartItems);
  const snapshot = snapshotRef.current;

  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);

  const total = snapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = snapshot.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let cancelled = false;

    async function persistOrder() {
      if (snapshot.length === 0) return;

      if (!userSession?.id) {
        // Not logged in — clear cart silently, no DB write
        snapshot.forEach(item => removeFromCart(item.id));
        return;
      }

      try {
        // 1. Create the parent order row.
        //    The orders table RLS policy checks auth.uid() = user_id —
        //    only the logged-in user can insert their own row.
        const orderTotal = parseFloat(
          snapshot.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
        );

        const { data: orderData, error: orderInsertError } = await supabase
          .from('orders')
          .insert({ user_id: userSession.id, total: orderTotal, status: 'Processing' })
          .select('id')
          .single();

        if (orderInsertError || !orderData) {
          throw new Error(orderInsertError?.message ?? 'Failed to create order');
        }

        // 2. Insert line-items with snapshotted prices and names.
        //    Prices/names are intentionally denormalized — if a product
        //    is later edited or deleted, past order history stays accurate.
        const lineItems = snapshot.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        }));

        const { error: itemsInsertError } = await supabase
          .from('order_items')
          .insert(lineItems);

        if (itemsInsertError) {
          throw new Error(itemsInsertError.message);
        }

        if (!cancelled) {
          setOrderSaved(true);
          // Refresh orders in context so ProfilePage shows the new entry immediately
          await refreshOrders();
        }
      } catch (err) {
        console.error('Order persistence failed:', err);
        if (!cancelled) {
          setOrderError(
            'Your order was placed but we could not save it to your history. Please contact support.'
          );
        }
      } finally {
        // Always clear the cart regardless of DB success/failure
        snapshot.forEach(item => removeFromCart(item.id));
      }
    }

    persistOrder();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 bg-forest-100 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-forest-600 rounded-full flex items-center justify-center animate-[pop_0.4s_ease-out]">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-forest-800 mb-3">
          Thank You for Your Purchase!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-2 max-w-md mx-auto">
          Your order has been placed successfully. We are getting your plants ready for their journey to your home.
        </p>

        {/* Contextual status messages */}
        {userSession && orderSaved && (
          <p className="text-xs text-forest-600 mb-6">Order saved to your history.</p>
        )}
        {orderError && (
          <div className="flex items-start gap-2 text-left bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>{orderError}</p>
          </div>
        )}
        {!userSession && (
          <p className="text-xs text-amber-600 mb-6">
            Sign in to save your order history and track future purchases.
          </p>
        )}

        {/* Order summary (uses snapshot so it stays visible after cart is cleared) */}
        {itemCount > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-forest-600" />
              <h2 className="text-sm font-semibold text-forest-800">Order Summary</h2>
            </div>
            <div className="space-y-3">
              {snapshot.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest-800">
                    &#8377;{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-forest-800">Total Paid</span>
              <span className="text-lg font-bold text-forest-800">&#8377;{total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-medium text-sm transition-colors"
          >
            <Leaf size={16} />
            Continue Shopping
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-forest-200 text-forest-700 hover:bg-forest-50 rounded-xl font-medium text-sm transition-colors"
          >
            <HomeIcon size={16} />
            View Orders
          </Link>
        </div>

      </div>
    </div>
  );
}
