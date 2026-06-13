import React from 'react';

type PageVariant = 'default' | 'wide' | 'narrow';
type PaddingSize = 'none' | 'sm' | 'md' | 'lg';

interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface PageContainerProps {
  children: React.ReactNode;
  variant?: PageVariant;
  header?: PageHeaderConfig;
  padding?: PaddingSize;
  showHeader?: boolean;
  className?: string;
}

const variantClasses: Record<PageVariant, string> = {
  default: 'max-w-7xl',
  wide: 'max-w-full',
  narrow: 'max-w-3xl',
};

const paddingClasses: Record<PaddingSize, string> = {
  none: 'p-0',
  sm: 'p-4 md:p-6',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-12',
};

const headerPaddingClasses: Record<PaddingSize, string> = {
  none: 'p-0',
  sm: 'px-4 py-4 md:px-6 md:py-5',
  md: 'px-6 py-5 md:px-8 md:py-6',
  lg: 'px-8 py-6 md:px-12 md:py-7',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  header,
  padding = 'md',
  showHeader = true,
  className = '',
}) => {
  const maxWidthClass = variantClasses[variant];
  const paddingClass = paddingClasses[padding];
  const headerPaddingClass = headerPaddingClasses[padding];

  return (
    <div className="min-h-screen w-full max-w-full bg-dark">
      {/* Page Header */}
      {showHeader && header && (
        <div className={`relative overflow-hidden border-b border-white/[0.07] bg-[#0b0f15] ${headerPaddingClass}`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,183,255,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_44%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

          <div className={`${maxWidthClass} relative z-10 mx-auto w-full max-w-full`}>
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-black text-text-primary md:text-4xl">
                  {header.title}
                </h1>
              </div>

              {(header.subtitle || header.action) && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  {header.subtitle && (
                    <p className="max-w-xl text-base font-semibold leading-relaxed text-text-secondary">
                      {header.subtitle}
                    </p>
                  )}

                  {header.action && (
                    <div className="shrink-0">
                      {header.action}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${paddingClass} w-full ${className}`}>
        <div className={`${maxWidthClass} mx-auto w-full max-w-full overflow-x-hidden`}>{children}</div>
      </main>
    </div>
  );
};

PageContainer.displayName = 'PageContainer';
