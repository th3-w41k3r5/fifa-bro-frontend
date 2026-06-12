'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

interface MatchesSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function MatchesSearch({ searchTerm, onSearchChange }: MatchesSearchProps) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by team, stadium, or city..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search hints */}
      <div className="mt-2 flex gap-2 flex-wrap text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span>Home Team</span>
        </span>
        <span className="flex items-center gap-1">
          <span>Away Team</span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          <span>Stadium</span>
        </span>
        <span className="flex items-center gap-1">
          <span>City</span>
        </span>
      </div>
    </div>
  );
}
