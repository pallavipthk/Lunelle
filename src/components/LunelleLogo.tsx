import React from 'react';

interface LunelleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  onClick?: () => void;
  className?: string;
  light?: boolean;
}

export const LunelleLogo: React.FC<LunelleLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  onClick,
  className = '',
  light = false
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-9 h-9 rounded-2xl',
    lg: 'w-11 h-11 rounded-2xl'
  }[size];

  const svgSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5'
  }[size];

  const titleSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size];

  const subtitleSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]'
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 3D Botanical Badge */}
      <div className={`${iconSizeClasses} bg-gradient-to-br from-[#3D6351] to-[#2B4438] flex items-center justify-center text-[#F6EACB] shadow-[0_6px_16px_-3px_rgba(52,83,68,0.25),inset_0_2px_4px_rgba(255,255,255,0.3)] shrink-0 border border-[#A9BFA6]/40`}>
        <svg viewBox="0 0 24 24" fill="none" className={`${svgSizeClasses} text-[#F6EACB]`} stroke="currentColor" strokeWidth="2.2">
          <path d="M12 2C7 2 3 7 3 12C3 17 7 21 12 21C12 16 16 12 21 12C21 7 17 2 12 2Z" />
          <path d="M12 12L3 21" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="text-left flex flex-col justify-center leading-none">
        <span className={`font-serif font-bold tracking-tight block ${titleSizeClasses} ${light ? 'text-white' : 'text-[#345344]'}`}>
          Lunelle
        </span>
        {showSubtitle && (
          <span className={`tracking-wider uppercase font-semibold mt-0.5 ${subtitleSizeClasses} ${light ? 'text-[#DFE8DA]' : 'text-[#A9BFA6]'}`}>
            your health story
          </span>
        )}
      </div>
    </div>
  );
};
