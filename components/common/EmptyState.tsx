import React from 'react';
import { AlertCircle, Search } from 'lucide-react';

type EmptyStateVariant = 'search' | 'error' | 'no-data';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  variant?: EmptyStateVariant;
}

const variantDefaults: Record<EmptyStateVariant, { icon: React.ComponentType<any>; title: string }> = {
  search: {
    icon: Search,
    title: 'No results found',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
  },
  'no-data': {
    icon: Search,
    title: 'No data available',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'no-data',
}) => {
  const defaults = variantDefaults[variant];
  const displayIcon = icon;
  const displayTitle = title || defaults.title;
  const DefaultIcon = defaults.icon;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="text-text-secondary opacity-50">
            {displayIcon || <DefaultIcon size={48} />}
          </div>
        </div>

        <h3 className="text-xl font-bold text-text-primary mb-2">{displayTitle}</h3>

        {description && <p className="text-text-secondary text-sm mb-6">{description}</p>}

        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center px-6 py-2 bg-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity duration-150"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
