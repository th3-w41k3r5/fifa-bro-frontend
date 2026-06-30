'use client';

import React from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowRightCircle,
  ArrowUpRight,
  Clock,
  Flag,
  Goal,
  Pause,
  Play,
  Target,
} from 'lucide-react';
import { TeamLogo } from '@/components';
import { MatchStateKind, TimelineEvent } from '@/lib/fifaMatchUtils';
import { PenaltyShootoutEvent } from '@/types';
import { GoalTypeBadge, RedCardIcon, YellowCardIcon } from './matchCentreIcons';

interface MatchTimelineProps {
  events: TimelineEvent[];
  homeFlagCode?: string;
  awayFlagCode?: string;
}

function hasDisplayMinute(minute?: string): boolean {
  if (minute == null) return false;
  return minute.replace(/'/g, '').trim().length > 0;
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="mt-1 shrink-0 text-accent">{icon}</div>
      <h2 className="font-fifa-semi text-2xl leading-tight tracking-[-0.01em] text-text-primary md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function getEventLabel(event: TimelineEvent): string {
  if (event.type === 'match_state') return event.label;
  if (event.type === 'penalty_goal') return 'Shootout Goal';
  if (event.type === 'penalty_miss') return 'Shootout Miss';
  if (event.type === 'penalty_saved') return 'Shootout Saved';
  if (event.type === 'goal') {
    if (event.goalType === 1) return 'Penalty Goal';
    if (event.goalType === 3) return 'Own Goal';
    return 'Goal';
  }
  if (event.type === 'booking') {
    return event.cardType === 2 ? 'Red Card' : 'Yellow Card';
  }
  if (event.type === 'simple') return event.label;
  return 'Substitution';
}

function getMatchStateIcon(stateKind: MatchStateKind) {
  const className = 'h-4 w-4 shrink-0 text-accent';

  switch (stateKind) {
    case 'match_start':
      return <Play className={className} />;
    case 'half_time':
    case 'extra_time_half_time':
      return <Pause className={className} />;
    case 'second_half_start':
    case 'extra_time_second_half_start':
      return <ArrowRightCircle className={className} />;
    case 'full_time':
      return <Flag className={className} />;
    case 'extra_time_start':
      return <Clock className={className} />;
    case 'penalty_shootout_start':
      return <Target className={className} />;
    default:
      return <Play className={className} />;
  }
}

function getCardShellClass(event: TimelineEvent): string {
  const base =
    'relative flex w-full min-w-0 max-w-[320px] flex-col gap-2 rounded-xl border px-4 break-words backdrop-blur-sm transition-all duration-200';

  if (event.type === 'match_state') {
    return `${base} min-h-[72px] py-3.5 border-white/[0.07] bg-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]`;
  }

  if (event.type === 'goal' || event.type === 'penalty_goal') {
    const penaltyBoost = (event.type === 'goal' && event.goalType === 1) || event.type === 'penalty_goal'
      ? 'border-accent/30 bg-accent/[0.06] shadow-[0_2px_16px_rgba(0,183,255,0.08),inset_0_1px_0_rgba(0,183,255,0.1)]'
      : 'border-accent/20 bg-accent/[0.04] shadow-[0_2px_16px_rgba(0,183,255,0.05),inset_0_1px_0_rgba(0,183,255,0.06)]';
    return `${base} min-h-[88px] py-3.5 ${penaltyBoost}`;
  }
  
  if (event.type === 'penalty_miss' || event.type === 'penalty_saved') {
    return `${base} min-h-[88px] py-3.5 border-danger/30 bg-danger/[0.04] shadow-[0_2px_16px_rgba(255,0,0,0.05),inset_0_1px_0_rgba(255,0,0,0.06)]`;
  }

  if (event.type === 'booking') {
    return `${base} py-2.5 border-white/[0.05] bg-white/[0.025] shadow-[0_2px_8px_rgba(0,0,0,0.2)]`;
  }

  return `${base} min-h-[72px] max-w-[280px] py-3 border-white/[0.06] bg-white/[0.03] shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]`;
}

function EventTypeLabel({ event }: { event: TimelineEvent }) {
  const label = getEventLabel(event);
  const tone =
    event.type === 'match_state'
      ? 'text-text-primary'
      : event.type === 'goal' || event.type === 'penalty_goal'
        ? 'text-accent'
        : event.type === 'penalty_miss' || event.type === 'penalty_saved' || (event.type === 'booking' && event.cardType === 2)
          ? 'text-danger'
          : event.type === 'booking'
            ? 'text-warning'
            : 'text-text-secondary';

  return (
    <p className={`text-[9px] font-extrabold uppercase tracking-[0.18em] ${tone}`}>{label}</p>
  );
}

function TeamRow({
  teamSide,
  teamName,
  homeFlagCode,
  awayFlagCode,
}: {
  teamSide: 'home' | 'away';
  teamName: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  const flagCode = teamSide === 'home' ? homeFlagCode : awayFlagCode;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {flagCode && <TeamLogo flagCode={flagCode} teamName={teamName} size="sm" />}
      <span className="min-w-0 truncate text-xs font-semibold text-text-primary/90">{teamName}</span>
    </div>
  );
}

function TimelineEventCard({
  event,
  homeFlagCode,
  awayFlagCode,
}: {
  event: TimelineEvent;
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  const showMinute = hasDisplayMinute(event.minute);

  return (
    <div className={getCardShellClass(event)}>
      {event.type === 'match_state' && (
        <div className="flex items-center gap-2.5">
          {getMatchStateIcon(event.stateKind)}
          <p className="text-sm font-bold uppercase tracking-[0.08em] leading-snug text-text-primary">
            {event.label}
          </p>
        </div>
      )}

      {event.type === 'goal' && (
        <>
          <div className="flex items-center gap-2">
            <Goal size={16} className="shrink-0 text-accent" aria-hidden />
            <EventTypeLabel event={event} />
            {event.goalType === 1 && <GoalTypeBadge type="P" prominent />}
            {event.goalType === 3 && <GoalTypeBadge type="OG" prominent />}
          </div>
          <p className="text-sm font-bold leading-snug text-text-primary">{event.playerName}</p>
          {event.assistName && (
            <p className="text-[10px] text-text-secondary/80">Assist · {event.assistName}</p>
          )}
        </>
      )}

      {event.type === 'booking' && (
        <>
          <div className="flex items-center gap-2">
            {event.cardType === 2 ? (
              <RedCardIcon className="h-4 w-3 shrink-0" />
            ) : (
              <YellowCardIcon className="h-4 w-3 shrink-0" />
            )}
            <EventTypeLabel event={event} />
          </div>
          <p className="text-sm font-bold leading-snug text-text-primary">{event.playerName}</p>
        </>
      )}

      {event.type === 'substitution' && (
        <>
          <EventTypeLabel event={event} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 items-start gap-1.5 text-xs font-semibold text-success">
              <ArrowUpRight size={14} className="mt-0.5 shrink-0" aria-hidden />
              <span className="min-w-0 break-words leading-snug">{event.playerOn}</span>
            </div>
            <div className="flex min-w-0 items-start gap-1.5 text-xs font-semibold text-danger">
              <ArrowDownLeft size={14} className="mt-0.5 shrink-0" aria-hidden />
              <span className="min-w-0 break-words leading-snug">{event.playerOff}</span>
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex min-w-0 items-center justify-between gap-2 pt-1">
        {event.type === 'match_state' ? (
          showMinute ? (
            <span className="ml-auto shrink-0 text-[10px] font-extrabold tabular-nums text-accent">
              {event.minute}
            </span>
          ) : null
        ) : (
          <>
            <TeamRow
              teamSide={event.teamSide}
              teamName={event.teamName}
              homeFlagCode={homeFlagCode}
              awayFlagCode={awayFlagCode}
            />
            {showMinute && (
              <span className="shrink-0 text-[10px] font-extrabold tabular-nums text-accent">
                {event.minute}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TimelineMarker({
  minute,
  isLast,
  className = '',
}: {
  minute: string;
  isLast: boolean;
  className?: string;
}) {
  const showMinute = hasDisplayMinute(minute);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {showMinute && (
        <span className="relative z-10 text-[11px] font-extrabold tabular-nums text-accent sm:text-xs">
          {minute}
        </span>
      )}
      {/* Outer glow ring */}
      <div
        className={`relative z-10 ${showMinute ? 'mt-1.5' : ''}`}
      >
        <div className="absolute inset-0 -m-1 rounded-full bg-accent/10" />
        <div
          className="relative h-2.5 w-2.5 rounded-full border-2 border-[#0c1018] bg-accent shadow-[0_0_10px_rgba(0,183,255,0.45)]"
          aria-hidden
        />
      </div>
      {!isLast && (
        <div
          className={`absolute left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-white/[0.12] to-white/[0.04] ${showMinute ? 'top-6 h-[calc(100%+14px)]' : 'top-2 h-[calc(100%+8px)]'}`}
          aria-hidden
        />
      )}
    </div>
  );
}

function TimelineRow({
  event,
  isLast,
  homeFlagCode,
  awayFlagCode,
}: {
  event: TimelineEvent;
  isLast: boolean;
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  if (event.type === 'match_state') {
    const card = (
      <TimelineEventCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
    );

    return (
      <div className="relative min-w-0">
        <div className="flex flex-col items-center">
          <TimelineMarker minute={event.minute} isLast={isLast} />
          <div className="mt-2.5 w-full min-w-0 px-1">
            <div className="flex justify-center">{card}</div>
          </div>
        </div>
      </div>
    );
  }

  const isHome = event.teamSide === 'home';
  const card = (
    <TimelineEventCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
  );

  return (
    <div className="relative min-w-0">
      <div className="hidden min-w-0 sm:grid sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] sm:items-start sm:gap-3">
        <div className="flex min-w-0 justify-end">{isHome ? card : null}</div>
        <TimelineMarker minute={event.minute} isLast={isLast} />
        <div className="flex min-w-0 justify-start">{!isHome ? card : null}</div>
      </div>

      <div className="min-w-0 sm:hidden">
        <div className="flex flex-col items-center">
          <TimelineMarker minute={event.minute} isLast={isLast} />
          <div className="mt-2.5 w-full min-w-0 px-1">
            <div className={isHome ? 'flex justify-start' : 'flex justify-end'}>{card}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PenaltyShootoutSummary({
  events,
  homeFlagCode,
  awayFlagCode,
}: {
  events: PenaltyShootoutEvent[];
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  const homeKicks = events.filter((e) => e.teamSide === 'home');
  const awayKicks = events.filter((e) => e.teamSide === 'away');

  const lastEvent = events[events.length - 1];
  const homeFinalScore = lastEvent?.homePenaltyScore ?? 0;
  const awayFinalScore = lastEvent?.awayPenaltyScore ?? 0;

  const homeTeamName = homeKicks[0]?.teamName || 'Home';
  const awayTeamName = awayKicks[0]?.teamName || 'Away';

  let winnerText = '';
  if (homeFinalScore > awayFinalScore) winnerText = `${homeTeamName} wins!!!`;
  else if (awayFinalScore > homeFinalScore) winnerText = `${awayTeamName} wins!!!`;

  const firstKickerSide = events[0]?.teamSide === 'home' ? homeTeamName : awayTeamName;

  const maxRounds = Math.max(homeKicks.length, awayKicks.length);
  const rows = Array.from({ length: maxRounds }).map((_, i) => ({
    home: homeKicks[i],
    away: awayKicks[i],
  }));

  return (
    <div className="mb-8 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#1a1d24]">
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.24em] text-text-secondary">
          Penalty Shootout
        </h3>
        {winnerText && <h2 className="mb-2 text-xl font-bold text-white">{winnerText}</h2>}
        <p className="text-base font-semibold text-text-secondary">
          {homeFinalScore} - {awayFinalScore}
        </p>
      </div>

      <div className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-3">
        <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-4">
          <div className="text-sm font-medium text-text-secondary">{homeTeamName}</div>
          <div className="flex items-center justify-center gap-3">
            <TeamLogo flagCode={homeFlagCode || 'un'} teamName={homeTeamName} size="sm" />
            <TeamLogo flagCode={awayFlagCode || 'un'} teamName={awayTeamName} size="sm" />
          </div>
          <div className="text-right text-sm font-medium text-text-secondary">{awayTeamName}</div>
        </div>
      </div>

      <div className="flex flex-col">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_80px_1fr] items-center gap-4 border-b border-white/[0.04] px-6 py-4 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col">
              {row.home ? (
                <>
                  <span className="truncate text-[15px] font-bold text-white">
                    {row.home.playerName}
                  </span>
                  <span className="mt-0.5 text-xs font-medium text-text-secondary">
                    {row.home.type === 'penalty_goal' ? 'Goal' : 'Miss'} ({row.home.homePenaltyScore ?? 0} - {row.home.awayPenaltyScore ?? 0})
                  </span>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-center gap-6">
              <span
                className={`flex w-6 items-center justify-center text-lg ${
                  row.home
                    ? row.home.type === 'penalty_goal'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                    : ''
                }`}
              >
                {row.home ? (row.home.type === 'penalty_goal' ? '✓' : '✗') : ''}
              </span>
              <span
                className={`flex w-6 items-center justify-center text-lg ${
                  row.away
                    ? row.away.type === 'penalty_goal'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                    : ''
                }`}
              >
                {row.away ? (row.away.type === 'penalty_goal' ? '✓' : '✗') : ''}
              </span>
            </div>

            <div className="flex min-w-0 flex-col items-end text-right">
              {row.away ? (
                <>
                  <span className="truncate text-[15px] font-bold text-white">
                    {row.away.playerName}
                  </span>
                  <span className="mt-0.5 text-xs font-medium text-text-secondary">
                    {row.away.type === 'penalty_goal' ? 'Goal' : 'Miss'} ({row.away.homePenaltyScore ?? 0} - {row.away.awayPenaltyScore ?? 0})
                  </span>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] bg-white/[0.02] p-4 text-center">
        <span className="text-xs font-medium text-text-secondary">
          {firstKickerSide} first to kick
        </span>
      </div>
    </div>
  );
}

export default function MatchTimeline({
  events,
  homeFlagCode,
  awayFlagCode,
}: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Match Timeline" icon={<Activity size={28} />} />
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] px-6 py-10 text-center text-sm text-text-secondary">
          No timeline events available yet.
        </div>
      </div>
    );
  }

  const regularEvents = events.filter((e) => e.type !== 'penalty_goal' && e.type !== 'penalty_miss' && e.type !== 'penalty_saved');
  const shootoutEvents = events.filter((e) => e.type === 'penalty_goal' || e.type === 'penalty_miss' || e.type === 'penalty_saved') as PenaltyShootoutEvent[];
  shootoutEvents.sort((a, b) => a.sortKey - b.sortKey || (a.timestamp || '').localeCompare(b.timestamp || ''));

  return (
    <div className="space-y-6">
      <SectionHeader title="Match Timeline" icon={<Activity size={28} />} />

      {shootoutEvents.length > 0 && (
        <PenaltyShootoutSummary
          events={shootoutEvents}
          homeFlagCode={homeFlagCode}
          awayFlagCode={awayFlagCode}
        />
      )}

      <div className="relative mx-auto min-w-0 max-w-3xl overflow-hidden">
        {/* Central spine — soft gradient */}
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 top-2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-accent/15 via-white/[0.08] to-accent/10 sm:block"
          aria-hidden
        />

        <div className="space-y-5 sm:space-y-6">
          {regularEvents.map((event, index) => (
            <TimelineRow
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              homeFlagCode={homeFlagCode}
              awayFlagCode={awayFlagCode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
