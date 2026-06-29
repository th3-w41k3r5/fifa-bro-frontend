'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MatchSummary } from '@/types';
import { TeamLogo } from '@/components';
import { Clock, MapPin } from 'lucide-react';
import { getMatchStatusLabel } from '@/lib/matchStatus';

interface MatchCardProps {
  match: MatchSummary;
}

export default function MatchCard({ match }: MatchCardProps) {
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const dateStr =
    matchDate && !isNaN(matchDate.getTime())
      ? matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBD';
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;
  const statusLabel = getMatchStatusLabel(match);

  return (
    <Link href={`/matches/${match.id}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#080b10] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition-all duration-300 hover:border-accent/35 hover:shadow-[0_24px_70px_rgba(0,183,255,0.10)] md:p-5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,183,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-1 w-1 rounded-full bg-accent/60" />
              <span>{match.stage}</span>
            </div>
            {match.groupCode && (
              <span className="rounded-full border border-accent/20 bg-accent/[0.08] px-2 py-1 text-accent">
                Group {match.groupCode}
              </span>
            )}
            <span className="ml-auto">{dateStr}</span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-3 py-4">
            <div className="flex min-w-0 flex-col items-start gap-2">
              <TeamLogo
                flagCode={match.homeFlagCode || (match.homeTeam?.toLowerCase().slice(0, 2) ?? 'un')}
                teamName={match.homeTeam || match.homeSlot || 'TBD'}
                size="sm"
              />
              <div className="flex flex-col items-start gap-1">
                <span
                  className={`truncate border-b-2 pb-1 text-sm font-extrabold md:text-base ${
                    homeWon ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
                  }`}
                >
                  {match.homeTeam || match.homeSlot || 'TBD'}
                </span>
                {match.stage !== 'First Stage' && match.stage !== 'Group Stage' && (match.homeQualificationStatus === 'CouldQualify' || (match.homeQualificationStatus?.includes('Qualified') && (match.homePlayed || 0) < 3)) && (
                  <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-400/20">
                    Provisional
                  </span>
                )}
                {match.homeIsPredicted && (
                  <span className="rounded bg-blue-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-500 ring-1 ring-blue-400/20">
                    Predicted
                  </span>
                )}
              </div>
            </div>

            <div className="text-center">
              {hasScore ? (
                <span className="font-display text-2xl font-black text-accent">
                  {match.homeScore}-{match.awayScore}
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-[0.18em] text-accent">VS</span>
              )}
            </div>

            <div className="flex min-w-0 flex-col items-end gap-2 text-right">
              <TeamLogo
                flagCode={match.awayFlagCode || (match.awayTeam?.toLowerCase().slice(0, 2) ?? 'un')}
                teamName={match.awayTeam || match.awaySlot || 'TBD'}
                size="sm"
              />
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`truncate border-b-2 pb-1 text-sm font-extrabold md:text-base ${
                    awayWon ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
                  }`}
                >
                  {match.awayTeam || match.awaySlot || 'TBD'}
                </span>
                {match.stage !== 'First Stage' && match.stage !== 'Group Stage' && (match.awayQualificationStatus === 'CouldQualify' || (match.awayQualificationStatus?.includes('Qualified') && (match.awayPlayed || 0) < 3)) && (
                  <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-400/20">
                    Provisional
                  </span>
                )}
                {match.awayIsPredicted && (
                  <span className="rounded bg-blue-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-blue-500 ring-1 ring-blue-400/20">
                    Predicted
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 text-xs font-semibold text-text-secondary">
            <div className="flex items-center gap-1">
              <Clock size={13} className="flex-shrink-0 text-accent/70" />
              <span>{match.kickoffTime}</span>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-text-secondary">
              {statusLabel}
            </span>
            <div className="ml-auto flex min-w-0 items-center gap-1 truncate">
              <MapPin size={13} className="flex-shrink-0 text-accent/70" />
              <span className="truncate text-right">{match.stadium}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
