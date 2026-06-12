'use client';

import React from 'react';

interface MatchesFilterProps {
  groups: string[];
  badges: string[];
  stages: string[];
  selectedGroups: string[];
  selectedBadges: string[];
  selectedStages: string[];
  onGroupsChange: (groups: string[]) => void;
  onBadgesChange: (badges: string[]) => void;
  onStagesChange: (stages: string[]) => void;
  sortBy: 'date' | 'importance' | 'featured';
  onSortChange: (sort: 'date' | 'importance' | 'featured') => void;
}

export default function MatchesFilter({
  groups,
  badges,
  stages,
  selectedGroups,
  selectedBadges,
  selectedStages,
  onGroupsChange,
  onBadgesChange,
  onStagesChange,
  sortBy,
  onSortChange,
}: MatchesFilterProps) {
  const toggleGroup = (group: string) => {
    setSelected(selectedGroups, group, onGroupsChange);
  };

  const toggleBadge = (badge: string) => {
    setSelected(selectedBadges, badge, onBadgesChange);
  };

  const toggleStage = (stage: string) => {
    setSelected(selectedStages, stage, onStagesChange);
  };

  const setSelected = (current: string[], value: string, onChange: (values: string[]) => void) => {
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value));
    } else {
      onChange([...current, value]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sorting */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          {(['date', 'featured', 'importance'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => onSortChange(sort)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 capitalize ${
                sortBy === sort
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-border text-text-primary hover:border-primary'
              }`}
            >
              {sort === 'importance' ? 'Importance' : sort === 'featured' ? 'Featured First' : 'Date'}
            </button>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Group</h3>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all duration-200 ${
                selectedGroups.includes(group)
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-border text-text-primary hover:border-primary'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Badge</h3>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <button
              key={badge}
              onClick={() => toggleBadge(badge)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                selectedBadges.includes(badge)
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-border text-text-primary hover:border-primary'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Stage</h3>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => toggleStage(stage)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all duration-200 ${
                selectedStages.includes(stage)
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-border text-text-primary hover:border-primary'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
