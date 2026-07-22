import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StarRating from './StarRating';
import type { Product } from '../context/AppContext';

export default function ProductCard({ product }: { product: Product }) {
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
