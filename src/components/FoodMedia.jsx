import { useState } from 'react';

/**
 * Enhanced Food Image & Icon Component
 * Seamlessly displays high-res food photography with responsive fallback to 3D nutrient icon.
 */
export default function FoodMedia({ food, size = 'md', className = '', style = {}, showBadge = false }) {
  const [imgError, setImgError] = useState(false);

  if (!food) return null;

  const nutritionTheme = (() => {
    switch (food.nutrition) {
      case 'Thịt đỏ':
        return {
          bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(225, 29, 72, 0.08) 100%)',
          border: 'rgba(244, 63, 94, 0.4)',
          glow: 'rgba(244, 63, 94, 0.25)',
          color: '#fb7185',
          icon: '🥩'
        };
      case 'Thịt trắng':
        return {
          bg: 'linear-gradient(135deg, rgba(255, 122, 24, 0.22) 0%, rgba(249, 115, 22, 0.08) 100%)',
          border: 'rgba(255, 122, 24, 0.4)',
          glow: 'rgba(255, 122, 24, 0.25)',
          color: '#ff9800',
          icon: '🍗'
        };
      case 'Cá':
        return {
          bg: 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(14, 165, 233, 0.08) 100%)',
          border: 'rgba(2, 132, 199, 0.4)',
          glow: 'rgba(2, 132, 199, 0.25)',
          color: '#38bdf8',
          icon: '🐟'
        };
      case 'Rau củ':
        return {
          bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 100%)',
          border: 'rgba(16, 185, 129, 0.4)',
          glow: 'rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          icon: '🥗'
        };
      default: // Tinh bột
        return {
          bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: 'rgba(217, 119, 6, 0.4)',
          glow: 'rgba(217, 119, 6, 0.25)',
          color: '#fbbf24',
          icon: '🍚'
        };
    }
  })();

  const dimensions = (() => {
    switch (size) {
      case 'xs':
        return { width: '28px', height: '28px', minWidth: '28px', fontSize: '1.1rem', radius: '8px' };
      case 'sm':
        return { width: '38px', height: '38px', minWidth: '38px', fontSize: '1.4rem', radius: '10px' };
      case 'md':
        return { width: '56px', height: '56px', minWidth: '56px', fontSize: '2rem', radius: '14px' };
      case 'lg':
        return { width: '76px', height: '76px', minWidth: '76px', fontSize: '2.8rem', radius: '18px' };
      case 'xl':
        return { width: '104px', height: '104px', minWidth: '104px', fontSize: '3.6rem', radius: '22px' };
      case 'banner':
        return { width: '100%', height: '140px', minWidth: '100%', fontSize: '3.2rem', radius: '16px' };
      default:
        return { width: '56px', height: '56px', minWidth: '56px', fontSize: '2rem', radius: '14px' };
    }
  })();

  const hasValidImage = Boolean(food.image && !imgError);

  return (
    <div
      className={`food-media-wrap ${className}`}
      style={{
        position: 'relative',
        width: dimensions.width,
        height: dimensions.height,
        minWidth: dimensions.minWidth,
        borderRadius: dimensions.radius,
        overflow: 'hidden',
        background: nutritionTheme.bg,
        border: `1px solid ${nutritionTheme.border}`,
        boxShadow: `0 4px 14px ${nutritionTheme.glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      {hasValidImage ? (
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease'
          }}
        />
      ) : (
        <span
          style={{
            fontSize: dimensions.fontSize,
            lineHeight: 1,
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
            transform: 'translateY(-1px)'
          }}
        >
          {food.emoji || nutritionTheme.icon}
        </span>
      )}

      {/* Optional micro nutrition badge in bottom-right corner */}
      {showBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.75)',
            border: `1px solid ${nutritionTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            backdropFilter: 'blur(4px)'
          }}
          title={food.nutrition}
        >
          {nutritionTheme.icon}
        </div>
      )}
    </div>
  );
}
