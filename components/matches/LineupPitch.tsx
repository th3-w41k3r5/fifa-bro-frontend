'use client';

import React from 'react';
import { FifaPlayer } from '@/types';
import { groupPlayersByPosition, PlayerMatchEvents } from '@/lib/fifaMatchUtils';
import PitchPlayerMarker from './PitchPlayerMarker';

interface LineupPitchProps {
  starters: FifaPlayer[];
  playerEvents: Map<string, PlayerMatchEvents>;
  inverted?: boolean;
}

function PitchMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_28px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 sm:h-[72px] sm:w-[72px] md:h-[88px] md:w-[88px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[14%] top-0 h-[20%] rounded-b-md border border-t-0 border-white/20 sm:inset-x-[18%] sm:h-[22%] sm:rounded-b-lg"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[14%] bottom-0 h-[20%] rounded-t-md border border-b-0 border-white/20 sm:inset-x-[18%] sm:h-[22%] sm:rounded-t-lg"
        aria-hidden
      />
    </>
  );
}

function PositionRow({
  players,
  playerEvents,
}: {
  players: FifaPlayer[];
  playerEvents: Map<string, PlayerMatchEvents>;
}) {
  if (players.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-0 items-center justify-center gap-0.5 overflow-x-auto px-1 py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-around sm:gap-2 sm:overflow-visible sm:px-3 [&::-webkit-scrollbar]:hidden">
        {players.map((player) => (
          <PitchPlayerMarker
            key={player.IdPlayer ?? player.ShirtNumber}
            player={player}
            events={playerEvents.get(String(player.IdPlayer))}
          />
        ))}
      </div>
    </div>
  );
}

export default function LineupPitch({ starters, playerEvents, inverted = false }: LineupPitchProps) {
  const { gk, def, mid, fwd } = groupPlayersByPosition(starters);
  const rows = inverted ? [fwd, mid, def, gk] : [gk, def, mid, fwd];

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.28)]"
        style={{
          background:
            'linear-gradient(180deg, #1a5c38 0%, #124a2e 38%, #0c3822 72%, #082818 100%)',
        }}
      >
        <PitchMarkings />

        <div className="relative z-10 flex min-h-[320px] flex-col justify-between gap-1 py-4 sm:min-h-[380px] sm:gap-2 sm:py-5 md:min-h-[440px] md:py-6">
          {rows.map((players, index) => (
            <PositionRow key={index} players={players} playerEvents={playerEvents} />
          ))}
        </div>
      </div>
    </div>
  );
}
