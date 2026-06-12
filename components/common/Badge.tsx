import React from 'react';
import { Flag, Star, Flame, Skull, Target } from 'lucide-react';

type BadgeVariant = 'opening-match' | 'must-watch' | 'featured' | 'group-of-death' | 'revenge-match';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: BadgeSize;
}

interface BadgeConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  bgClass: string;
  textClass: string;
}

const badgeConfig: Record<BadgeVariant, BadgeConfig> = {
  'opening-match': {
    icon: Flag,
    bgClass: 'bg-primary',
    textClass: 'text-dark',
  },
  'must-watch': {
    icon: Star,
    bgClass: 'bg-secondary',
    textClass: 'text-dark',
  },
  'featured': {
    icon: Flame,
    bgClass: 'bg-danger',
    textClass: 'text-dark',
  },
  'group-of-death': {
    icon: Skull,
    bgClass: 'bg-warning',
    textClass: 'text-dark',
  },
  'revenge-match': {
    icon: Target,
    bgClass: 'bg-secondary',
    textClass: 'text-dark',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'md' }) => {
  const config = badgeConfig[variant];
  const sizeClass = sizeClasses[size];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center rounded-full font-semibold transition-all duration-150 ${config.bgClass} ${config.textClass} ${sizeClass}`}
      role="status"
      aria-label={`${label} badge`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
};

Badge.displayName = 'Badge';
