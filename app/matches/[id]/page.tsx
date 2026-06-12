'use client';

import React, { useEffect, useState } from 'react';
import { MatchSummary, StorylineSummary } from '@/types';
import { PageContainer, LoadingState, EmptyState } from '@/components';
import MatchHero from '@/components/matches/MatchHero';
import MatchEditorial from '@/components/matches/MatchEditorial';
import MatchDetails from '@/components/matches/MatchDetails';
import RelatedMatches from '@/components/matches/RelatedMatches';

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

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setMatchId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch data when matchId is available
  useEffect(() => {
    const fetchData = async () => {
      if (!matchId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch match details
        const matchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`);
        if (!matchResponse.ok) throw new Error('Failed to fetch match');
        const matchData = await matchResponse.json();

        // Fetch all matches for related matches
        const allMatchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`);
        if (!allMatchesResponse.ok) throw new Error('Failed to fetch matches');
        const allMatchesData = await allMatchesResponse.json();

        // Backend returns { success: true, data: { match, storylines, badges } }
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

  // Update document title
  useEffect(() => {
    if (data?.match) {
      document.title = `${data.match.homeTeam} vs ${data.match.awayTeam} | FIFA Bro`;
    }
  }, [data?.match]);

  if (loading) return <LoadingState />;
  if (error || !data)
    return <EmptyState title="Match not found" description={error || 'Unable to load match details.'} />;

  const { match, storylines } = data;

  // Get related matches (same group)
  const relatedMatches = match.groupCode
    ? allMatches.filter((m) => m.groupCode === match.groupCode && m.id !== match.id)
    : [];

  return (
    <PageContainer>
      <div className="space-y-12">
        {/* Hero Section */}
        <MatchHero match={match} badges={data.badges} />

        {/* Match Preview with Integrated Storylines */}
        {match.groupCode && (
          <MatchEditorial
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            group={match.groupCode}
            heroText={`${match.homeTeam} vs ${match.awayTeam}`}
            storylines={storylines}
          />
        )}

        {/* Match Details */}
        <MatchDetails match={match} />

        {/* Related Matches */}
        {relatedMatches.length > 0 && match.groupCode && (
          <RelatedMatches matches={relatedMatches} groupCode={match.groupCode} />
        )}
      </div>
    </PageContainer>
  );
}
