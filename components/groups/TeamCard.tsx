'use client';

import React from 'react';
import Link from 'next/link';
import { TeamSummary } from '@/types';
import { Flag } from '@/components';

interface TeamCardProps {
  team: TeamSummary;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.code || team.id || team.name}`} className="block h-full">
      <article className="group relative h-full overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_24px_70px_rgba(0,183,255,0.10)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex items-center gap-5">
          {team.flagCode && (
            <div className="shrink-0 overflow-hidden rounded-lg border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <Flag flagCode={team.flagCode} size="lg" variant="square" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
              {team.groupCode ? `Group ${team.groupCode}` : 'Team'}
            </p>
            <h3 className="mt-1 truncate text-xl font-black text-text-primary">{team.name}</h3>
            <p className="mt-1 text-sm font-bold text-text-secondary">{team.fifaCode || team.code}</p>
          </div>
        </div>

        <div className="relative z-10 mt-5 border-t border-white/[0.06] pt-4 text-sm font-extrabold text-accent">
          View Team →
        </div>
      </article>
    </Link>
  );
}
