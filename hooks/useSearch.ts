import { useState, useMemo } from 'react';
import type { MatchSummary, TeamSummary, GroupSummary, StorylineSummary } from '@/types';

export interface SearchResult {
  type: 'match' | 'team' | 'group' | 'storyline';
  id: string | number;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResults {
  team: SearchResult[];
  match: SearchResult[];
  group: SearchResult[];
  storyline: SearchResult[];
}

interface UseSearchProps {
  teams?: TeamSummary[];
  matches?: MatchSummary[];
  groups?: GroupSummary[];
  storylines?: StorylineSummary[];
}

export function useSearch({
  teams = [],
  matches = [],
  groups = [],
  storylines = [],
}: UseSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Build searchable data
  const allData = useMemo(() => {
    const results: SearchResult[] = [];

    // Add teams
    teams.forEach((team) => {
      results.push({
        type: 'team',
        id: team.id || team.code,
        title: team.name,
        subtitle: team.code,
        href: `/teams/${team.code || team.id || team.name}`,
      });
    });

    // Add matches
    matches.forEach((match) => {
      results.push({
        type: 'match',
        id: match.id,
        title: `${match.homeTeam} vs ${match.awayTeam}`,
        subtitle: new Date(match.matchDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        href: `/matches/${match.id}`,
      });
    });

    // Add groups
    groups.forEach((group) => {
      results.push({
        type: 'group',
        id: group.code,
        title: group.name,
        subtitle: `Group ${group.code}`,
        href: `/groups/${group.code}`,
      });
    });

    // Add storylines
    storylines.forEach((storyline) => {
      results.push({
        type: 'storyline',
        id: storyline.id,
        title: storyline.title,
        subtitle: `Match ${storyline.matchId}`,
        href: `/matches/${storyline.matchId}`,
      });
    });

    return results;
  }, [teams, matches, groups, storylines]);

  // Search results
  const results: SearchResults = useMemo(() => {
    const grouped: SearchResults = {
      team: [],
      match: [],
      group: [],
      storyline: [],
    };

    if (!query.trim()) return grouped;

    const lowerQuery = query.toLowerCase();
    const filtered = allData.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );

    // Group by type
    filtered.forEach((item) => {
      grouped[item.type].push(item);
    });

    return grouped;
  }, [query, allData]);

  const hasResults = Object.values(results).some((arr) => arr.length > 0);

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    hasResults,
    totalResults: Object.values(results).reduce((acc, arr) => acc + arr.length, 0),
  };
}
