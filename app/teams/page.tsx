'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { TeamSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState } from '@/components';
import TeamsSearch from '@/components/teams/TeamsSearch';
import TeamsFilter from '@/components/teams/TeamsFilter';
import TeamsGrid from '@/components/teams/TeamsGrid';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'group'>('name');

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    let result = teams;

    // Search filter - search by team name or FIFA code
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          (t.fifaCode && t.fifaCode.toLowerCase().includes(lower)) ||
          (t.code && t.code.toLowerCase().includes(lower))
      );
    }

    // Group filter
    if (selectedGroups.length > 0) {
      result = result.filter((t) => t.groupCode && selectedGroups.includes(t.groupCode));
    }

    // Sorting
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'group') {
      result.sort((a, b) => {
        const groupCompare = (a.groupCode || '').localeCompare(b.groupCode || '');
        if (groupCompare !== 0) return groupCompare;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [teams, searchTerm, selectedGroups, sortBy]);

  // Update page title
  useEffect(() => {
    document.title = 'Teams | FIFA Bro';
  }, []);

  if (loading) return <LoadingState />;
  if (error || teams.length === 0)
    return <EmptyState title="Teams not found" description={error || 'Unable to load teams.'} />;

  return (
    <PageContainer
      header={{
        title: 'World Cup 2026 Teams',
        subtitle: 'Browse all participating nations by group, code, and team profile.',
      }}
    >
      <div className="space-y-12">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Teams" value={teams.length} />
          <SummaryCard label="Visible Results" value={filteredTeams.length} />
          <SummaryCard label="Groups" value={GROUPS.length} />
        </div>

        {/* Search and Filters */}
        <div className="space-y-6">
          <TeamsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <TeamsFilter
                groups={GROUPS}
                selectedGroups={selectedGroups}
                onGroupsChange={setSelectedGroups}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{filteredTeams.length}</span> of{' '}
            <span className="font-semibold text-text-primary">{teams.length}</span> teams
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <TeamsGrid teams={filteredTeams} />
        ) : (
          <EmptyState
            title="No teams found"
            description={
              searchTerm || selectedGroups.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'Unable to load any teams.'
            }
          />
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
