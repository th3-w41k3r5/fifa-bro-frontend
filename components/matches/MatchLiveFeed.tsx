'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock3,
  Crosshair,
  Droplets,
  Flag,
  Goal,
  MoveDiagonal,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Video,
  Zap,
} from 'lucide-react';
import { TeamLogo } from '@/components';
import { TimelineEvent } from '@/lib/fifaMatchUtils';
import { GoalTypeBadge } from './matchCentreIcons';

/* ─────────────────────────────────────────────
   Props & Type Aliases
   ───────────────────────────────────────────── */

interface MatchLiveFeedProps {
  events: TimelineEvent[];
  homeFlagCode?: string;
  awayFlagCode?: string;
}

type TeamEvent = Extract<TimelineEvent, { teamSide: 'home' | 'away' }>;
type GoalEvent = Extract<TimelineEvent, { type: 'goal' }>;
type BookingEvent = Extract<TimelineEvent, { type: 'booking' }>;
type SubstitutionEvent = Extract<TimelineEvent, { type: 'substitution' }>;
type SimpleEvent = Extract<TimelineEvent, { type: 'simple' }>;
type StateEvent = Extract<TimelineEvent, { type: 'match_state' }>;

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */

const FEED_MAX_W = 'max-w-[660px]';

/* ─────────────────────────────────────────────
   Utility
   ───────────────────────────────────────────── */

