'use client';

import React, { memo, useMemo } from 'react';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string; // Image source
  size?: number; // Size for the image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
}

const AppLogo = memo(function AppLogo({
  src = '/assets/images/app_logo.png',
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  // Memoize className calculation
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      <AppImage
        src={src}
        alt="Logo"
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ width: size, height: size }}
        priority={true}
        unoptimized={src.endsWith('.svg')}
      />
    </div>
  );
});

export default AppLogo;
