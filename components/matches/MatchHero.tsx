'use client';

import React from 'react';
import { Badge, GoalScorer, MatchSummary } from '@/types';
import { Badge as FixtureBadge, TeamLogo } from '@/components';
import { MatchGoalScorers } from './MatchGoalScorers';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { getMatchStatusLabel } from '@/lib/matchStatus';

interface MatchHeroProps {
  match: MatchSummary;
  badges?: Badge[];
}

type FixtureBadgeVariant = 'opening-match' | 'must-watch' | 'featured' | 'group-of-death' | 'revenge-match';

const fixtureBadgeVariants = new Set<string>([
  'opening-match',
  'must-watch',
  'featured',
  'group-of-death',
  'revenge-match',
]);

function getFixtureBadgeVariant(slug: string): FixtureBadgeVariant {
  return (fixtureBadgeVariants.has(slug) ? slug : 'featured') as FixtureBadgeVariant;
}

export default function MatchHero({ match, badges = [] }: MatchHeroProps) {
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const dateStr =
    matchDate && !isNaN(matchDate.getTime())
      ? matchDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'Date TBD';
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;
  const statusLabel = getMatchStatusLabel(match);

  // Show goal scorers only for live or complete matches
  const homeGoals = match.goalScorers?.home ?? [];
  const awayGoals = match.goalScorers?.away ?? [];


  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#080b10] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] md:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,183,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">
            {match.groupCode ? `Group ${match.groupCode}` : 'World Cup'} • {match.stage}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-fifa-semi leading-[0.95] tracking-[-0.04em] text-text-primary text-[24px] md:text-4xl">
            {match.homeTeam} vs {match.awayTeam}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-text-secondary">
            Match details, venue information, and editorial context for this FIFA World Cup 2026 fixture.
          </p>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)] items-start gap-4 rounded-[24px] border border-white/[0.06] bg-black/20 p-4 md:p-6">
            <TeamBlock
              name={match.homeTeam}
              flagCode={match.homeFlagCode}
              label="Home"
              winner={homeWon}
              goalScorers={homeGoals}
              qualificationStatus={match.homeQualificationStatus}
            />
            <div className="md:self-center text-center">
              {hasScore ? (
                <div>
                  <p className="font-display text-4xl font-black text-accent md:text-4xl">
                    {match.homeScore}-{match.awayScore}
                  </p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">
                    {statusLabel}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-black text-accent md:text-4xl">VS</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">
                    {statusLabel}
                  </p>
                </div>
              )}
            </div>
            <TeamBlock
              name={match.awayTeam}
              flagCode={match.awayFlagCode}
              label="Away"
              align="right"
              winner={awayWon}
              goalScorers={awayGoals}
              qualificationStatus={match.awayQualificationStatus}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.035] p-5">
          <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.24em] text-text-secondary">
            Match Details
          </p>
          <DetailLine icon={<Clock size={16} />} label="Status" value={statusLabel} />
          <DetailLine icon={<Calendar size={16} />} label="Date" value={dateStr} />
          <DetailLine icon={<Clock size={16} />} label="Kickoff" value={match.kickoffTime || 'TBD'} />
          <DetailLine
            icon={<MapPin size={16} />}
            label="Venue"
            value={[match.stadium, match.city].filter(Boolean).join(', ')}
          />
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
              {badges.map((badge) => (
                <FixtureBadge
                  key={badge.id}
                  variant={getFixtureBadgeVariant(badge.slug)}
                  label={badge.name}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TeamBlock({
  name,
  flagCode,
  label,
  align = 'left',
  winner = false,
  goalScorers,
  qualificationStatus,
}: {
  name?: string;
  flagCode?: string;
  label: string;
  align?: 'left' | 'right';
  winner?: boolean;
  goalScorers?: GoalScorer[];
  qualificationStatus?: string;
}) {
  const showGoalScorers = goalScorers && goalScorers.length > 0;

  return (
    <div className={`flex min-w-0 flex-col gap-3 ${align === 'right' ? 'items-end text-right' : 'items-start'}`}>
      <TeamLogo flagCode={flagCode || (name?.toLowerCase().slice(0, 2) ?? 'un')} teamName={name || 'TBD'} size="lg" />
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-secondary">{label}</p>
      <div>
        <p
          className={`max-w-full truncate border-b-2 pb-1 text-xl font-black uppercase leading-none md:text-2xl ${
            winner ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
          }`}
        >
          {name || 'TBD'}
        </p>
        {qualificationStatus === 'CouldQualify' && (
          <div className={`mt-1.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-400/20">
              Provisional
            </span>
          </div>
        )}
        {showGoalScorers && (
          <div className={align === 'right' ? 'text-right' : ''}>
            <MatchGoalScorers goalScorers={goalScorers} />
          </div>
        )}
      </div>
    </div>
  );
}

function DetailLine({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="border-t border-white/[0.06] py-4 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-accent">{icon}</span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">{label}</p>
          <p className="mt-1 text-sm font-extrabold text-text-primary">{value || 'TBD'}</p>
        </div>
      </div>
    </div>
  );
}
