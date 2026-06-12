'use client';

import React from 'react';
import Link from 'next/link';
import { GroupSummary } from '@/types';
import { Flag } from '@/components';
import { ArrowRight, Trophy, Users } from 'lucide-react';

interface TeamWithFlag {
  name: string;
  flagCode?: string;
}

interface GroupCardProps {
  group: GroupSummary;
  teams?: TeamWithFlag[];
  matchCount?: number;
  note?: string;
}

export default function GroupCard({ group, teams = [], matchCount = 6, note }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.code}`} className="block h-full">
      <article className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-6 shadow-[0_20px_54px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_26px_70px_rgba(0,183,255,0.10)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Group</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-6xl font-black leading-[0.82] text-text-primary">{group.code}</span>
              <div className="pb-1">
                <h3 className="text-base font-extrabold text-text-primary">{group.name}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">
                  {matchCount} matches
                </p>
              </div>
            </div>
          </div>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.08] text-accent transition-transform group-hover:translate-x-1">
            <ArrowRight size={18} />
          </span>
        </div>

        {note && (
          <div className="relative z-10 mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/[0.08] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-yellow-200">
            <Trophy size={13} />
            {note}
          </div>
        )}

        {teams.length > 0 && (
          <div className="relative z-10 mt-5">
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-secondary">
              <Users size={13} className="text-accent" />
              Teams
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm font-bold text-text-primary">
              {teams.slice(0, 4).map((team) => (
                <div key={team.name} className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2">
                  {team.flagCode && (
                    <div className="shrink-0 overflow-hidden rounded-md border border-white/[0.08]">
                      <Flag flagCode={team.flagCode} size="sm" variant="square" />
                    </div>
                  )}
                  <span className="truncate text-xs">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative z-10 mt-auto pt-6 text-sm font-extrabold text-accent">View Group →</div>
      </article>
    </Link>
  );
}
