'use client';

import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  priority = true,
}) => {
  const sizes = {
    xs: { width: 36, height: 36, style: 'w-9 h-9' },
    sm: { width: 48, height: 48, style: 'w-12 h-12' },
    md: { width: 68, height: 68, style: 'w-16 h-16 md:w-[72px] md:h-[72px]' },
    lg: { width: 96, height: 96, style: 'w-24 h-24 md:w-28 md:h-28' },
    xl: { width: 130, height: 130, style: 'w-32 h-32 md:w-36 md:h-36' },
    '2xl': { width: 180, height: 180, style: 'w-44 h-44 md:w-48 md:h-48' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${s.style} ${className}`}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={s.width}
        height={s.height}
        className="w-full h-full object-contain select-none"
        priority={priority}
      />
    </div>
  );
};

export default Logo;
