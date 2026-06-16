'use client';

import React from 'react';

export type MatchCentreTab = 'timeline' | 'lineups' | 'info';

interface MatchCentreTabsProps {
  activeSection: MatchCentreTab;
  onChange: (section: MatchCentreTab) => void;
}

const tabs: Array<{ key: MatchCentreTab; label: string }> = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'lineups', label: 'Lineups' },
  { key: 'info', label: 'Match Details' },
];

export default function MatchCentreTabs({ activeSection, onChange }: MatchCentreTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Match centre sections"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.06] bg-black/25 p-1.5 sm:grid-cols-3"
    >
      {tabs.map((tab, index) => {
        const active = tab.key === activeSection;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-[0.08em] transition-all duration-200 ${
              index === 2 ? 'col-span-2 sm:col-span-1' : ''
            } ${
              active
                ? 'bg-accent text-dark shadow-[0_0_25px_rgba(0,183,255,0.25)] hover:-translate-y-0.5'
                : 'border border-white/[0.06] bg-white/[0.03] text-text-secondary hover:-translate-y-0.5 hover:border-white/[0.12] hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
