'use client';

import React from 'react';
import { MatchSummary } from '@/types';
import { SectionTitle } from '@/components';
import MatchCard from './MatchCard';

interface RelatedMatchesProps {
  matches: MatchSummary[];
  groupCode: string;
}

export default function RelatedMatches({ matches, groupCode }: RelatedMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-6">
      <SectionTitle title={`More Matches in Group ${groupCode}`} />

      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}
