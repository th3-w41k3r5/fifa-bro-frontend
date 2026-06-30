'use client';

import React, { useState } from 'react';

type FlagVariant = 'rounded' | 'square';
type FlagSize = 'sm' | 'md' | 'lg';

interface FlagProps {
  flagCode: string;
  size?: FlagSize;
  variant?: FlagVariant;
  alt?: string;
}

const sizeMap: Record<FlagSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

const radiusMap: Record<FlagVariant, string> = {
  rounded: '',
  square: '',
};

export const Flag: React.FC<FlagProps> = ({ flagCode, size = 'md', variant = 'rounded', alt }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const pixelSize = sizeMap[size];
  const radiusClass = radiusMap[variant];

  // Use flag-icons from jsdelivr (CORS-friendly)
  const flagUrl = `https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${flagCode.toLowerCase()}.svg`;

  if (flagCode.toLowerCase() === 'un' || flagCode.toLowerCase() === 'tbd' || !flagCode) {
    return (
      <div
        className={`flex items-center justify-center ${radiusClass} bg-white/5 border border-dashed border-white/20 rounded`}
        style={{ width: pixelSize, height: pixelSize }}
        role="img"
        aria-label={alt || `TBD Flag`}
      >
        <span className="text-[10px] font-bold text-white/40">?</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center ${radiusClass} bg-surface border border-border rounded`}
        style={{ width: pixelSize, height: pixelSize }}
        role="img"
        aria-label={alt || `Flag for ${flagCode}`}
      >
        <span className="text-xs font-bold text-text-secondary">{flagCode.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl}
      alt={alt || `Flag for ${flagCode}`}
      width={pixelSize}
      height={pixelSize}
      className={`${radiusClass} object-cover transition-opacity duration-150 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setIsLoading(false);
        setHasError(true);
      }}
    />
  );
};

Flag.displayName = 'Flag';
