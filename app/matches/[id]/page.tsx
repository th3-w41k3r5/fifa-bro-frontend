'use client';

import React, { useEffect, useState } from 'react';
import { MatchSummary, StorylineSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState } from '@/components';
import MatchHero from '@/components/matches/MatchHero';
import MatchEditorial from '@/components/matches/MatchEditorial';
import MatchDetails from '@/components/matches/MatchDetails';
import MatchCentreSection from '@/components/matches/MatchCentreSection';
import RelatedMatches from '@/components/matches/RelatedMatches';
import { applyLiveUpdateToMatch, applyLiveUpdateToMatches, useLiveMatches } from '@/hooks/useLiveMatches';

interface MatchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface MatchDetailData {
  match: MatchSummary;
  storylines: StorylineSummary[];
  badges: Array<{ id: number; slug: string; name: string; icon: string; color: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [data, setData] = useState<MatchDetailData | null>(null);
  const [allMatches, setAllMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setMatchId(id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const matchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`);
        if (!matchResponse.ok) throw new Error('Failed to fetch match');
        const matchData = await matchResponse.json();

        const allMatchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
        if (!allMatchesResponse.ok) throw new Error('Failed to fetch matches');
        const allMatchesData = await allMatchesResponse.json();

        const matchDataPayload = matchData.data || matchData;

        setData({
          match: matchDataPayload.match,
          storylines: matchDataPayload.storylines || [],
          badges: matchDataPayload.badges || [],
        });
        setAllMatches(allMatchesData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matchId]);

  useEffect(() => {
    if (data?.match) {
      document.title = `${data.match.homeTeam} vs ${data.match.awayTeam} | FIFA Bro`;
    }
  }, [data?.match]);

  useLiveMatches((liveData) => {
    setData((previousData) => {
      if (!previousData) return previousData;

      return {
        ...previousData,
        match: applyLiveUpdateToMatch(previousData.match, liveData),
      };
    });

    setAllMatches((previousMatches) => applyLiveUpdateToMatches(previousMatches, liveData));
  });

  const match = data?.match;
  const storylines = data?.storylines ?? [];
  const badges = data?.badges ?? [];
  const fifaDetail = match?.fifaDetail;

  if (loading) {
    return (
      <PageContainer>
        <LoadingState fullScreen />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer>
        <EmptyState title="Match details are unavailable." variant="no-data" />
      </PageContainer>
    );
  }

  const relatedMatches = match.groupCode
    ? allMatches.filter((m) => m.groupCode === match.groupCode && m.id !== match.id)
    : [];

  return (
    <PageContainer>
      <div className="space-y-12">
        <MatchHero match={match} badges={badges} />

        {fifaDetail && (
          <MatchCentreSection
            fifaDetail={fifaDetail}
            homeTeamName={match.homeTeam}
            awayTeamName={match.awayTeam}
            homeFlagCode={match.homeFlagCode}
            awayFlagCode={match.awayFlagCode}
          />
        )}

        {match.groupCode && (
          <MatchEditorial
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            group={match.groupCode}
            heroText={`${match.homeTeam} vs ${match.awayTeam}`}
            storylines={storylines}
          />
        )}

        <MatchDetails match={match} />

        {relatedMatches.length > 0 && match.groupCode && (
          <RelatedMatches matches={relatedMatches} groupCode={match.groupCode} />
        )}
      </div>
    </PageContainer>
  );
}
