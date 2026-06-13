'use client';

import React from 'react';
import Link from 'next/link';
import { FeaturedMatch } from '@/types';
import { Badge, TeamLogo } from '@/components';
import { Clock, MapPin } from 'lucide-react';
import { getMatchStatusLabel } from '@/lib/matchStatus';

interface FeaturedMatchesProps {
  matches: FeaturedMatch[];
}

type FixtureBadgeVariant = 'opening-match' | 'must-watch' | 'featured' | 'group-of-death' | 'revenge-match';

const fixtureBadgeVariants = new Set<string>([
  'opening-match',
  'must-watch',
  'featured',
  'group-of-death',
  'revenge-match',
]);

export default function FeaturedMatches({ matches }: FeaturedMatchesProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {matches.slice(0, 6).map((featured) => (
        <FeaturedMatchCard key={featured.matchId} featured={featured} />
      ))}
    </div>
  );
}

function FeaturedMatchCard({ featured }: { featured: FeaturedMatch }) {
  const match = featured.match;
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const dateStr =
    matchDate && !isNaN(matchDate.getTime())
      ? matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'TBD';
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;
  const statusLabel = getMatchStatusLabel(match);

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <article className="group relative overflow-hidden rounded-[24px] border border-accent/25 bg-[#080b10] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_70px_rgba(0,183,255,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(0,183,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_45%)] opacity-80 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">Featured Match</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-text-secondary">
              <Clock size={13} className="text-accent/70" />
              {dateStr} • {match.kickoffTime}
            </p>
          </div>
          {match.badges && match.badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {match.badges.slice(0, 1).map((badge) => (
                <Badge
                  key={badge.id}
                  label={badge.name}
                  variant={(fixtureBadgeVariants.has(badge.slug) ? badge.slug : 'featured') as FixtureBadgeVariant}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-3">
          <TeamSide name={match.homeTeam} flagCode={match.homeFlagCode} winner={homeWon} />
          <div className="text-center">
            {hasScore ? (
              <span className="font-display text-2xl font-black text-accent">
                {match.homeScore}-{match.awayScore}
              </span>
            ) : (
              <span className="text-xs font-black uppercase tracking-[0.18em] text-accent">VS</span>
            )}
          </div>
          <TeamSide name={match.awayTeam} flagCode={match.awayFlagCode} align="right" winner={awayWon} />
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4 text-sm font-semibold text-text-secondary">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
            {statusLabel}
          </span>
          <MapPin size={14} className="text-accent/70" />
          <span>{[match.stadium, match.city].filter(Boolean).join(', ')}</span>
        </div>
      </article>
    </Link>
  );
}

function TeamSide({
  name,
  flagCode,
  align = 'left',
  winner = false,
}: {
  name?: string;
  flagCode?: string;
  align?: 'left' | 'right';
  winner?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'justify-end text-right' : 'justify-start'}`}
    >
      {align === 'left' && (
        <TeamLogo flagCode={flagCode || (name?.toLowerCase().slice(0, 2) ?? 'un')} teamName={name || 'TBD'} size="sm" />
      )}
      <span
        className={`truncate border-b-2 pb-1 text-base font-extrabold ${
          winner ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
        }`}
      >
        {name || 'TBD'}
      </span>
      {align === 'right' && (
        <TeamLogo flagCode={flagCode || (name?.toLowerCase().slice(0, 2) ?? 'un')} teamName={name || 'TBD'} size="sm" />
      )}
    </div>
  );
}
