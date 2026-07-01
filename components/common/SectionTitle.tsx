import React from 'react';
import { motion } from 'framer-motion';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, icon, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-3 mb-12 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="mt-1 text-accent flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl md:text-3xl font-fifa-semi tracking-[-0.01em] text-text-primary leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-text-secondary mt-2 max-w-2xl uppercase tracking-[0.08em]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
};

SectionTitle.displayName = 'SectionTitle';
