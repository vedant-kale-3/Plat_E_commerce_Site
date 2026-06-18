import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-800 text-forest-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img src="/image.png" alt="Fiona logo" className="w-8 h-8 object-contain brightness-0 invert" />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-semibold text-white tracking-tight">Fiona</span>
                <span className="text-[10px] text-forest-400 font-medium tracking-wide">your floral dreams</span>
              </div>
            </Link>
            <p className="text-sm text-forest-300 leading-relaxed">
              Bringing floral dreams to life since 2019. Curated plants, expert care guides, and sustainable packaging delivered to your door.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-forest-700 hover:bg-forest-600 flex items-center justify-center transition-colors"
                  aria-label="Social link"
                >
                  <Icon size={16} className="text-forest-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2.5">
              {['All Plants', 'Low Light Plants', 'Hanging Plants', 'Succulents', 'Trees & Large Plants', 'Plant Bundles'].map(item => (
                <li key={item}>
                  <Link to="/" className="text-sm text-forest-300 hover:text-forest-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Help</h4>
            <ul className="space-y-2.5">
              {['Plant Care Guide', 'Shipping & Returns', 'FAQ', 'Track Your Order', 'Gift Cards', 'Wholesale'].map(item => (
                <li key={item}>
                  <Link to="/" className="text-sm text-forest-300 hover:text-forest-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-forest-300">
                <Mail size={15} className="text-forest-500 shrink-0" />
                hello@verdantplants.com
              </li>
              <li className="flex items-center gap-3 text-sm text-forest-300">
                <Phone size={15} className="text-forest-500 shrink-0" />
                +1 (555) 234-5678
              </li>
              <li className="flex items-start gap-3 text-sm text-forest-300">
                <MapPin size={15} className="text-forest-500 shrink-0 mt-0.5" />
                42 Garden Street, Portland, OR 97201
              </li>
            </ul>
            <div className="mt-5 p-3.5 bg-forest-700 rounded-xl">
              <p className="text-xs text-forest-300 font-medium mb-2">Subscribe for plant tips</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 text-xs bg-forest-800 border border-forest-600 rounded-lg px-3 py-2 text-forest-200 placeholder-forest-500 focus:outline-none focus:border-forest-400"
                />
                <button className="px-3 py-2 bg-forest-500 hover:bg-forest-400 text-white text-xs font-medium rounded-lg transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-forest-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-forest-400">&copy; {new Date().getFullYear()} Fiona. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <Link key={item} to="/" className="text-xs text-forest-400 hover:text-forest-200 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
