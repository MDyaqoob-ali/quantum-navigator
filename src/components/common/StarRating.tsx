import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number; // 0 to 5
  maxStars?: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ stars, maxStars = 5, size = 18 }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const isFilled = i < stars;
        return (
          <Star
            key={i}
            size={size}
            style={{
              color: isFilled ? '#D97706' : '#D1CAC0',
              fill: isFilled ? '#F59E0B' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          />
        );
      })}
    </div>
  );
};
