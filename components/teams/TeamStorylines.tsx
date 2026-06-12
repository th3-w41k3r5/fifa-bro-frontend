'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { MatchSummary, StorylineSummary } from '@/types';
import { Flag } from '@/components';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

function formatMatchDate(dateString?: string): string {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface TeamStorylinesProps {
  storylines: StorylineSummary[];
  matches: MatchSummary[];
}

export default function TeamStorylines({ storylines, matches }: TeamStorylinesProps) {
  const sortedStorylines = useMemo(() => {
    return storylines
      .map((storyline) => ({
        storyline,
        match: matches.find((match) => String(match.id) === String(storyline.matchId)),
      }))
      .filter((item): item is { storyline: StorylineSummary; match: MatchSummary } => Boolean(item.match))
      .sort((a, b) => {
        const aDate = new Date(`${a.match.matchDate}T${a.match.kickoffTime}Z`).getTime();
        const bDate = new Date(`${b.match.matchDate}T${b.match.kickoffTime}Z`).getTime();
        if (aDate !== bDate) return aDate - bDate;
        return b.storyline.importance - a.storyline.importance;
      })
      .slice(0, 6);
  }, [storylines, matches]);

  return (
    <div className="grid gap-4">
      {sortedStorylines.map(({ storyline, match }) => (
        <StorylineCard key={storyline.id} storyline={storyline} match={match} />
      ))}
    </div>
  );
}

function StorylineCard({ storyline, match }: { storyline: StorylineSummary; match: MatchSummary }) {
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;

  return (
    <Link href={`/matches/${storyline.matchId}`} className="block">
      <article className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_24px_70px_rgba(0,183,255,0.10)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(0,183,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-4 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)] items-center gap-2">
            <TeamName name={match.homeTeam} flagCode={match.homeFlagCode} winner={homeWon} />
            <span className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-accent">
              {hasScore ? `${match.homeScore}-${match.awayScore}` : 'VS'}
            </span>
            <TeamName name={match.awayTeam} flagCode={match.awayFlagCode} align="right" winner={awayWon} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-accent/70" />
              {formatMatchDate(match.matchDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} className="text-accent/70" />
              {match.kickoffTime || 'TBA'}
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.08] text-accent">
            <TrendingUp size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-black text-text-primary">{storyline.title}</h3>
              <span className="rounded-full border border-accent/20 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent">
                {storyline.importance}% importance
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-text-secondary">
              {storyline.description}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TeamName({
  name,
  flagCode,
  align = 'left',
  winner = false,
}: {
  name: string;
  flagCode?: string;
  align?: 'left' | 'right';
  winner?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${align === 'right' ? 'justify-end text-right' : 'justify-start'}`}
    >
      {align === 'left' && flagCode && <Flag flagCode={flagCode} size="sm" />}
      <span
        className={`truncate border-b-2 pb-1 text-sm font-extrabold ${
          winner ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
        }`}
      >
        {name}
      </span>
      {align === 'right' && flagCode && <Flag flagCode={flagCode} size="sm" />}
    </div>
  );
}
