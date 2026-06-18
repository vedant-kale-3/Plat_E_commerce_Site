import { Star } from 'lucide-react';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export default function StarRating({ rating, reviewCount, size = 14 }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = rating >= star;
          const partial = !filled && rating >= star - 0.5;
          return (
            <Star
              key={star}
              size={size}
              className={
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : partial
                  ? 'text-amber-400 fill-amber-200'
                  : 'text-gray-300 fill-gray-200'
              }
            />
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
}
