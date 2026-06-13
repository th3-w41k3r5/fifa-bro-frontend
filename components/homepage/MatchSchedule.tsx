'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TeamLogo, Badge } from '@/components';
import type { MatchSummary } from '@/types';
import { CalendarDays, Clock, MapPin, Search, X } from 'lucide-react';

interface MatchScheduleProps {
  matches: MatchSummary[];
}

const IST_OFFSET_MINUTES = 330;

function getKickoffTime(match: MatchSummary) {
  const date = match.matchDate.slice(0, 10);
  const time = match.kickoffTime.includes('T') ? match.kickoffTime.split('T')[1] : match.kickoffTime;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.replace(/Z$/, '').split(':').map(Number);

  return new Date(Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60 * 1000);
}

function formatDateKey(match: MatchSummary) {
  return match.matchDate.slice(0, 10);
}

export const MatchSchedule: React.FC<MatchScheduleProps> = ({ matches }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups = useMemo(() => {
    return Array.from(new Set(matches.map((match) => match.groupCode).filter(Boolean) as string[])).sort();
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return matches.filter((match) => {
      const matchesSearch =
        !normalizedSearch ||
        match.homeTeam.toLowerCase().includes(normalizedSearch) ||
        match.awayTeam.toLowerCase().includes(normalizedSearch) ||
        match.stadium.toLowerCase().includes(normalizedSearch) ||
        match.city.toLowerCase().includes(normalizedSearch);

      const matchesGroup = !selectedGroup || match.groupCode === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [matches, searchTerm, selectedGroup]);

  const matchesByDate = useMemo(() => {
    const grouped: Record<string, MatchSummary[]> = {};

    filteredMatches.forEach((match) => {
      const date = formatDateKey(match);
      grouped[date] ??= [];
      grouped[date].push(match);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, matchesForDate]) => ({
        date,
        matches: matchesForDate.sort((a, b) => getKickoffTime(a).getTime() - getKickoffTime(b).getTime()),
      }));
  }, [filteredMatches]);

  return (
    <div className="space-y-8">
      <div className="rounded-[26px] border border-white/[0.07] bg-[#080b10] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.22)] md:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder="Search teams, city, or stadium..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-14 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] py-0 pl-12 pr-12 text-base font-semibold text-text-primary placeholder:text-text-secondary focus:border-accent/60 focus:ring-2 focus:ring-accent/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <FilterButton active={selectedGroup === null} onClick={() => setSelectedGroup(null)}>
            All Groups
          </FilterButton>
          {groups.map((group) => (
            <FilterButton key={group} active={selectedGroup === group} onClick={() => setSelectedGroup(group)}>
              Group {group}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {matchesByDate.map(({ date, matches: dateMatches }) => (
          <section
            key={date}
            id={
              date === new Date().toLocaleDateString('en-CA')
                ? 'today-matchday'
                : undefined
            }
            className="space-y-4 scroll-mt-24"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">Matchday</p>
                <h3 className="mt-1 font-display text-[18px] md:text-[25px] md:tracking-[0.05em] font-black uppercase tracking-[0.12em] text-text-primary md:text-2xl">
                  {new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs font-bold text-text-secondary">
                {dateMatches.length} {dateMatches.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            <div className="space-y-3">
              {dateMatches.map((match, index) => (
                <MatchRow key={match.id} match={match} index={index} />
              ))}
            </div>
          </section>
        ))}

        {matchesByDate.length === 0 && (
          <div className="rounded-[24px] border border-white/[0.07] bg-[#080b10] py-14 text-center">
            <p className="text-sm font-semibold text-text-secondary">No matches found matching your filters</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.07] pt-4 text-sm font-semibold text-text-secondary">
        Showing <span className="text-text-primary">{filteredMatches.length}</span> of{' '}
        <span className="text-text-primary">{matches.length}</span> matches
      </div>
    </div>
  );
};

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-200 ${active
        ? 'border-accent bg-accent text-dark shadow-[0_12px_30px_rgba(0,183,255,0.22)]'
        : 'border-white/[0.08] bg-white/[0.035] text-text-primary hover:border-accent/45 hover:bg-accent/[0.08]'
        }`}
    >
      {children}
    </button>
  );
}

interface MatchRowProps {
  match: MatchSummary;
  index: number;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, index }) => {
  const kickoffTime = getKickoffTime(match);
  const venue = [match.stadium, match.city].filter(Boolean).join(', ');
  const matchHref = `/matches/${encodeURIComponent(String(match.id))}`;
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;
  const statusLabel = match.status ? match.status.replace(/[-_]/g, ' ').toUpperCase() : 'SCHEDULED';

  const status = match.status?.toLowerCase();

  const statusBadge =
    status === 'live' || status === 'in_progress' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-400">
        <span className="relative z-10 h-2 w-2 rounded-full bg-green-500 animate-pulse-ripple" />
        LIVE
      </span>
    ) : status === 'scheduled' ? (
      <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-text-secondary">
        SCHEDULED
      </span>
    ) : status === 'complete' ? (
      <span className="inline-flex rounded-full border border-green-500/15 bg-green-500/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-green-300">
        COMPLETE
      </span>
    ) : status === 'postponed' ? (
      <span className="inline-flex rounded-full border border-warning/20 bg-warning/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-warning">
        POSTPONED
      </span>
    ) : status === 'cancelled' ? (
      <span className="inline-flex rounded-full border border-danger/20 bg-danger/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-danger">
        CANCELLED
      </span>
    ) : (
      <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-text-secondary">
        {statusLabel}
      </span>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -70px 0px' }}
      transition={{ delay: index * 0.035, duration: 0.32, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#080b10] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.22)] transition-colors duration-300 hover:border-accent/30 md:p-5"
    >
      <Link
        href={matchHref}
        className="absolute inset-0 z-10 rounded-[22px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        aria-label={`View ${match.homeTeam} vs ${match.awayTeam} match details`}
      >
        <span className="sr-only">
          View {match.homeTeam} vs {match.awayTeam} match details
        </span>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="space-y-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-accent/75" />
            <p className="font-display text-lg font-black leading-none text-text-primary">
              {kickoffTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              })}
            </p>
          </div>

          <MatchBadges match={match} compact />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.025] px-3 py-4">
          <TeamSide name={match.homeTeam} flagCode={match.homeFlagCode} align="left" winner={homeWon} />

          <div className="text-center">
            {hasScore ? (
              <span className="font-display text-lg font-black leading-none text-accent">
                {match.homeScore}-{match.awayScore}
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary/70">VS</span>
            )}
          </div>

          <TeamSide name={match.awayTeam} flagCode={match.awayFlagCode} align="right" winner={awayWon} />
        </div>
      </div>

      <div className="hidden items-center gap-4 md:grid md:grid-cols-[110px_1fr_auto_1fr_auto]">
        <div className="text-left">
          <p className="font-display text-xl font-black leading-none text-text-primary">
            {kickoffTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Kolkata',
            })}
          </p>
        </div>

        <TeamSide name={match.homeTeam} flagCode={match.homeFlagCode} align="left" winner={homeWon} />

        <div className="hidden text-center md:block">
          {hasScore ? (
            <span className="font-display text-xl font-black leading-none text-accent">
              {match.homeScore}-{match.awayScore}
            </span>
          ) : (
            <span className="text-xs font-black uppercase tracking-[0.16em] text-text-secondary/70">VS</span>
          )}
        </div>

        <TeamSide name={match.awayTeam} flagCode={match.awayFlagCode} align="right" winner={awayWon} />

        <MatchBadges match={match} />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-y-2 border-t border-white/[0.06] pt-3 text-[11px] font-semibold text-text-secondary md:text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin size={13} className="text-accent/70" />
          <span className="truncate">{venue}</span>
        </span>

        <span className="row-span-2 self-center justify-self-end">
          {statusBadge}
        </span>

        <span className="inline-flex min-w-0 items-center gap-1.5">
          <CalendarDays size={13} className="text-accent/70" />
          <span className="truncate">{match.stage}</span>
        </span>
      </div>
    </motion.div>
  );
};

function MatchBadges({ match, compact = false }: { match: MatchSummary; compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {match.groupCode && (
        <span
          className={`rounded-full border border-accent/20 bg-accent/[0.08] font-extrabold uppercase tracking-[0.12em] text-accent ${compact ? 'px-2.5 py-1 text-[9px]' : 'px-3 py-1 text-[10px]'
            }`}
        >
          Group {match.groupCode}
        </span>
      )}
      {match.badges?.slice(0, 1).map((badge) => (
        <Badge key={badge.slug} variant="featured" label={badge.name} size="sm" />
      ))}
    </div>
  );
}

function TeamSide({
  name,
  flagCode,
  align,
  winner = false,
}: {
  name: string;
  flagCode?: string;
  align: 'left' | 'right';
  winner?: boolean;
}) {
  const logo = (
    <div className="h-6 w-6 shrink-0 md:h-7 md:w-7">
      <TeamLogo flagCode={flagCode || name.toLowerCase().slice(0, 2)} teamName={name} size="sm" />
    </div>
  );

  return (
    <div
      className={`flex min-w-0 items-center gap-3 ${align === 'right' ? 'justify-end text-right' : 'justify-start'}`}
    >
      {align === 'left' && logo}
      <span
        className={`truncate border-b-2 pb-1 font-fifa-semi text-[10px] uppercase leading-none tracking-[-0.02em] md:text-[15px] md:text-xl ${winner ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
          }`}
      >
        {name}
      </span>
      {align === 'right' && logo}
    </div>
  );
}

MatchSchedule.displayName = 'MatchSchedule';
