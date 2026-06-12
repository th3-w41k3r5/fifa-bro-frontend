'use client';

import React from 'react';
import { TeamSummary } from '@/types';
import { Flag } from '@/components';

interface TeamHeroProps {
  team: TeamSummary;
  groupName: string;
}

export default function TeamHero({ team, groupName }: TeamHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#080b10] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] md:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_48%)]" />

      <div className="relative z-10 grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          {team.flagCode ? (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.30)]">
              <Flag flagCode={team.flagCode} size="lg" variant="square" />
            </div>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-2xl font-black text-text-secondary">
              {team.code || 'TBD'}
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">
            {groupName || 'World Cup 2026'}
          </p>
          <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-text-primary md:text-7xl">
            {team.name}
          </h1>

          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            {team.fifaCode && <InfoPill label="FIFA" value={team.fifaCode} />}
            {team.code && <InfoPill label="Code" value={team.code} />}
            {team.groupCode && <InfoPill label="Group" value={team.groupCode} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2">
      <span className="mr-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">{label}</span>
      <span className="text-sm font-black text-accent">{value}</span>
    </div>
  );
}
