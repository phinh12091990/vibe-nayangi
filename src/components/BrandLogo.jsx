/**
 * Custom Brand Logo Component for "Nay Ăn Gì - TRỢ LÝ BỮA ĂN • AI"
 * High-end vector badge featuring a stylized healthy food bowl, organic steam, and AI sparkle star.
 */
export default function BrandLogo({ size = 44, className = '', style = {} }) {
  return (
    <div
      className={`brand-logo-badge ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="brandLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bbf246" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="brandLogoDrop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(187, 242, 70, 0.45)" />
          </filter>
        </defs>

        {/* Premium Squircle Base with Glow */}
        <rect width="44" height="44" rx="13" fill="url(#brandLogoGrad)" filter="url(#brandLogoDrop)" />
        <rect
          x="0.75"
          y="0.75"
          width="42.5"
          height="42.5"
          rx="12.25"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* AI Sparkle Star (✦) Floating Above Bowl */}
        <path
          d="M31 7 C31 9.5 32.8 11.5 35 11.5 C32.8 11.5 31 13.5 31 16 C31 13.5 29.2 11.5 27 11.5 C29.2 11.5 31 9.5 31 7 Z"
          fill="#090d16"
        />

        {/* Steam Waves */}
        <path
          d="M15.5 16.5 C14.5 13.5 16.5 11.5 15.5 9"
          stroke="#090d16"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M21.5 15 C20.5 12 22.5 10 21.5 7.5"
          stroke="#090d16"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Modern Healthy Food Bowl */}
        {/* Soup Broth Layer */}
        <ellipse cx="21.5" cy="22" rx="12" ry="3.5" fill="#fef08a" />
        <ellipse cx="21.5" cy="22" rx="10" ry="2.2" fill="#f59e0b" />

        {/* Bowl Body (Obsidian Dark Charcoal) */}
        <path
          d="M9.5 22 C9.5 29.5 14.8 34 21.5 34 C28.2 34 33.5 29.5 33.5 22 Z"
          fill="#090d16"
        />
        
        {/* Bowl Foot / Stand */}
        <path
          d="M16.5 34 H26.5 C25.8 36 24 36.5 21.5 36.5 C19 36.5 17.2 36 16.5 34 Z"
          fill="#090d16"
        />

        {/* Nutrition Leaf Sprout inside Bowl */}
        <path
          d="M19.5 22 C19.5 19.5 22 18.5 23.5 18.5 C23.5 20.5 21.5 22 19.5 22 Z"
          fill="#22c55e"
        />
        <circle cx="25.5" cy="21.2" r="1.3" fill="#ef4444" />
        <circle cx="17.5" cy="21.5" r="1.1" fill="#ffffff" />

        {/* Bowl Light Reflection Arc */}
        <path
          d="M12 24.5 C13 28 16 31.5 20.5 32.5"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
