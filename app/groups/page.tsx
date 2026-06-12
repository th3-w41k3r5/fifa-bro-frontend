'use client';

import React, { useEffect, useState } from 'react';
import { GroupSummary, MatchSummary } from '@/types';
import { PageContainer, SectionTitle, LoadingState, EmptyState } from '@/components';
import { GroupGrid } from '@/components';

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all groups
        const groupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`);
        if (!groupsResponse.ok) throw new Error('Failed to fetch groups');
        const groupsData = await groupsResponse.json();

        // Fetch all matches to build stats
        const matchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
        if (!matchesResponse.ok) throw new Error('Failed to fetch matches');
        const matchesData = await matchesResponse.json();

        setGroups(groupsData.data || []);
        setMatches(matchesData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update page title
  useEffect(() => {
    document.title = 'Groups | FIFA Bro';
  }, []);

  if (loading) return <LoadingState />;
  if (error || groups.length === 0)
    return <EmptyState title="Groups not found" description={error || 'Unable to load groups.'} />;

  // Build stats
  const matchCounts: Record<string, number> = {};
  const groupTeams: Record<string, Array<{ name: string; flagCode?: string }>> = {};
  const groupNotes: Record<string, string> = {};

  // Count matches per group and gather teams
  matches.forEach((match) => {
    if (match.groupCode) {
      matchCounts[match.groupCode] = (matchCounts[match.groupCode] || 0) + 1;

      // Collect unique teams with flag codes
      if (!groupTeams[match.groupCode]) {
        groupTeams[match.groupCode] = [];
      }
      
      const homeTeamExists = groupTeams[match.groupCode].some((t) => t.name === match.homeTeam);
      if (!homeTeamExists) {
        groupTeams[match.groupCode].push({
          name: match.homeTeam,
          flagCode: match.homeFlagCode,
        });
      }
      
      const awayTeamExists = groupTeams[match.groupCode].some((t) => t.name === match.awayTeam);
      if (!awayTeamExists) {
        groupTeams[match.groupCode].push({
          name: match.awayTeam,
          flagCode: match.awayFlagCode,
        });
      }
    }

    // Extract featured match badge as note
    if (match.badges && match.badges.length > 0 && match.groupCode && !groupNotes[match.groupCode]) {
      const specialBadge = match.badges.find((b) => b.name.toLowerCase().includes('death'));
      if (specialBadge) {
        groupNotes[match.groupCode] = specialBadge.name;
      }
    }
  });

  return (
    <PageContainer
      header={{
        title: 'World Cup Groups',
        subtitle: 'Explore every group, qualification path, standings, and fixtures.',
      }}
    >
      <div className="space-y-12">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Groups" value={groups.length} />
          <SummaryCard label="Group Matches" value={matches.filter((match) => match.groupCode).length} />
          <SummaryCard
            label="Teams Tracked"
            value={Object.values(groupTeams).reduce((total, teams) => total + teams.length, 0)}
          />
        </div>

        {/* Groups Grid */}
        <div>
          <SectionTitle title="12 Groups" />
          <GroupGrid groups={groups} matchCounts={matchCounts} groupTeams={groupTeams} groupNotes={groupNotes} />
        </div>
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
