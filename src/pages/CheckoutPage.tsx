import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Leaf, Package, Home as HomeIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CheckoutPage() {
  const { cartItems, removeFromCart } = useApp();

  useEffect(() => {
    cartItems.forEach(item => removeFromCart(item.id));
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
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
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Your order has been placed successfully. We're getting your plants ready for their journey to your home. A confirmation email is on its way.
        </p>

        {itemCount > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-forest-600" />
              <h2 className="text-sm font-semibold text-forest-800">Order Summary</h2>
            </div>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-forest-800">Total Paid</span>
              <span className="text-lg font-bold text-forest-800">₹{total.toFixed(2)}</span>
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
