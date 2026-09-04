import React from 'react';

interface GntLogoProps {
  variant?: 'full' | 'mark' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const GntLogo: React.FC<GntLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  // Height presets
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const heightClass = sizeClasses[size] || 'h-10';

  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden p-1 ${className}`}
        style={{ aspectRatio: '1/1' }}
        title="GIGA NEXUS TECHNOLOGY"
      >
        <svg
          viewBox="0 0 620 310"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* g: Royal Blue */}
          <g fill="#1877F2">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 115 25 C 170.228 25 215 69.772 215 125 C 215 180.228 170.228 225 115 225 C 59.772 225 15 180.228 15 125 C 15 69.772 59.772 25 115 25 Z M 115 72 C 144.271 72 168 95.729 168 125 C 168 154.271 144.271 178 115 178 C 85.729 178 62 154.271 62 125 C 62 95.729 85.729 72 115 72 Z"
            />
            <path d="M 15 295 L 15 248 L 138 248 C 164 248 184 242 198 226 C 209 214 215 198 215 178 L 227 178 C 227 210 216 238 195 259 C 176 279 148 295 115 295 L 15 295 Z" />
          </g>

          {/* n: Solid Black */}
          <path
            fill="#0B0F19"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 250 85 L 298 85 L 298 120 C 312 94 336 78 370 78 C 408 78 422 100 422 138 L 422 248 L 372 248 L 372 150 C 372 128 362 118 344 118 C 322 118 300 134 300 162 L 300 248 L 250 248 Z"
          />

          {/* T: Black top & upper stem, Blue lower stem */}
          <g>
            <path fill="#0B0F19" d="M 432 25 L 612 25 L 612 85 L 432 85 Z" />
            <path fill="#0B0F19" d="M 492 85 L 552 85 L 552 205 L 492 205 Z" />
            <path fill="#1877F2" d="M 492 205 L 552 205 L 552 248 L 492 248 Z" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 620 300"
        className={`${heightClass} w-auto transition-transform`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* g: Royal Blue (#1877F2) */}
        <g fill="#1877F2">
          {/* Top circle of g with inner counter cutout */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 115 25 C 170.228 25 215 69.772 215 125 C 215 180.228 170.228 225 115 225 C 59.772 225 15 180.228 15 125 C 15 69.772 59.772 25 115 25 Z M 115 72 C 144.271 72 168 95.729 168 125 C 168 154.271 144.271 178 115 178 C 85.729 178 62 154.271 62 125 C 62 95.729 85.729 72 115 72 Z"
          />

          {/* Bottom hook / descender of g */}
          <path d="M 15 295 L 15 248 L 138 248 C 164 248 184 242 198 226 C 209 214 215 198 215 178 L 227 178 C 227 210 216 238 195 259 C 176 279 148 295 115 295 L 15 295 Z" />
        </g>

        {/* n: Solid Black */}
        <path
          fill="#0B0F19"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 250 85 L 298 85 L 298 120 C 312 94 336 78 370 78 C 408 78 422 100 422 138 L 422 248 L 372 248 L 372 150 C 372 128 362 118 344 118 C 322 118 300 134 300 162 L 300 248 L 250 248 Z"
        />

        {/* T: Top bar and upper stem in Black, lower stem in Blue */}
        <g>
          {/* T top bar */}
          <path fill="#0B0F19" d="M 432 25 L 612 25 L 612 85 L 432 85 Z" />
          {/* T upper stem (black) */}
          <path fill="#0B0F19" d="M 492 85 L 552 85 L 552 205 L 492 205 Z" />
          {/* T lower stem (blue) */}
          <path fill="#1877F2" d="M 492 205 L 552 205 L 552 248 L 492 248 Z" />
        </g>

        {/* Subtitle: GIGA NEXUS TECHNOLOGY LLP */}
        {showSubtitle && variant !== 'mark' && (
          <text
            x="250"
            y="280"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="19.5"
            fontWeight="800"
            fill="#0B0F19"
            letterSpacing="2"
          >
            GIGA NEXUS TECHNOLOGY LLP
          </text>
        )}
      </svg>
    </div>
  );
};
