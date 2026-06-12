'use client';

import React from 'react';
import { MatchSummary } from '@/types';
import MatchCard from './MatchCard';

interface MatchesListProps {
  matches: MatchSummary[];
}

export default function MatchesList({ matches }: MatchesListProps) {
  const matchesByDate = matches.reduce(
    (acc, match) => {
      const date = match.matchDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(match);
      return acc;
    },
    {} as Record<string, MatchSummary[]>
  );

  const sortedDates = Object.keys(matchesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="space-y-12">
      {sortedDates.map((date) => {
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <section key={date} className="space-y-5">
            <div className="flex items-end justify-between gap-4 border-b border-white/[0.07] pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Match Day</p>
                <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-[0.08em] text-text-primary md:text-3xl">
                  {dateStr}
                </h2>
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs font-bold text-text-secondary">
                {matchesByDate[date].length} {matchesByDate[date].length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            <div className="relative pl-4 md:pl-6">
              <div className="absolute bottom-0 left-1 top-0 w-px bg-gradient-to-b from-accent/35 via-white/[0.08] to-transparent md:left-2" />
              <div className="space-y-4">
                {matchesByDate[date].map((match) => (
                  <div key={match.id} className="relative">
                    <div className="absolute -left-[18px] top-7 h-3 w-3 rounded-full border border-accent/40 bg-[#080b10] shadow-[0_0_16px_rgba(0,183,255,0.35)] md:-left-[22px]" />
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