function hasMinute(event: TimelineEvent): boolean {
  return event.minute.replace(/'/g, '').trim().length > 0;
}

function timestampSortValue(timestamp?: string): number {
  if (!timestamp) return 0;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? parsed : 0;
}

const CAUSAL_PRIORITY: Record<string, number> = {
  var_check: 1,
  penalty_awarded: 2,
  attempt: 3,
  goal: 4,
  goal_prevention: 5,
  yellow_card: 6,
  red_card: 7,
  substitution: 8,
  foul: 9,
  corner: 10,
  match_state: 11,
};

function getCausalPriority(event: TimelineEvent): number {
  if (event.type === 'match_state') {
    if (event.stateKind === 'var_check') return CAUSAL_PRIORITY.var_check;
    return CAUSAL_PRIORITY.match_state;
  }
  if (event.type === 'goal') return CAUSAL_PRIORITY.goal;
  if (event.type === 'substitution') return CAUSAL_PRIORITY.substitution;
  if (event.type === 'booking') return event.cardType === 2 ? CAUSAL_PRIORITY.red_card : CAUSAL_PRIORITY.yellow_card;
  if (event.type === 'simple') {
    const label = event.label?.toLowerCase() || '';
    if (label.includes('penalty awarded')) return CAUSAL_PRIORITY.penalty_awarded;
    if (event.eventType === 12) return CAUSAL_PRIORITY.attempt;
    if (event.eventType === 57) return CAUSAL_PRIORITY.goal_prevention;
    if (event.eventType === 16) return CAUSAL_PRIORITY.corner;
    if (event.eventType === 18) return CAUSAL_PRIORITY.foul;
  }
  return 12; // fallback
}

/* ─────────────────────────────────────────────
   Reveal Animation — Tier-based
   ───────────────────────────────────────────── */

function Reveal({ children, tier = 3 }: { children: React.ReactNode; tier?: 1 | 2 | 3 | 4 | 5 }) {
  const config = {
    1: { y: 8, scale: 0.99, duration: 0.3 },
    2: { y: 6, scale: 1, duration: 0.2 },
    3: { y: 4, scale: 1, duration: 0.15 },
    4: { y: 2, scale: 1, duration: 0.1 },
    5: { y: 0, scale: 1, duration: 0.2 },
  }[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: config.y, scale: config.scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: config.duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Shared Micro-Components
   ───────────────────────────────────────────── */

function PlayerImage({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'hero' }) {
  const dimensions =
    size === 'hero'
      ? 'h-[68px] w-[68px] sm:h-[84px] sm:w-[84px]'
      : size === 'md'
        ? 'h-10 w-10'
        : 'h-7 w-7';

  const borderClass =
    size === 'hero'
      ? 'ring-2 ring-white/15 ring-offset-1 ring-offset-black/40'
      : 'border border-white/[0.08]';

  return (
    <div className={`${dimensions} shrink-0 overflow-hidden rounded-full ${borderClass} bg-[#F8F8FF]/[0.5]`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={
            size === 'hero'
              ? 'h-full w-full scale-[3] translate-y-[60px] md:translate-y-[75px] translate-x-[-2px] object-cover object-top'
              : 'h-full w-full scale-[3] translate-y-[20px] md:translate-y-[23px] translate-x-[-2px object-cover object-top'
          }
          style={{ objectPosition: 'center top' }}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/25">
          <UserRound size={size === 'hero' ? 26 : size === 'md' ? 16 : 12} />
        </div>
      )}
    </div>
  );
}

function MinuteBadge({ minute, variant = 'default' }: { minute: string; variant?: 'default' | 'gold' | 'danger' | 'emerald' }) {
  const colorMap = {
    default: 'text-accent',
    gold: 'text-amber-400',
    danger: 'text-danger',
    emerald: 'text-emerald-400',
  };

  return (
    <span className={`shrink-0 text-[13px] font-black tabular-nums ${colorMap[variant]}`}>
      {minute}
    </span>
  );
}

function TeamFlag({
  event,
  homeFlagCode,
  awayFlagCode,
}: {
  event: TeamEvent;
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  const flagCode = event.teamSide === 'home' ? homeFlagCode : awayFlagCode;
  if (!flagCode) return null;

  return (
    <div className="flex items-center gap-1.5">
      <TeamLogo flagCode={flagCode} teamName={event.teamName} size="sm" />
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-secondary/90">
        {event.teamName}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shot Description Generator
   ───────────────────────────────────────────── */

function shotDescription(event: SimpleEvent): string | undefined {
  if (event.eventType !== 12 || event.positionX == null || event.positionY == null) return undefined;

  const x = event.positionX;
  const y = event.positionY;
  const distanceToGoal = Math.min(x, 100 - x);
  const centrality = Math.abs(y - 50);

  if (distanceToGoal <= 8) return 'Fires from close range.';
  if (distanceToGoal <= 18 && centrality <= 22) return 'Gets a shot away from inside the penalty area.';
  if (centrality <= 12) return 'Attempts a shot from a central position.';
  if (centrality >= 34) return 'Tries an effort from a tight angle.';
  return 'Attempts a long-range effort.';
}

/* ═══════════════════════════════════════════════
   TIER 1 — HERO: Goals
   ═══════════════════════════════════════════════ */

function GoalCard({ event, homeFlagCode, awayFlagCode }: { event: GoalEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  const isOwnGoal = event.goalType === 34 || event.goalType === 3;
  const isPenalty = event.goalType === 33 || event.goalType === 1;
  const label = isOwnGoal ? 'Own Goal' : isPenalty ? 'Penalty' : 'Goal';
  const Icon = isOwnGoal ? ShieldAlert : Goal;

  const borderClass = isOwnGoal
    ? 'border-rose-400/20'
    : 'border-amber-400/15';
  const shadowClass = isOwnGoal
    ? 'shadow-[0_1px_3px_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.35),0_0_60px_rgba(244,63,94,0.06)]'
    : 'shadow-[0_1px_3px_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.35),0_0_60px_rgba(251,191,36,0.05)]';
  const labelColor = isOwnGoal ? 'text-rose-300' : 'text-amber-300';
  const gradientOverlay = isOwnGoal
    ? 'from-rose-500/[0.06] via-transparent to-transparent'
    : 'from-amber-500/[0.04] via-transparent to-transparent';

  return (
    <Reveal tier={1}>
      <article className={`relative mx-auto w-full ${FEED_MAX_W} overflow-hidden rounded-[18px] border ${borderClass} bg-white/[0.03] ${shadowClass}`}>
        {/* Gradient wash */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientOverlay}`} />
        {/* Top accent line */}
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${isOwnGoal ? 'via-rose-400/35' : 'via-amber-400/25'} to-transparent`} />

        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          {/* Player photo */}
          <div className="flex justify-center sm:justify-start">
            <PlayerImage src={event.playerPictureUrl} name={event.playerName} size="hero" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            {/* Label */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <Icon className={`h-3.5 w-3.5 ${labelColor}`} />
              <span className={`text-[11px] font-black uppercase tracking-[0.22em] ${labelColor}`}>
                {label}
              </span>
              {isPenalty && <GoalTypeBadge type="P" prominent />}
              {isOwnGoal && <GoalTypeBadge type="OG" prominent />}
            </div>

            {/* Player name */}
            <h3 className="mt-1.5 min-w-0 break-words font-fifa-semi text-[26px] uppercase leading-[0.95] text-text-primary sm:text-[32px]">
              {event.playerName}
            </h3>

            {/* Team */}
            <div className="mt-2 flex justify-center sm:justify-start">
              <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
            </div>

            {/* Commentary — editorial prominence */}
            {(event.description || isOwnGoal) && (
              <p className="mt-3 min-w-0 break-words text-[16px] font-medium leading-[1.65] text-white/95 sm:max-w-[420px]">
                {isOwnGoal ? 'Scored into own net.' : event.description}
              </p>
            )}
          </div>

          {/* Score + Minute */}
          <div className="flex items-center justify-center gap-4 sm:flex-col sm:items-end sm:gap-2.5">
            {event.homeGoals != null && event.awayGoals != null && (
              <div className="relative flex min-w-[96px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.05] bg-black/40 px-3 py-2.5 shadow-[0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-md">
                <div className={`absolute inset-0 bg-gradient-to-b ${isOwnGoal ? 'from-rose-500/[0.03]' : 'from-amber-500/[0.03]'} to-transparent`} />
                <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent ${isOwnGoal ? 'via-rose-400/20' : 'via-amber-400/20'} to-transparent`} />
                
                <span className={`relative text-[9px] font-black uppercase tracking-[0.25em] ${isOwnGoal ? 'text-rose-400/70' : 'text-amber-400/70'}`}>
                  Score
                </span>
                
                <div className="relative mt-1 flex items-center justify-center gap-3">
                  <span className={`w-7 text-center text-[34px] font-bold tabular-nums leading-[0.9] tracking-tight sm:text-[38px] ${event.homeGoals > event.awayGoals ? (isOwnGoal ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]') : 'text-white/95'}`}>
                    {event.homeGoals}
                  </span>
                  
                  <div className="h-[3px] w-3 rounded-full bg-white/[0.12]" />
                  
                  <span className={`w-7 text-center text-[34px] font-bold tabular-nums leading-[0.9] tracking-tight sm:text-[38px] ${event.awayGoals > event.homeGoals ? (isOwnGoal ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]') : 'text-white/95'}`}>
                    {event.awayGoals}
                  </span>
                </div>
              </div>
            )}
            <MinuteBadge minute={event.minute} variant={isOwnGoal ? 'danger' : 'gold'} />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 2 — MAJOR: Red Card
   ═══════════════════════════════════════════════ */

function RedCardCard({ event, homeFlagCode, awayFlagCode }: { event: BookingEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <Reveal tier={2}>
      <article className={`relative mx-auto w-full ${FEED_MAX_W} overflow-hidden rounded-2xl border border-danger/20 bg-white/[0.025] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_12px_36px_rgba(0,0,0,0.25)]`}>
        <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-danger via-danger/70 to-danger/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-danger/[0.04] to-transparent" />

        <div className="relative flex items-center gap-3 py-3.5 pl-5 pr-4">
          <span
            className="block h-9 w-[22px] shrink-0 rounded-[3px] bg-danger shadow-[0_0_14px_rgba(239,68,68,0.25)]"
            aria-hidden
          />
          <PlayerImage src={event.playerPictureUrl} name={event.playerName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-danger">Red Card</p>
            <p className="mt-0.5 truncate text-[16px] font-extrabold text-text-primary">{event.playerName}</p>
            <div className="mt-1">
              <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
            </div>
          </div>
          <MinuteBadge minute={event.minute} variant="danger" />
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 3 — STANDARD: Yellow Card (compact)
   ═══════════════════════════════════════════════ */

function YellowCardCard({ event, homeFlagCode, awayFlagCode }: { event: BookingEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <Reveal tier={3}>
      <article className={`mx-auto w-full ${FEED_MAX_W} rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5`}>
        <div className="flex items-center gap-2.5">
          <span
            className="block h-7 shrink-0 rounded-[2px] bg-warning shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            style={{ width: '18px' }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-warning">Yellow Card</p>
            <p className="truncate text-[14px] font-bold text-text-primary">{event.playerName}</p>
          </div>
          <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
          <MinuteBadge minute={event.minute} />
        </div>
      </article>
    </Reveal>
  );
}

function CardEventCard({ event, homeFlagCode, awayFlagCode }: { event: BookingEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  if (event.cardType === 2) {
    return <RedCardCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  }
  return <YellowCardCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
}

/* ═══════════════════════════════════════════════
   TIER 3 — STANDARD: Substitution
   Clean football swap — no IN/OUT badges
   ═══════════════════════════════════════════════ */

function SubstitutionCard({ event, homeFlagCode, awayFlagCode }: { event: SubstitutionEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <Reveal tier={3}>
      <article className={`mx-auto w-full ${FEED_MAX_W} rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-4`}>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary/70">
            Substitution
          </span>
          <MinuteBadge minute={event.minute} />
        </div>

        {/* Player swap */}
        <div className="space-y-3">
          {/* Player ON */}
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-success" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            </span>
            <PlayerImage src={event.playerOnPictureUrl} name={event.playerOn} size="sm" />
            <p className="min-w-0 truncate text-[15px] font-bold text-text-primary">{event.playerOn}</p>
          </div>

          {/* Player OFF */}
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-danger/80" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </span>
            <PlayerImage src={event.playerOffPictureUrl} name={event.playerOff} size="sm" />
            <p className="min-w-0 truncate text-[15px] font-semibold text-text-secondary/80">{event.playerOff}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3.5 border-t border-white/[0.05] pt-3 opacity-80">
          <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 3 — STANDARD: Attempt at Goal
   Commentary-first: description leads, metadata follows
   ═══════════════════════════════════════════════ */

function AttemptCard({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  const generatedInsight = shotDescription(event);

  return (
    <Reveal tier={3}>
      <article className={`mx-auto w-full ${FEED_MAX_W} rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3.5`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.08] text-accent">
            <Crosshair className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            {/* FIFA Commentary First */}
            {event.description && (
              <p className="text-[16px] font-medium leading-[1.55] text-white/95">
                {event.description}
              </p>
            )}
            
            {/* Generated Insight Second */}
            {generatedInsight && (
              <p className={`text-[13px] font-medium text-accent/90 ${event.description ? 'mt-1.5' : ''}`}>
                {generatedInsight}
              </p>
            )}

            {!event.description && !generatedInsight && (
              <p className="text-[15px] font-bold text-text-primary">
                Attempt at Goal
              </p>
            )}

            {/* Player · Team · Minute — supporting metadata */}
            <div className="mt-2.5 flex items-center gap-1.5 opacity-80">
              {event.playerName && (
                <>
                  <span className="truncate text-[12px] font-bold text-text-secondary">{event.playerName}</span>
                  <span className="text-[10px] text-white/20">·</span>
                </>
              )}
              <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
              <span className="ml-auto">
                <MinuteBadge minute={event.minute} />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 2 — MAJOR: Goal Prevention
   ═══════════════════════════════════════════════ */

function GoalPreventionCard({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <Reveal tier={2}>
      <article className={`relative mx-auto w-full ${FEED_MAX_W} overflow-hidden rounded-2xl border border-emerald-400/15 bg-white/[0.025] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_12px_36px_rgba(0,0,0,0.22)]`}>
        <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-emerald-300 via-emerald-400/60 to-emerald-500/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-transparent" />

        <div className="relative flex items-start gap-3 py-3.5 pl-5 pr-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/[0.1] text-emerald-300">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Goal Prevention</p>
            {/* Commentary first */}
            {event.description && (
              <p className="mt-1 text-[16px] font-medium leading-[1.55] text-white/95">{event.description}</p>
            )}
            {/* Player + team as metadata */}
            <div className="mt-2.5 flex items-center gap-1.5 opacity-80">
              {event.playerName && (
                <>
                  <span className="truncate text-[12px] font-bold text-text-secondary">{event.playerName}</span>
                  <span className="text-[10px] text-white/20">·</span>
                </>
              )}
              <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />
              <span className="ml-auto">
                <MinuteBadge minute={event.minute} variant="emerald" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 4 — MINOR: Inline Event Rows
   Corners, Fouls, Offsides
   ═══════════════════════════════════════════════ */

function MinorEventRow({
  icon,
  label,
  playerName,
  description,
  minute,
  event,
  homeFlagCode,
  awayFlagCode,
}: {
  icon: React.ReactNode;
  label: string;
  playerName?: string;
  description?: string;
  minute: string;
  event: TeamEvent;
  homeFlagCode?: string;
  awayFlagCode?: string;
}) {
  return (
    <Reveal tier={4}>
      <div className={`mx-auto w-full ${FEED_MAX_W} border-b border-white/[0.08] px-1`}>
        <div className="flex items-center gap-2 py-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-text-secondary/80">
            {icon}
          </span>

          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-secondary/90">
            {label}
          </span>

          <span className="text-[10px] text-white/20">·</span>

          {playerName && (
            <span className="min-w-0 truncate text-[14px] font-bold text-text-primary">
              {playerName}
            </span>
          )}

          <span className="flex-1" />

          <TeamFlag event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />

          <span className="shrink-0 text-[13px] font-bold tabular-nums text-text-secondary/90">
            {minute}
          </span>
        </div>

        {/* Commentary description */}
        {description && (
          <p className="pb-3 pl-7 text-[14px] leading-[1.55] text-white/80">
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
}

function FoulRow({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <MinorEventRow
      icon={<Zap className="h-4 w-4" />}
      label="Foul"
      playerName={event.playerName}
      description={event.description}
      minute={event.minute}
      event={event}
      homeFlagCode={homeFlagCode}
      awayFlagCode={awayFlagCode}
    />
  );
}

function CornerRow({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <MinorEventRow
      icon={<Flag className="h-4 w-4" />}
      label="Corner"
      playerName={event.playerName}
      minute={event.minute}
      event={event}
      homeFlagCode={homeFlagCode}
      awayFlagCode={awayFlagCode}
    />
  );
}

function OffsideRow({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  return (
    <MinorEventRow
      icon={<MoveDiagonal className="h-4 w-4" />}
      label="Offside"
      playerName={event.playerName}
      minute={event.minute}
      event={event}
      homeFlagCode={homeFlagCode}
      awayFlagCode={awayFlagCode}
    />
  );
}

/* ═══════════════════════════════════════════════
   TIER 5 — DIVIDERS: Match States (Chapter Markers)
   ═══════════════════════════════════════════════ */

function MatchStateDivider({ event }: { event: StateEvent }) {
  if (event.stateKind === 'var_check') return <VarCard event={event} />;

  const isKickoff = event.stateKind === 'match_start' || event.stateKind === 'second_half_start'
    || event.stateKind === 'extra_time_start' || event.stateKind === 'extra_time_second_half_start'
    || event.stateKind === 'penalty_shootout_start';
  const isFullTime = event.stateKind === 'full_time';
  const isHalfTime = event.stateKind === 'half_time' || event.stateKind === 'extra_time_half_time';

  const icon = isKickoff ? (
    <Play className="h-4 w-4" />
  ) : isFullTime ? (
    <Flag className="h-4 w-4" />
  ) : (
    <Clock3 className="h-4 w-4" />
  );

  const pillClasses = isFullTime
    ? 'border-accent/15 bg-accent/[0.06]'
    : isHalfTime
      ? 'border-white/[0.1] bg-white/[0.05]'
      : 'border-white/[0.1] bg-white/[0.05]';

  return (
    <Reveal tier={5}>
      <div className={`mx-auto flex ${FEED_MAX_W} items-center gap-3 py-1.5`}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.12]" />
        <div className={`rounded-full border px-5 py-2.5 ${pillClasses}`}>
          <div className="flex items-center gap-2.5">
            <span className="text-accent">{icon}</span>
            <span className={`text-[12px] font-black uppercase tracking-[0.14em] ${isFullTime ? 'text-text-primary' : 'text-text-primary/90'}`}>
              {event.label}
            </span>
            <span className="text-[12px] font-bold tabular-nums text-accent">{event.minute}</span>
          </div>
        </div>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.12]" />
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   TIER 2 — MAJOR: VAR Check
   ═══════════════════════════════════════════════ */

function VarCard({ event }: { event: StateEvent }) {
  return (
    <Reveal tier={2}>
      <article className={`relative mx-auto w-full ${FEED_MAX_W} max-w-[480px] overflow-hidden rounded-2xl border border-accent/30 bg-black/40 px-6 py-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4),0_12px_40px_rgba(0,183,255,0.06)]`}>
        {/* Subtle scanline background typical of VAR screens */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />
        
        {/* Glowing side accent bar */}
        <div className="absolute inset-y-0 left-0 w-1 bg-accent shadow-[0_0_12px_rgba(0,183,255,0.6)]" />

        <div className="relative flex flex-col items-center">
          {/* TV Monitor Icon wrapper */}
          <div className="flex h-12 w-12 items-center justify-center rounded border border-accent/50 bg-accent/20 text-accent shadow-[0_0_15px_rgba(0,183,255,0.2)]">
            <Video className="h-6 w-6" />
          </div>
          
          <div className="mt-3.5 flex items-center justify-center gap-2.5">
             {/* Pulsing live dot */}
             <span className="relative flex h-2 w-2">
               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
               <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
             </span>
             <p className="text-[14px] font-black uppercase tracking-[0.2em] text-accent">VAR Review</p>
          </div>
          
          {event.description ? (
            <p className="mt-2 text-[16px] font-medium leading-[1.55] text-white/95">{event.description}</p>
          ) : (
            <p className="mt-2 text-[16px] font-medium leading-[1.55] text-white/95">Official review in progress.</p>
          )}
          
          {/* Minute badge on the far right */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
             <MinuteBadge minute={event.minute} />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   Break Cards (Hydration, Delay/Resume)
   ═══════════════════════════════════════════════ */

function BreakCard({ event }: { event: SimpleEvent }) {
  return (
    <Reveal tier={5}>
      <div className={`mx-auto flex ${FEED_MAX_W} items-center gap-3 py-1.5`}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/[0.2]" />
        <div className="rounded-full border border-accent/20 bg-accent/[0.06] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-accent">
              {event.eventType === 83 ? <Droplets className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            </span>
            <span className="text-[12px] font-black uppercase tracking-[0.14em] text-text-primary/90">
              {event.label}
            </span>
            <span className="text-[12px] font-bold tabular-nums text-accent">{event.minute}</span>
          </div>
        </div>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/[0.2]" />
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   Fallback Context Card
   ═══════════════════════════════════════════════ */

function ContextStateCard({ event }: { event: StateEvent }) {
  return (
    <Reveal tier={5}>
      <div className={`mx-auto flex ${FEED_MAX_W} items-center gap-3 py-1.5`}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.12]" />
        <div className="rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.14em] text-text-primary/80">
              {event.label}
            </span>
            <span className="text-[12px] font-bold tabular-nums text-accent">{event.minute}</span>
          </div>
        </div>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.12]" />
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════
   Event Dispatchers
   ═══════════════════════════════════════════════ */

function SimpleEventRenderer({ event, homeFlagCode, awayFlagCode }: { event: SimpleEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  if (event.eventType === 12) return <AttemptCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.eventType === 57) return <GoalPreventionCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.eventType === 18) return <FoulRow event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.eventType === 16) return <CornerRow event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.eventType === 15) return <OffsideRow event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.eventType === 83 || event.eventType === 78) return <BreakCard event={event} />;
  return <ContextStateCard event={{ ...event, type: 'match_state', stateKind: 'match_resumed', priority: event.priority }} />;
}

function FeedCard({ event, homeFlagCode, awayFlagCode }: { event: TimelineEvent; homeFlagCode?: string; awayFlagCode?: string }) {
  if (event.type === 'goal') return <GoalCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.type === 'booking') return <CardEventCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.type === 'substitution') return <SubstitutionCard event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
  if (event.type === 'match_state') return <MatchStateDivider event={event} />;
  return <SimpleEventRenderer event={event} homeFlagCode={homeFlagCode} awayFlagCode={awayFlagCode} />;
}

/* ═══════════════════════════════════════════════
   Spacing Logic — Tier-aware vertical rhythm
   ═══════════════════════════════════════════════ */

function getEventTier(event: TimelineEvent): 1 | 2 | 3 | 4 | 5 {
  if (event.type === 'goal') return 1;
  if (event.type === 'booking' && event.cardType === 2) return 2;
  if (event.type === 'booking') return 3;
  if (event.type === 'substitution') return 3;
  if (event.type === 'match_state') {
    if (event.stateKind === 'var_check') return 2;
    return 5;
  }
  if (event.type === 'simple') {
    if (event.eventType === 57) return 2;
    if (event.eventType === 12) return 3;
    if (event.eventType === 18 || event.eventType === 16 || event.eventType === 15) return 4;
    if (event.eventType === 83 || event.eventType === 78) return 5;
  }
  return 4;
}

function tierSpacingClass(tier: 1 | 2 | 3 | 4 | 5): string {
  switch (tier) {
    case 1: return 'py-6';     // Hero: dramatic breathing room
    case 2: return 'py-4';     // Major: elevated spacing
    case 3: return 'py-2';     // Standard: moderate
    case 4: return 'py-px';    // Minor: clustered tight
    case 5: return 'py-5';     // Dividers: chapter separation
  }
}

/* ═══════════════════════════════════════════════
   Main Feed Component
   ═══════════════════════════════════════════════ */

export default function MatchLiveFeed({ events, homeFlagCode, awayFlagCode }: MatchLiveFeedProps) {
  const sortedAndFilteredEvents = React.useMemo(() => {
    const filtered = events.filter((event) => event.type !== 'substitution' || hasMinute(event));
    
    return [...filtered].sort((a, b) => {
      // 1. Primary sort: MatchMinute DESC (newest first globally)
      if (b.sortKey !== a.sortKey) return b.sortKey - a.sortKey;
      
      // 2. Secondary sort: Exact Timestamp DESC (newest first)
      const tsA = timestampSortValue(a.timestamp);
      const tsB = timestampSortValue(b.timestamp);
      if (tsA !== 0 && tsB !== 0 && tsA !== tsB) {
        return tsB - tsA;
      }
      if (tsA !== tsB) return tsB - tsA;
      
      // 3. Fallback Causal Priority DESC (newest first equivalent) when timestamps are identical/missing
      // Goal (4) should be above Attempt (3)
      const pA = getCausalPriority(a);
      const pB = getCausalPriority(b);
      if (pA !== pB) return pB - pA;
      
      // 4. Tertiary sort: Event ID DESC
      return b.id.localeCompare(a.id);
    });
  }, [events]);

  const visibleEvents = sortedAndFilteredEvents;

  return (
    <div className={`mx-auto ${FEED_MAX_W} px-1 sm:px-2`}>
      {/* Feed Header */}
      <div className="mb-5 text-center">
        <h2 className="font-fifa-semi text-3xl tracking-[-0.01em] text-text-primary">
          Live Feed
        </h2>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary/70">
          Official timeline · Newest first
        </p>
      </div>

      {/* Scrollable feed — premium minimal scrollbar with fade edges */}
      <div className="relative">
        {/* Top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-bg-primary to-transparent" />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 bg-gradient-to-t from-bg-primary to-transparent" />

        <div
          className="h-[600px] overflow-y-auto md:h-[500px] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.06)_transparent] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08]"
        >
          {visibleEvents.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] px-6 py-14 text-center">
              <p className="text-[14px] font-medium text-text-secondary/60">
                No match events yet.
              </p>
            </div>
          ) : (
            <div className="px-0.5 pt-6 pb-10">
              {visibleEvents.map((event) => {
                const tier = getEventTier(event);
                return (
                  <div key={event.id} className={tierSpacingClass(tier)}>
                    <FeedCard
                      event={event}
                      homeFlagCode={homeFlagCode}
                      awayFlagCode={awayFlagCode}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
