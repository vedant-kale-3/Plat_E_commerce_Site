/* eslint-disable react-refresh/only-export-components */
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function clampRating(rating: number): number {
  if (typeof rating !== 'number' || Number.isNaN(rating)) {
    return 0;
  }
  return Math.min(5, Math.max(0, rating));
}

export default function StarRating({ rating, reviewCount, size = 14 }: Props) {
  const safeRating = clampRating(rating);
  const safeReviewCount =
    reviewCount !== undefined && typeof reviewCount === 'number' && !Number.isNaN(reviewCount)
      ? Math.max(0, Math.floor(reviewCount))
      : undefined;

  return (
    <div className="flex items-center gap-1.5" data-testid="star-rating">
      <div
        className="flex items-center gap-0.5"
        aria-label={`Rating: ${safeRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map(star => {
          const filled = safeRating >= star;
          const partial = !filled && safeRating >= star - 0.5;
          return (
            <Star
              key={star}
              size={size}
              data-testid={`star-${star}-${filled ? 'filled' : partial ? 'partial' : 'empty'}`}
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
      {safeReviewCount !== undefined && (
        <span className="text-xs text-gray-500">({safeReviewCount})</span>
      )}
    </div>
  );
}
