'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface TeamsSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function TeamsSearch({ searchTerm, onSearchChange }: TeamsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
      <input
        type="text"
        placeholder="Search by team name or FIFA code (e.g., France or FRA)..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
