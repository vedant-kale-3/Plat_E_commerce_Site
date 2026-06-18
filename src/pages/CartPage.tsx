import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Leaf, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useApp();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 60 || cartItems.length === 0 ? 0 : 8.95;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-20">
        <div className="w-20 h-20 bg-forest-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingCart size={36} className="text-forest-500" />
        </div>
        <h2 className="text-2xl font-semibold text-forest-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
          It looks like you haven't added any plants yet. Explore our collection and find your perfect green companion.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Leaf size={16} />
          Shop Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-forest-800">Your Cart</h1>
        <p className="text-gray-500 text-sm mt-1">
          {cartItems.reduce((sum, i) => sum + i.quantity, 0)} item{cartItems.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-4">
          {/* Free shipping progress */}
          {subtotal < 60 && (
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4 flex items-start gap-3">
              <Truck size={18} className="text-forest-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-forest-700 font-medium">
                  Add <span className="font-bold">₹{(60 - subtotal).toFixed(2)}</span> more for free shipping!
                </p>
                <div className="mt-2 h-1.5 bg-forest-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {cartItems.map((item, idx) => (
              <div
                key={item.id}
                className={`flex gap-4 p-5 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}
              >
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover hover:opacity-90 transition-opacity"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs text-forest-500 font-medium uppercase tracking-wide">{item.category}</span>
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-forest-800 text-sm mt-0.5 hover:text-forest-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{item.size} · {item.light}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-forest-700 hover:text-forest-800 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-forest-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-forest-700 hover:text-forest-800 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-forest-800 text-base">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">₹{item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
            <Link
              to="/"
              className="text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors inline-flex items-center gap-1.5"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-forest-800 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-forest-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-forest-500 font-medium">Free</span>
                ) : (
                  <span className="font-medium text-forest-800">₹{shipping.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-medium text-forest-800">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-forest-800">Total</span>
                <span className="text-xl font-bold text-forest-800">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code */}
            <div className="mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-forest-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-300 focus:border-forest-400"
                />
                <button className="px-4 py-2.5 border border-forest-700 text-forest-700 text-sm font-medium rounded-xl hover:bg-forest-50 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-800 hover:bg-forest-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {['Secure checkout', 'Easy returns', 'Plant guarantee'].map(badge => (
                <div key={badge} className="text-center">
                  <div className="text-xs text-gray-400 leading-tight">{badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
