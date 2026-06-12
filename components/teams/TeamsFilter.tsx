'use client';

import React from 'react';

interface TeamsFilterProps {
  groups: string[];
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
  sortBy: 'name' | 'group';
  onSortChange: (sort: 'name' | 'group') => void;
}

export default function TeamsFilter({
  groups,
  selectedGroups,
  onGroupsChange,
  sortBy,
  onSortChange,
}: TeamsFilterProps) {
  const handleGroupToggle = (group: string) => {
    if (selectedGroups.includes(group)) {
      onGroupsChange(selectedGroups.filter((g) => g !== group));
    } else {
      onGroupsChange([...selectedGroups, group]);
    }
  };

  const handleClearFilters = () => {
    onGroupsChange([]);
  };

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSortChange('name')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'name'
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-primary hover:border-primary'
            }`}
          >
            Alphabetical
          </button>
          <button
            onClick={() => onSortChange('group')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'group'
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-primary hover:border-primary'
            }`}
          >
            Group
          </button>
        </div>
      </div>

      {/* Group Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Filter by Group</h3>
          {selectedGroups.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => handleGroupToggle(group)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedGroups.includes(group)
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-primary hover:border-primary'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
