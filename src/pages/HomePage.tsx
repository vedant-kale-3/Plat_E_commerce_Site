import { useState, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  ArrowDown,
  Star,
  Truck,
  ShieldCheck,
  Recycle,
  Headphones,
} from 'lucide-react';
import { products } from '../data/products';
import { useApp } from '../context/AppContext';
import StarRating from '../components/StarRating';
import type { Product } from '../context/AppContext';

type LightFilter = 'All' | 'Low Light' | 'Bright Indirect';
type SizeFilter = 'All' | 'Small' | 'Medium' | 'Large';

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

const priceRanges: PriceRange[] = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹25', min: 0, max: 25 },
  { label: '₹25 – ₹50', min: 25, max: 50 },
  { label: '₹50 – ₹100', min: 50, max: 100 },
  { label: 'Over ₹100', min: 100, max: Infinity },
];

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="relative overflow-hidden block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.tag && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-forest-800 text-white text-xs font-semibold rounded-full">
            {product.tag}
          </span>
        )}
        <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 text-forest-700 text-xs font-medium rounded-full capitalize">
          {product.size}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1">
          <span className="text-xs text-forest-500 font-medium uppercase tracking-wide">{product.category}</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-forest-800 text-base mb-1 hover:text-forest-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{product.description}</p>

        <div className="mb-3">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-forest-800">₹{product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              added
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-800 hover:bg-forest-800 hover:text-white'
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 size={16} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [lightFilter, setLightFilter] = useState<LightFilter>('All');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('All');
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const filtered = useMemo(() => {
    const range = priceRanges[priceRangeIdx];
    return products.filter(p => {
      if (lightFilter !== 'All' && p.light !== lightFilter) return false;
      if (sizeFilter !== 'All' && p.size !== sizeFilter) return false;
      if (p.price < range.min || p.price > range.max) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery) && !p.category.toLowerCase().includes(searchQuery)) return false;
      return true;
    });
  }, [lightFilter, sizeFilter, priceRangeIdx, searchQuery]);

  const clearFilters = () => {
    setLightFilter('All');
    setSizeFilter('All');
    setPriceRangeIdx(0);
  };

  const activeFilters =
    (lightFilter !== 'All' ? 1 : 0) + (sizeFilter !== 'All' ? 1 : 0) + (priceRangeIdx !== 0 ? 1 : 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-forest-800 overflow-hidden min-h-[88vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/1_da069a19-bb37-40a4-b196-7d0610a89582.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-800/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-forest-500/20 border border-forest-400/30 rounded-full text-forest-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <Star size={12} className="fill-forest-400 text-forest-400" />
              Rated 4.9/5 by 10,000+ plant lovers
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-6">
              Bring{' '}
              <span className="font-semibold text-forest-300">Nature</span>
              <br />
              Indoors
            </h1>
            <p className="text-lg text-forest-200/80 leading-relaxed mb-10 max-w-lg">
              Hand-selected plants delivered fresh to your door. Transform your living space with living art — curated by plant experts, loved by thousands.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => shopRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-medium rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
              >
                Shop Plants
                <ArrowDown size={18} />
              </button>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white hover:bg-white/10 font-medium rounded-2xl transition-all text-base"
              >
                Join Fiona
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { icon: Truck, label: 'Free delivery over ₹60' },
                { icon: ShieldCheck, label: '30-day health guarantee' },
                { icon: Recycle, label: 'Eco-friendly packaging' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-forest-300 text-sm">
                  <Icon size={16} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating plant cards */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-10">
          {[
            { img: '/A_image_12_75a15381-4701-4eca-a435-ce855c9437cb.jpg', name: 'Swiss Cheese Vine', price: '₹24.99' },
            { img: '/netted-ficus-tree-32169816686724.jpg', name: 'Netted Ficus', price: '₹89.99' },
          ].map(card => (
            <div
              key={card.name}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white"
            >
              <img src={card.img} alt={card.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <div className="text-sm font-medium">{card.name}</div>
                <div className="text-forest-300 text-sm">{card.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹60' },
              { icon: ShieldCheck, title: 'Health Guarantee', desc: '30-day plant guarantee' },
              { icon: Recycle, title: 'Eco Packaging', desc: '100% sustainable materials' },
              { icon: Headphones, title: 'Expert Support', desc: 'Plant care advice 7 days/week' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-forest-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-forest-800">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop section */}
      <section id="shop" ref={shopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-forest-800">
              {searchQuery ? `Results for "${searchQuery}"` : 'Our Plants'}
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {filtered.length} plant{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(s => !s)}
            className="sm:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-forest-700 bg-white hover:bg-forest-50 transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 bg-forest-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside
            className={`${
              filterOpen ? 'block' : 'hidden'
            } sm:block w-full sm:w-56 lg:w-64 shrink-0`}
          >
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24 space-y-7">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-forest-800 text-sm">Filters</h3>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-forest-500 hover:text-forest-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Light */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Light Needs</h4>
                <div className="space-y-2">
                  {(['All', 'Low Light', 'Bright Indirect'] as LightFilter[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setLightFilter(opt)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                        lightFilter === opt
                          ? 'bg-forest-800 text-white font-medium'
                          : 'text-forest-700 hover:bg-forest-50'
                      }`}
                    >
                      {opt}
                      {lightFilter === opt && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Plant Size</h4>
                <div className="space-y-2">
                  {(['All', 'Small', 'Medium', 'Large'] as SizeFilter[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSizeFilter(opt)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                        sizeFilter === opt
                          ? 'bg-forest-800 text-white font-medium'
                          : 'text-forest-700 hover:bg-forest-50'
                      }`}
                    >
                      {opt}
                      {sizeFilter === opt && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRangeIdx(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                        priceRangeIdx === idx
                          ? 'bg-forest-800 text-white font-medium'
                          : 'text-forest-700 hover:bg-forest-50'
                      }`}
                    >
                      {range.label}
                      {priceRangeIdx === idx && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center mb-4">
                  <SlidersHorizontal size={28} className="text-forest-500" />
                </div>
                <h3 className="text-lg font-semibold text-forest-800 mb-2">No plants found</h3>
                <p className="text-sm text-gray-500 mb-5">Try adjusting your filters or clearing them to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-forest-800 text-white text-sm font-medium rounded-xl hover:bg-forest-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter banner */}
      <section className="bg-forest-100 border-t border-forest-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold text-forest-800 mb-2">Get plant care tips in your inbox</h2>
          <p className="text-sm text-forest-600 mb-6">Join 8,000+ plant parents. No spam, just green goodness.</p>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-forest-300 text-sm bg-white text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-forest-800 text-white text-sm font-medium rounded-xl hover:bg-forest-700 transition-colors whitespace-nowrap"
            >
              Subscribe Free
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
