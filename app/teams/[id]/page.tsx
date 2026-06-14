'use client';

import React, { useEffect, useState } from 'react';
import { MatchSummary, StandingRow, TeamSummary, FeaturedMatch, StorylineSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState, SectionTitle } from '@/components';
import {
  TeamHero,
  TeamOverview,
  TeamFixtures,
  FeaturedMatches,
  TeamStandingsTable,
  TeamGroupMembers,
  TeamStorylines,
} from '@/components/teams';
import { applyLiveUpdateToMatches, useLiveMatches } from '@/hooks/useLiveMatches';

interface TeamDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface TeamDetailData {
  team: TeamSummary;
  groupName: string;
  standings: StandingRow | null;
  groupStandings: StandingRow[];
  matches: MatchSummary[];
  featuredMatches: FeaturedMatch[];
  storylines: StorylineSummary[];
  groupTeams: TeamSummary[];
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [data, setData] = useState<TeamDetailData | null>(null);
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
      const { id } = await params;
      setId(decodeURIComponent(id));
    };
    resolveParams();
  }, [params]);

  // Fetch data when id is available
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`);
        if (!response.ok) throw new Error('Failed to fetch team');
        const jsonData = await response.json();

        if (!jsonData.success) {
          throw new Error(jsonData.error?.message || 'Failed to fetch team');
        }

        const teamData = jsonData.data;

        // Parse featured matches
        const featuredMatches: FeaturedMatch[] = [];
        if (Array.isArray(teamData.matches)) {
          teamData.matches.forEach((match: MatchSummary, idx: number) => {
            // Highlight matches with badges, storylines, or heroText
            if ((match.badges && match.badges.length > 0) || (match.storylines && match.storylines.length > 0)) {
              featuredMatches.push({
                matchId: match.id,
                displayOrder: idx,
                match,
              });
            }
          });
        }

        setData({
          team: teamData.team || {},
          groupName: teamData.group?.name || 'Group Unknown',
          standings: teamData.standings || null,
          groupStandings: teamData.groupStandings || [],
          matches: teamData.matches || [],
          featuredMatches,
          storylines: teamData.storylines || [],
          groupTeams: teamData.groupTeams || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update page title
  useEffect(() => {
    if (data?.team?.name) {
      document.title = `${data.team.name} | FIFA Bro`;
    }
  }, [data?.team?.name]);

  useLiveMatches((liveData) => {
    setData((previousData) => {
      if (!previousData) return previousData;

      const matches = applyLiveUpdateToMatches(previousData.matches, liveData);

      return {
        ...previousData,
        matches,
        featuredMatches: previousData.featuredMatches.map((featured) => ({
          ...featured,
          match: applyLiveUpdateToMatches([featured.match], liveData)[0],
        })),
      };
    });
  });

  if (!mounted) return null;

  if (loading) return <LoadingState />;
  if (error || !data?.team)
    return <EmptyState title="Team not found" description={error || 'Unable to load team details.'} />;

  const { team, groupName, standings, groupStandings, matches, featuredMatches, storylines, groupTeams } = data;
  const standingsWithPosition =
    standings && !standings.position
      ? {
          ...standings,
          position:
            groupStandings.findIndex((row) => {
              const rowName = row.teamName?.toLowerCase();
              const teamName = team.name?.toLowerCase();

              return rowName === teamName || row.teamCode === team.code;
            }) + 1 || undefined,
        }
      : standings;

  return (
    <PageContainer>
      <div className="space-y-12">
        {/* Team Hero */}
        <TeamHero team={team} groupName={groupName} />

        {/* Team Overview */}
        {standingsWithPosition && (
          <TeamOverview
            standings={standingsWithPosition}
            groupName={groupName}
            matchCount={matches.length}
            featuredMatchCount={featuredMatches.length}
            storylineCount={storylines.length}
          />
        )}

        {/* Featured Matches */}
        {featuredMatches.length > 0 && (
          <div>
            <SectionTitle title="Featured Matches" />
            <FeaturedMatches matches={featuredMatches} />
          </div>
        )}

        {/* All Fixtures */}
        {matches.length > 0 && (
          <div>
            <SectionTitle title="All Fixtures" />
            <TeamFixtures fixtures={matches} />
          </div>
        )}

        {/* Group Standing */}
        {groupStandings.length > 0 && (
          <div>
            <SectionTitle title="Group Standing" />
            <TeamStandingsTable standings={groupStandings} highlightTeam={team.name} teams={groupTeams} />
          </div>
        )}

        {/* Group Members */}
        {groupTeams.length > 0 && (
          <div>
            <SectionTitle title={`${groupName} Members`} />
            <TeamGroupMembers teams={groupTeams} excludeTeam={team.name} />
          </div>
        )}

        {/* Storylines */}
        {storylines.length > 0 && (
          <div>
            <SectionTitle title="Storylines" />
            <TeamStorylines storylines={storylines} matches={matches} />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
