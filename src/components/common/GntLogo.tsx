import React from 'react';

interface GntLogoProps {
  variant?: 'full' | 'mark' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showSubtitle?: boolean;
}

export const GntLogo: React.FC<GntLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  // Height presets for different placements
  const sizeClasses = {
    sm: 'h-8 max-w-[140px]',
    md: 'h-10 max-w-[170px]',
    lg: 'h-14 max-w-[220px]',
    xl: 'h-20 max-w-[300px]',
    '2xl': 'h-28 max-w-[400px]',
  };

  const heightClass = sizeClasses[size] || 'h-10';

  if (variant === 'icon') {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden p-1 ${className}`}
        style={{ aspectRatio: '1/1' }}
        title="GIGA NEXUS TECHNOLOGY LLP"
      >
        <img
          src="/gnt-logo.png"
          alt="GNT Icon"
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/gnt-logo.png"
        alt="GIGA NEXUS TECHNOLOGY LLP"
        className={`${heightClass} w-auto object-contain select-none pointer-events-none transition-all duration-200`}
        draggable={false}
      />
    </div>
  );
};

