import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { cartCount, userSession } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'About', to: '/#story' },
    { label: 'Reviews', to: '/#reviews' },
    { label: 'Care Guide', to: '/care-guide' },
  ];

  return (
    <nav className="sticky top-0 z-50 glassmorphic">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/image.png" alt="Fiona logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-semibold text-forest-800 tracking-tight group-hover:text-forest-600 transition-colors">Fiona</span>
              <span className="text-[10px] text-forest-500 font-medium tracking-wide">your floral dreams</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-forest-700 hover:text-forest-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-forest-700 hover:bg-forest-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-forest-500 text-white text-xs font-semibold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <Link
              to={userSession ? '/profile' : '/auth'}
              className="p-2 rounded-xl text-forest-700 hover:bg-forest-100 transition-colors"
              aria-label={userSession ? 'Profile' : 'Sign in'}
            >
              <User size={22} />
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-forest-700 hover:bg-forest-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-forest-100 bg-white/95 backdrop-blur-md px-4 pb-4 pt-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
