import React from 'react';
import { Loader } from 'lucide-react';

type LoadingVariant = 'spinner' | 'skeleton' | 'pulse';

interface LoadingStateProps {
  variant?: LoadingVariant;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  message = 'Loading...',
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-dark bg-opacity-80 backdrop-blur-sm'
    : 'flex items-center justify-center py-12';

  if (variant === 'skeleton') {
    return (
      <div className={containerClass}>
        <div className="w-full max-w-md space-y-4">
          <div className="h-12 bg-surface-elevated rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 bg-surface-elevated rounded animate-pulse w-5/6" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 bg-surface-elevated rounded animate-pulse w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse" />
          {message && <p className="text-text-secondary text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  // spinner variant (default)
  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <Loader size={32} className="text-primary animate-spin" aria-label="Loading" />
        {message && <p className="text-text-secondary text-sm">{message}</p>}
      </div>
    </div>
  );
};

LoadingState.displayName = 'LoadingState';
