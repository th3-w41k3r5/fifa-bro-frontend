'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import type { MatchSummary, TeamSummary, GroupSummary, StorylineSummary } from '@/types';

interface SearchBarProps {
  teams?: TeamSummary[];
  matches?: MatchSummary[];
  groups?: GroupSummary[];
  storylines?: StorylineSummary[];
}

const typeColors: Record<string, string> = {
  team: 'bg-blue-500/10 text-blue-400',
  match: 'bg-purple-500/10 text-purple-400',
  group: 'bg-green-500/10 text-green-400',
  storyline: 'bg-yellow-500/10 text-yellow-400',
};

export const SearchBar: React.FC<SearchBarProps> = ({
  teams = [],
  matches = [],
  groups = [],
  storylines = [],
}) => {
  const search = useSearch({ teams, matches, groups, storylines });
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    search.setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="relative w-64">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={search.query}
          onChange={(e) => {
            search.setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
          aria-label="Search teams, matches, groups, and storylines"
          aria-controls="search-dropdown"
        />
      </div>

      {/* Dropdown Results */}
      {showDropdown && search.query.trim() !== '' && (
        <div
          id="search-dropdown"
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {!search.hasResults ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              No results for &quot;{search.query}&quot;
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Teams */}
              {search.results.team.slice(0, 3).map((result) => (
                <Link key={`team-${result.id}`} href={result.href}>
                  <div
                    onClick={handleResultClick}
                    className="p-2 rounded hover:bg-surface/80 transition-colors cursor-pointer text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-text-primary">{result.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${typeColors.team}`}>
                        Team
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Matches */}
              {search.results.match.slice(0, 3).map((result) => (
                <Link key={`match-${result.id}`} href={result.href}>
                  <div
                    onClick={handleResultClick}
                    className="p-2 rounded hover:bg-surface/80 transition-colors cursor-pointer text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-text-primary text-xs">{result.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${typeColors.match}`}>
                        Match
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Groups */}
              {search.results.group.slice(0, 3).map((result) => (
                <Link key={`group-${result.id}`} href={result.href}>
                  <div
                    onClick={handleResultClick}
                    className="p-2 rounded hover:bg-surface/80 transition-colors cursor-pointer text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-text-primary">{result.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${typeColors.group}`}>
                        Group
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Storylines */}
              {search.results.storyline.slice(0, 3).map((result) => (
                <Link key={`storyline-${result.id}`} href={result.href}>
                  <div
                    onClick={handleResultClick}
                    className="p-2 rounded hover:bg-surface/80 transition-colors cursor-pointer text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-text-primary text-xs">{result.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${typeColors.storyline}`}>
                        Story
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* View all results */}
              {search.totalResults > 12 && (
                <div className="border-t border-border pt-2 text-center">
                  <p className="text-xs text-primary font-semibold">
                    {search.totalResults - 12} more results...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
