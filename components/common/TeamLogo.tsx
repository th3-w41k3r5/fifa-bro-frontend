'use client';

import React, { useState } from 'react';
import { Flag } from './Flag';

type TeamLogoSize = 'sm' | 'md' | 'lg';

interface TeamLogoProps {
  logoUrl?: string;
  flagCode: string;
  teamName: string;
  size?: TeamLogoSize;
}

const sizeMap: Record<TeamLogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 80,
};

export const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, flagCode, teamName, size = 'md' }) => {
  const [showFallback, setShowFallback] = useState(!logoUrl);

  const pixelSize = sizeMap[size];

  // Show flag if no logo or logo failed
  if (showFallback) {
    return (
      <div className="flex items-center justify-center">
        <span className="rounded-sm overflow-hidden">
          <Flag flagCode={flagCode} size={size} variant="square" alt={`${teamName} flag`} />
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center bg-surface rounded-lg overflow-hidden border border-border"
      style={{ width: pixelSize, height: pixelSize }}
      role="img"
      aria-label={`${teamName} logo`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={`${teamName} logo`}
        width={pixelSize}
        height={pixelSize}
        className="object-contain w-full h-full"
        onError={() => setShowFallback(true)}
      />
    </div>
  );
};

TeamLogo.displayName = 'TeamLogo';
