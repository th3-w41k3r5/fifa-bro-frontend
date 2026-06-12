'use client';

import React from 'react';
import Link from 'next/link';
import { TeamSummary } from '@/types';
import { Flag } from '@/components';

interface TeamsGridProps {
  teams: TeamSummary[];
}

export default function TeamsGrid({ teams }: TeamsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {teams.map((team) => (
        <TeamCard key={team.id || team.code} team={team} />
      ))}
    </div>
  );
}

function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link href={`/teams/${team.code || team.id || team.name}`} className="block h-full">
      <div className="group relative h-full cursor-pointer overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-6 shadow-[0_20px_54px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_26px_70px_rgba(0,183,255,0.10)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10">
          <div className="flex items-center gap-6">
            {team.flagCode && (
              <div className="flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                <Flag flagCode={team.flagCode} size="lg" variant="square" />
              </div>
            )}
            <div className="min-w-0">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">
                {team.groupCode ? `Group ${team.groupCode}` : 'Team'}
              </p>
              <h3 className="text-2xl font-black leading-tight tracking-[-0.03em] text-text-primary">{team.name}</h3>
              {team.fifaCode && <p className="mt-2 text-sm font-bold text-text-secondary">{team.fifaCode}</p>}
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2 text-sm font-extrabold text-accent transition-colors group-hover:bg-accent group-hover:text-dark">
            View Team <span aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
