'use client';

import React, { useEffect, useState } from 'react';
import { MatchSummary, StandingRow, TeamSummary, FeaturedMatch, StorylineSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState, SectionTitle } from '@/components';
import { TeamCard, StandingsTable, GroupFixtures, FeaturedClashes, GroupStats, RelatedGroups } from '@/components';
import { applyLiveUpdateToMatches, useLiveMatches } from '@/hooks/useLiveMatches';

interface GroupDetailPageProps {
  params: Promise<{
    code: string;
  }>;
}

interface GroupDetailData {
  groupCode: string;
  groupName: string;
  note?: { title: string } | null;
  teams: TeamSummary[];
  standings: StandingRow[];
  matches: MatchSummary[];
  featuredMatches: FeaturedMatch[];
  storylines: StorylineSummary[];
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const [code, setCode] = useState<string | null>(null);
  const [data, setData] = useState<GroupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const { code } = await params;
      setCode(code.toUpperCase());
    };
    resolveParams();
  }, [params]);

  // Fetch data when code is available
  useEffect(() => {
    const fetchData = async () => {
      if (!code) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${code}`);
        if (!response.ok) throw new Error('Failed to fetch group');
        const jsonData = await response.json();

        if (!jsonData.success) {
          throw new Error(jsonData.error?.message || 'Failed to fetch group');
        }

        const groupData = jsonData.data;

        setData({
          groupCode: code,
          groupName: groupData.group?.name || `Group ${code}`,
          note: groupData.note || null,
          teams: groupData.teams || [],
          standings: groupData.standings || [],
          matches: groupData.matches || [],
          featuredMatches: groupData.featuredMatches || [],
          storylines: groupData.storylines || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  // Update document title
  useEffect(() => {
    if (data) {
      document.title = `${data.groupName} | FIFA Bro`;
    }
  }, [data]);

  useLiveMatches((liveData) => {
    setData((previousData) => {
      if (!previousData) return previousData;

      return {
        ...previousData,
        matches: applyLiveUpdateToMatches(previousData.matches, liveData),
        featuredMatches: previousData.featuredMatches.map((featured) => ({
          ...featured,
          match: applyLiveUpdateToMatches([featured.match], liveData)[0],
        })),
      };
    });
  });

  if (loading) return <LoadingState />;
  if (error || !data)
    return <EmptyState title="Group not found" description={error || 'Unable to load group details.'} />;

  // Prevent hydration mismatch by ensuring mounted on client before rendering date-dependent content
  if (!mounted) return <LoadingState />;

  const { groupCode, groupName, note, teams, standings, matches, featuredMatches, storylines } = data;

  // Use featured matches from API, fallback to filtering from matches with badges
  const displayedFeaturedMatches =
    featuredMatches.length > 0 ? featuredMatches : matches.filter((m) => m.badges && m.badges.length > 0);

  return (
    <PageContainer>
      <div className="space-y-12">
        {/* Group Header */}
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#080b10] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] md:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_48%)]" />

          <div className="relative z-10">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">World Cup Group</p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <span className="font-display text-7xl font-black leading-[0.82] text-text-primary md:text-8xl">
                  {groupCode}
                </span>
                <div className="pb-1">
                  <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-5xl">{groupName}</h1>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-text-secondary">
                    {teams.length} teams • {matches.length} matches
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
                <GroupMetric label="Teams" value={teams.length} />
                <GroupMetric label="Matches" value={matches.length} />
                <GroupMetric label="Stories" value={storylines.length} />
              </div>
            </div>
          </div>

          {/* Special Designation with Featured Match Info */}
          {(note?.title || storylines.length > 0) && (
            <div className="relative z-10 mt-8 rounded-[22px] border border-yellow-300/20 bg-yellow-300/[0.07] p-5">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-yellow-200">
                Special Designation
              </p>
              {note?.title && <h2 className="mb-4 text-2xl font-black text-text-primary">{note.title}</h2>}

              {/* Featured Match Storylines Brief */}
              {storylines.length > 0 && (
                <div className="space-y-3">
                  {storylines.slice(0, 2).map((storyline) => (
                    <div key={storyline.id} className="border-l-2 border-yellow-300/50 pl-4">
                      <p className="text-sm font-semibold text-text-primary">{storyline.title}</p>
                      <p className="text-sm text-text-secondary mt-1">{storyline.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Group Stats */}
        {teams.length > 0 && (
          <>
            <div>
              <SectionTitle title="Group Overview" />
              <GroupStats
                teams={teams.length}
                matches={matches.length}
                featuredMatches={displayedFeaturedMatches.length}
                storylines={data.storylines.length}
              />
            </div>
          </>
        )}

        {/* Teams Section */}
        {teams.length > 0 && (
          <div>
            <SectionTitle title="Teams" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <TeamCard key={team.id ? String(team.id) : team.code || team.name} team={team} />
              ))}
            </div>
          </div>
        )}

        {/* Standings Section */}
        {standings.length > 0 && (
          <div>
            <SectionTitle title="Standings" />
            <StandingsTable standings={standings} teams={teams} />
          </div>
        )}

        {/* Featured Clashes */}
        {displayedFeaturedMatches.length > 0 && (
          <div>
            <FeaturedClashes matches={displayedFeaturedMatches} />
          </div>
        )}

        {/* All Fixtures */}
        {matches.length > 0 && (
          <div>
            <SectionTitle title="All Matches" />
            <GroupFixtures matches={matches} />
          </div>
        )}

        {/* Related Groups */}
        <RelatedGroups currentCode={groupCode} />
      </div>
    </PageContainer>
  );
}

function GroupMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 text-center">
      <p className="font-display text-3xl font-black text-accent">{value}</p>
      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">{label}</p>
    </div>
  );
}
