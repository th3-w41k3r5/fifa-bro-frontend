'use client';

import React, { useState, useMemo } from 'react';
import { MatchSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState } from '@/components';
import MatchesSearch from '@/components/matches/MatchesSearch';
import MatchesFilter from '@/components/matches/MatchesFilter';
import MatchesList from '@/components/matches/MatchesList';
import { useEffect } from 'react';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const BADGES = [
  'Opening Match',
  'Must Watch',
  'Featured',
  'Group Of Death',
  'Revenge Match',
  'Historic Clash',
  'Heavyweights',
  'Underdog Battle',
];
const STAGES = ['First Stage', 'Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Third Place', 'Final'];

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'featured'>('date');

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
        if (!response.ok) throw new Error('Failed to fetch matches');
        const data = await response.json();
        setMatches(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter logic
  const filteredMatches = useMemo(() => {
    let result = matches;

    // Search filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(lower) ||
          m.awayTeam.toLowerCase().includes(lower) ||
          m.stadium.toLowerCase().includes(lower) ||
          m.city.toLowerCase().includes(lower)
      );
    }

    // Group filter
    if (selectedGroups.length > 0) {
      result = result.filter((m) => m.groupCode && selectedGroups.includes(m.groupCode));
    }

    // Badge filter
    if (selectedBadges.length > 0) {
      result = result.filter((m) => m.badges?.some((b) => selectedBadges.includes(b.name)));
    }

    // Stage filter
    if (selectedStages.length > 0) {
      result = result.filter((m) => selectedStages.includes(m.stage));
    }

    // Sorting
    if (sortBy === 'date') {
      result.sort((a, b) => {
        const dateCompare = new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.kickoffTime.localeCompare(b.kickoffTime);
      });
    } else if (sortBy === 'featured') {
      result.sort((a, b) => {
        const aFeatured = a.badges?.some((b) => b.slug === 'opening-match' || b.slug === 'must-watch') ? 0 : 1;
        const bFeatured = b.badges?.some((b) => b.slug === 'opening-match' || b.slug === 'must-watch') ? 0 : 1;
        if (aFeatured !== bFeatured) return aFeatured - bFeatured;
        const dateCompare = new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.kickoffTime.localeCompare(b.kickoffTime);
      });
    }

    return result;
  }, [matches, searchTerm, selectedGroups, selectedBadges, selectedStages, sortBy]);

  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Error" description={error} />;

  return (
    <PageContainer
      header={{
        title: 'World Cup 2026 Fixtures',
        subtitle: 'Explore every match, venue, group, and kickoff from the tournament schedule.',
      }}
    >
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Matches" value={matches.length} />
          <SummaryCard label="Visible Results" value={filteredMatches.length} />
          <SummaryCard label="Groups" value={GROUPS.length} />
        </div>

        {/* Search */}
        <MatchesSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Filters & Sorting */}
        <div className="space-y-6">
          <MatchesFilter
            groups={GROUPS}
            badges={BADGES}
            stages={STAGES}
            selectedGroups={selectedGroups}
            selectedBadges={selectedBadges}
            selectedStages={selectedStages}
            onGroupsChange={setSelectedGroups}
            onBadgesChange={setSelectedBadges}
            onStagesChange={setSelectedStages}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Results count */}
        <div className="text-sm text-text-secondary">
          Showing {filteredMatches.length} of {matches.length} matches
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <MatchesList matches={filteredMatches} />
        ) : (
          <EmptyState title="No matches found" description="Try adjusting your filters or search term." />
        )}
      </div>
    </PageContainer>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.20)]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-text-secondary">{label}</p>
      <p className="mt-2 font-display text-4xl font-black text-accent">{value}</p>
    </div>
  );
}
