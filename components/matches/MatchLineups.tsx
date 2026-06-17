'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { Flag } from '@/components';
import { FifaPlayer, FifaTeamDetail } from '@/types';
import {
  buildPlayerEventsMap,
  getCoachName,
  getCoachPictureUrl,
  getHeadCoach,
  getTeamFormation,
  splitPlayersByStatus,
} from '@/lib/fifaMatchUtils';
import LineupPitch from './LineupPitch';
import PitchPlayerMarker from './PitchPlayerMarker';

interface MatchLineupsProps {
  homeTeam: FifaTeamDetail;
  awayTeam: FifaTeamDetail;
  homeTeamName: string;
  awayTeamName: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
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

function TeamHeader({
  teamName,
  flagCode,
  formation,
  coachName,
  coachPictureUrl,
}: {
  teamName: string;
  flagCode?: string;
  formation: string | null;
  coachName: string;
  coachPictureUrl?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        {flagCode && (
          <span className="shrink-0 overflow-hidden rounded-sm">
            <Flag flagCode={flagCode} size="md" variant="square" alt={`${teamName} flag`} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-fifa-semi text-lg uppercase tracking-[-0.02em] text-text-primary sm:text-2xl">
            {teamName}
          </h3>
          {formation && (
            <p className="mt-1.5 text-sm text-text-secondary">
              <span className="font-bold text-text-primary">Formation:</span> {formation}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex min-w-0 items-center gap-3 border-t border-white/[0.06] pt-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-[#F8F8FF]/[0.5] sm:h-14 sm:w-14">
          {coachPictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coachPictureUrl}
              alt={coachName}
              className="h-full w-full scale-[3.8] md:scale-[3] translate-y-[45px] translate-x-[-3px] object-cover object-top"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-extrabold uppercase tracking-wider text-white/25">
              HC
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-secondary">
            Head Coach
          </p>
          <p className="truncate text-sm font-bold text-text-primary sm:text-base">{coachName}</p>
        </div>
      </div>
    </div>
  );
}

function SubstitutesBench({
  players,
  playerEvents,
}: {
  players: FifaPlayer[];
  playerEvents: Map<string, import('@/lib/fifaMatchUtils').PlayerMatchEvents>;
}) {
  if (players.length === 0) return null;

  return (
    <div className="mt-4 min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4">
      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">
        Substitutes
      </p>
      <div className="flex min-w-0 flex-nowrap gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {players.map((player) => (
          <div key={player.IdPlayer ?? player.ShirtNumber} className="snap-start">
            <PitchPlayerMarker
              player={player}
              events={playerEvents.get(String(player.IdPlayer))}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamLineupBlock({
  team,
  teamName,
  flagCode,
  inverted = false,
}: {
  team: FifaTeamDetail;
  teamName: string;
  flagCode?: string;
  inverted?: boolean;
}) {
  const headCoach = getHeadCoach(team.Coaches);
  const formation = getTeamFormation(team);
  const { starters, substitutes } = splitPlayersByStatus(team.Players ?? []);
  const playerEvents = buildPlayerEventsMap(team);

  return (
    <div className="min-w-0 space-y-4">
      <TeamHeader
        teamName={teamName}
        flagCode={flagCode}
        formation={formation}
        coachName={getCoachName(headCoach)}
        coachPictureUrl={getCoachPictureUrl(headCoach)}
      />
      <LineupPitch starters={starters} playerEvents={playerEvents} inverted={inverted} />
      <SubstitutesBench players={substitutes} playerEvents={playerEvents} />
    </div>
  );
}

export default function MatchLineups({
  homeTeam,
  awayTeam,
  homeTeamName,
  awayTeamName,
  homeFlagCode,
  awayFlagCode,
}: MatchLineupsProps) {
  return (
    <div className="min-w-0 space-y-8">
      <SectionHeader title="Lineups" icon={<Users size={28} />} />

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2">
        <TeamLineupBlock team={homeTeam} teamName={homeTeamName} flagCode={homeFlagCode} />
        <TeamLineupBlock
          team={awayTeam}
          teamName={awayTeamName}
          flagCode={awayFlagCode}
          inverted
        />
      </div>
    </div>
  );
}
