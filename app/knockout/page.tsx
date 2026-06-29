'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer, LoadingState, EmptyState } from '@/components';
import { KnockoutBracket } from '@/components/knockout';
import { useLiveMatches, applyLiveUpdateToMatches } from '@/hooks/useLiveMatches';
import type { MatchSummary } from '@/types';
import '@/styles/knockout.css';

const KNOCKOUT_MIN_ID = 73;

export default function KnockoutPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLiveMatches((payload) => {
    setMatches(prev => applyLiveUpdateToMatches(prev, payload));
  });

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

  const knockoutMatches = useMemo(
    () => matches.filter((m) => Number(m.id) >= KNOCKOUT_MIN_ID),
    [matches],
  );

  if (loading) {
    return (
      <PageContainer
        variant="wide"
        padding="none"
      >
        <LoadingState message="Loading knockout bracket..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        variant="wide"
        padding="none"
      >
        <EmptyState title="Failed to load bracket" description={error} variant="error" />
      </PageContainer>
    );
  }

  if (knockoutMatches.length === 0) {
    return (
      <PageContainer
        variant="wide"
        padding="none"
      >
        <EmptyState
          title="No knockout matches yet"
          description="Knockout stage matches will appear here once the group stage is complete."
          variant="no-data"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide" padding="none">
      <KnockoutBracket matches={knockoutMatches} />
    </PageContainer>
  );
}
