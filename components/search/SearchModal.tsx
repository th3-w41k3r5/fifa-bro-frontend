'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useSearch, type SearchResult } from '@/hooks/useSearch';
import type { MatchSummary, TeamSummary, GroupSummary, StorylineSummary } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams?: TeamSummary[];
  matches?: MatchSummary[];
  groups?: GroupSummary[];
  storylines?: StorylineSummary[];
}

const typeColors: Record<SearchResult['type'], string> = {
  team: 'bg-blue-500/10 text-blue-400',
  match: 'bg-purple-500/10 text-purple-400',
  group: 'bg-green-500/10 text-green-400',
  storyline: 'bg-yellow-500/10 text-yellow-400',
};

const typeLabels: Record<SearchResult['type'], string> = {
  team: 'Team',
  match: 'Match',
  group: 'Group',
  storyline: 'Storyline',
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  teams = [],
  matches = [],
  groups = [],
  storylines = [],
}) => {
  const search = useSearch({ teams, matches, groups, storylines });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResultClick = () => {
    search.setQuery('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-2xl">
          {/* Search Input */}
          <div className="relative p-6 border-b border-border flex items-center gap-3">
            <Search size={20} className="text-text-secondary flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Search teams, matches, groups, storylines..."
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              className="flex-1 bg-transparent text-text-primary placeholder-text-secondary outline-none text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 rounded px-2"
              aria-label="Search all content"
            />
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded transition-colors"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {search.query.trim() === '' ? (
              <div className="p-8 text-center text-text-secondary">
                <p>Start typing to search...</p>
              </div>
            ) : !search.hasResults ? (
              <div className="p-8 text-center text-text-secondary">
                <p>No results found for &quot;{search.query}&quot;</p>
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {/* Teams */}
                {search.results.team.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                      Teams
                    </h3>
                    <div className="space-y-2">
                      {search.results.team.map((result) => (
                        <Link key={result.id} href={result.href}>
                          <div
                            onClick={handleResultClick}
                            className="group p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {result.title}
                                </p>
                                <p className="text-xs text-text-secondary">{result.subtitle}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[result.type]}`}>
                                {typeLabels[result.type]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matches */}
                {search.results.match.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                      Matches
                    </h3>
                    <div className="space-y-2">
                      {search.results.match.map((result) => (
                        <Link key={result.id} href={result.href}>
                          <div
                            onClick={handleResultClick}
                            className="group p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {result.title}
                                </p>
                                <p className="text-xs text-text-secondary">{result.subtitle}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[result.type]}`}>
                                {typeLabels[result.type]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups */}
                {search.results.group.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                      Groups
                    </h3>
                    <div className="space-y-2">
                      {search.results.group.map((result) => (
                        <Link key={result.id} href={result.href}>
                          <div
                            onClick={handleResultClick}
                            className="group p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {result.title}
                                </p>
                                <p className="text-xs text-text-secondary">{result.subtitle}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[result.type]}`}>
                                {typeLabels[result.type]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storylines */}
                {search.results.storyline.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                      Storylines
                    </h3>
                    <div className="space-y-2">
                      {search.results.storyline.map((result) => (
                        <Link key={result.id} href={result.href}>
                          <div
                            onClick={handleResultClick}
                            className="group p-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {result.title}
                                </p>
                                <p className="text-xs text-text-secondary">{result.subtitle}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[result.type]}`}>
                                {typeLabels[result.type]}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Result Count */}
          {search.query.trim() !== '' && search.hasResults && (
            <div className="p-4 border-t border-border text-xs text-text-secondary text-center">
              {search.totalResults} result{search.totalResults !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </>
  );
};
