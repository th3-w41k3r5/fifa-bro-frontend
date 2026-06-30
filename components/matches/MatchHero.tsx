'use client';

import React from 'react';
import { Badge, GoalScorer, MatchSummary } from '@/types';
import { Badge as FixtureBadge, TeamLogo } from '@/components';
import { MatchGoalScorers } from './MatchGoalScorers';
import { Calendar, Clock, MapPin,X, Check } from 'lucide-react';
import { getMatchStatusLabel } from '@/lib/matchStatus';
import { buildTimelineEventsFromApi } from '@/lib/fifaMatchUtils';

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
  const homeWon = hasScore && (match.homeScore! > match.awayScore! || (match.homeScore === match.awayScore && (match.homePenaltyScore ?? 0) > (match.awayPenaltyScore ?? 0)));
  const awayWon = hasScore && (match.awayScore! > match.homeScore! || (match.homeScore === match.awayScore && (match.awayPenaltyScore ?? 0) > (match.homePenaltyScore ?? 0)));
  const statusLabel = getMatchStatusLabel(match);

  // Show goal scorers only for live or complete matches
  let homePenalties = match.shootoutPenalties?.home?.map(p => ({
    name: p.playerName.split(' ').slice(-1)[0] || p.playerName,
    isGoal: p.type === 'penalty_goal',
    homeScore: p.homePenaltyScore ?? 0,
    awayScore: p.awayPenaltyScore ?? 0,
    timestamp: p.timestamp
  })) || [];
  
  let awayPenalties = match.shootoutPenalties?.away?.map(p => ({
    name: p.playerName.split(' ').slice(-1)[0] || p.playerName,
    isGoal: p.type === 'penalty_goal',
    homeScore: p.homePenaltyScore ?? 0,
    awayScore: p.awayPenaltyScore ?? 0,
    timestamp: p.timestamp
  })) || [];

  if (homePenalties.length === 0 && awayPenalties.length === 0 && match.fifaDetail && match.fifaDetail.HomeTeam && match.fifaDetail.AwayTeam) {
    const timelineEvents = buildTimelineEventsFromApi(
      match.fifaDetail,
      match.fifaDetail.HomeTeam,
      match.fifaDetail.AwayTeam,
      match.fifaDetail.Event || []
    );
    homePenalties = timelineEvents
      .filter((e): e is Extract<typeof e, { type: 'penalty_goal' | 'penalty_saved' | 'penalty_miss' }> => 'teamSide' in e && e.teamSide === 'home' && e.type.startsWith('penalty_'))
      .map(p => ({
        name: p.playerName.split(' ').slice(-1)[0] || p.playerName,
        isGoal: p.type === 'penalty_goal',
        homeScore: p.homePenaltyScore ?? 0,
        awayScore: p.awayPenaltyScore ?? 0,
        timestamp: p.timestamp
      }));
    awayPenalties = timelineEvents
      .filter((e): e is Extract<typeof e, { type: 'penalty_goal' | 'penalty_saved' | 'penalty_miss' }> => 'teamSide' in e && e.teamSide === 'away' && e.type.startsWith('penalty_'))
      .map(p => ({
        name: p.playerName.split(' ').slice(-1)[0] || p.playerName,
        isGoal: p.type === 'penalty_goal',
        homeScore: p.homePenaltyScore ?? 0,
        awayScore: p.awayPenaltyScore ?? 0,
        timestamp: p.timestamp
      }));
  }

  const penaltyRounds = Math.max(homePenalties.length, awayPenalties.length);
  const penaltyRows = Array.from({ length: penaltyRounds }).map((_, i) => ({
    home: homePenalties[i],
    away: awayPenalties[i]
  }));

  const homeFirstTime = homePenalties[0]?.timestamp ? new Date(homePenalties[0].timestamp).getTime() : 9999999999999;
  const awayFirstTime = awayPenalties[0]?.timestamp ? new Date(awayPenalties[0].timestamp).getTime() : 9999999999999;
  const firstToKick = homeFirstTime < awayFirstTime ? match.homeTeam : match.awayTeam;

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
            {match.homeTeam || match.homeSlot || 'TBD'} vs {match.awayTeam || match.awaySlot || 'TBD'}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-text-secondary">
            Match details, venue information, and editorial context for this FIFA World Cup 2026 fixture.
          </p>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4 rounded-[24px] border border-white/[0.06] bg-black/20 p-4 md:p-6">
            <TeamBlock
              label={match.homeSlot ? `Slot ${match.homeSlot}` : 'Home'}
              name={match.homeTeam}
              flagCode={match.homeFlagCode}
              winner={homeWon}
              goalScorers={homeGoals}
              qualificationStatus={match.homeQualificationStatus}
              isPredicted={match.homeIsPredicted}
              played={match.homePlayed}
              stage={match.stage}
            />
            <div className="md:self-center text-center">
              {hasScore ? (
                <div className="flex flex-col items-center">
                  <div className="font-display flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 text-3xl md:text-5xl font-black text-accent whitespace-nowrap">
                    <div className="flex md:hidden flex-col items-center">
                      <span>{match.homeScore}-{match.awayScore}</span>
                      {(match.homePenaltyScore !== undefined && match.homePenaltyScore !== null) && (
                        <span className="text-sm font-semibold text-accent/80">({match.homePenaltyScore}) PENS ({match.awayPenaltyScore})</span>
                      )}
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                      {match.homePenaltyScore !== undefined && match.homePenaltyScore !== null && (
                        <span className="text-xl md:text-2xl font-semibold text-accent/70">({match.homePenaltyScore})</span>
                      )}
                      <span>{match.homeScore}-{match.awayScore}</span>
                      {match.awayPenaltyScore !== undefined && match.awayPenaltyScore !== null && (
                        <span className="text-xl md:text-2xl font-semibold text-accent/70">({match.awayPenaltyScore})</span>
                      )}
                    </div>
                  </div>
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
              label={match.awaySlot ? `Slot ${match.awaySlot}` : 'Away'}
              name={match.awayTeam}
              flagCode={match.awayFlagCode}
              align="right"
              winner={awayWon}
              goalScorers={awayGoals}
              qualificationStatus={match.awayQualificationStatus}
              isPredicted={match.awayIsPredicted}
              played={match.awayPlayed}
              stage={match.stage}
            />
          </div>

          {(homePenalties.length > 0 || awayPenalties.length > 0) && (
            <div className="mt-6 w-full max-w-xl mx-auto rounded-[24px] border border-white/[0.06] bg-black/20 p-4 md:p-6">
              <p className="mb-4 text-center text-[10px] font-extrabold uppercase tracking-[0.24em] text-text-secondary">
                Penalty Shootout
              </p>
              
              {match.homePenaltyScore !== undefined && match.homePenaltyScore !== null && (
                <p className="mb-6 text-center text-xs font-semibold text-text-primary">
                  {match.homePenaltyScore > (match.awayPenaltyScore || 0) ? match.homeTeam || match.homeSlot || 'Home' : match.awayTeam || match.awaySlot || 'Away'} wins {Math.max(match.homePenaltyScore, match.awayPenaltyScore || 0)} - {Math.min(match.homePenaltyScore, match.awayPenaltyScore || 0)} on penalties
                </p>
              )}

              <div className="w-full">
                <div className="flex items-center justify-between mb-4 text-xs font-semibold text-text-secondary">
                  <div className="flex-1 text-left truncate">{match.homeTeam}</div>
                  <div className="flex gap-2 mx-4">
                    {match.homeFlagCode && <TeamLogo teamName={match.homeTeam || ''} flagCode={match.homeFlagCode} size="sm" />}
                    {match.awayFlagCode && <TeamLogo teamName={match.awayTeam || ''} flagCode={match.awayFlagCode} size="sm" />}
                  </div>
                  <div className="flex-1 text-right truncate">{match.awayTeam}</div>
                </div>

                <div className="divide-y divide-white/5 border-t border-b border-white/5">
                  {penaltyRows.map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 md:py-2 text-xs md:text-sm font-medium">
                      <div className="flex-1 flex flex-col min-w-0 pr-2">
                        {row.home ? (
                          <>
                            <span className="truncate text-text-primary text-[9px] md:text-[10px]">{row.home.name}</span>
                            <span className="text-[8px] md:text-[9px] text-text-secondary">
                              {row.home.isGoal ? 'Goal' : 'Miss'} ({row.home.homeScore} - {row.home.awayScore})
                            </span>
                          </>
                        ) : <div className="h-6" />}
                      </div>
                      
                      <div className="flex gap-6 mx-2 text-sm md:text-base font-black">
                        <span className={`w-4 text-center ${row.home?.isGoal ? 'text-emerald-500' : (row.home ? 'text-red-500' : '')}`}>
                          {row.home ? (row.home.isGoal ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />) : ''}
                        </span>
                        <span className={`w-4 text-center ${row.away?.isGoal ? 'text-emerald-500' : (row.away ? 'text-red-500' : '')}`}>
                          {row.away ? (row.away.isGoal ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />) : ''}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-end min-w-0 pl-2 text-right">
                        {row.away ? (
                          <>
                            <span className="truncate text-text-primary text-[9px] md:text-[10px]">{row.away.name}</span>
                            <span className="text-[8px] md:text-[9px] text-text-secondary">
                              {row.away.isGoal ? 'Goal' : 'Miss'} ({row.away.homeScore} - {row.away.awayScore})
                            </span>
                          </>
                        ) : <div className="h-6" />}
                      </div>
                    </div>
                  ))}
                </div>
                
                {homePenalties.length > 0 && (
                  <div className="mt-3 rounded bg-white/5 py-2 text-center text-[10px] font-semibold text-text-secondary">
                    {firstToKick} first to kick
                  </div>
                )}
              </div>
            </div>
          )}
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
  isPredicted,
  played,
  stage,
}: {
  name?: string;
  flagCode?: string;
  label: string;
  align?: 'left' | 'right';
  winner?: boolean;
  goalScorers?: GoalScorer[];
  qualificationStatus?: string;
  isPredicted?: boolean;
  played?: number;
  stage?: string;
}) {
  const showGoalScorers = goalScorers && goalScorers.length > 0;
  const isKnockout = stage && stage !== 'First Stage' && stage !== 'Group Stage';

  return (
    <div className={`flex min-w-0 flex-col gap-3 ${align === 'right' ? 'items-end text-right' : 'items-start'}`}>
      <TeamLogo flagCode={flagCode || (name?.toLowerCase().slice(0, 2) ?? 'un')} teamName={name || 'TBD'} size="lg" />
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-secondary">{label}</p>
      <div className={`w-full min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <p
          className={`inline-block max-w-full truncate border-b-2 pb-1 text-lg font-black uppercase leading-none md:text-2xl ${
            winner ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
          }`}
        >
          {name || 'TBD'}
        </p>
        {isKnockout && (qualificationStatus === 'CouldQualify' || (qualificationStatus?.includes('Qualified') && (played || 0) < 3)) && (
          <div className={`mt-1.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-400/20">
              Provisional
            </span>
          </div>
        )}
        {isPredicted && (
          <div className={`mt-1.5 ${align === 'right' ? 'text-right' : 'text-left'}`}>
            <span className="inline-block rounded bg-blue-400/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-500 ring-1 ring-blue-400/20">
              Predicted
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
