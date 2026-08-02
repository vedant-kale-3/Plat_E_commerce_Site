import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  CheckCircle2,
  Search,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

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

export default function ShopPage() {
  const [lightFilter, setLightFilter] = useState<LightFilter>('All');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('All');
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const searchQuery = (searchParams.get('search') || searchInput).toLowerCase().trim();

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setProducts(data as Product[]);
      });
  }, []);

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
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearchParams(q ? { search: q } : {}, { replace: true });
  };

  const activeFilters =
    (lightFilter !== 'All' ? 1 : 0) + (sizeFilter !== 'All' ? 1 : 0) + (priceRangeIdx !== 0 ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div>
      {/* Page header */}
      <section className="bg-forest-800 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/netted-ficus-tree-32169816686724.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <nav className="flex items-center gap-2 text-xs text-forest-300 mb-4">
            <Link to="/" className="hover:text-forest-100 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">Shop</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-light text-white leading-tight">
            Our <span className="font-semibold text-forest-300">Plants</span>
          </h1>
          <p className="text-forest-200/80 mt-3 max-w-lg text-sm leading-relaxed">
            Every plant is hand-picked, health-checked, and shipped in eco-friendly packaging with a 30-day guarantee.
          </p>
        </div>
      </section>

      {/* Shop section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-forest-800">
              {searchQuery ? `Results for "${searchQuery}"` : 'Browse All Plants'}
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

              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => {
                      setSearchInput(e.target.value);
                      setSearchParams(e.target.value.trim() ? { search: e.target.value.trim() } : {}, { replace: true });
                    }}
                    placeholder="Search plants..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-forest-50 border border-forest-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent text-forest-800 placeholder-forest-400 transition-all"
                  />
                </div>
              </form>

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

              <Link
                to="/"
                className="flex items-center justify-center gap-2 text-xs text-forest-600 hover:text-forest-800 font-medium pt-2 border-t border-gray-100 transition-colors"
              >
                Back to home
                <ArrowRight size={14} />
              </Link>
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
    </div>
  );
}
