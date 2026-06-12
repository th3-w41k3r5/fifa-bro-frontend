'use client';

import React from 'react';
import { StandingRow } from '@/types';

interface TeamOverviewProps {
  standings: StandingRow;
  groupName: string;
  matchCount: number;
  featuredMatchCount: number;
  storylineCount: number;
}

export default function TeamOverview({
  standings,
  groupName,
  matchCount,
  featuredMatchCount,
  storylineCount,
}: TeamOverviewProps) {
  const info = [
    { label: 'Group', value: groupName },
    { label: 'Matches', value: matchCount.toString() },
    { label: 'Featured', value: featuredMatchCount.toString() },
    { label: 'Storylines', value: storylineCount.toString() },
  ];

  const stats = [
    {
      label: 'Position',
      value: standings.position ? `${standings.position}${getOrdinalSuffix(standings.position)}` : '-',
    },
    { label: 'Points', value: standings.points?.toString() ?? '-' },
    { label: 'Played', value: standings.played?.toString() ?? '-' },
    { label: 'Won', value: standings.won?.toString() ?? '-' },
    { label: 'Drawn', value: standings.drawn?.toString() ?? '-' },
    { label: 'Lost', value: standings.lost?.toString() ?? '-' },
    { label: 'GF', value: standings.goalsFor?.toString() ?? '-' },
    { label: 'GA', value: standings.goalsAgainst?.toString() ?? '-' },
    { label: 'GD', value: formatGoalDifference(standings.goalDifference) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {info.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="rounded-[26px] border border-white/[0.07] bg-[#080b10] p-4 shadow-[0_20px_54px_rgba(0,0,0,0.22)] md:p-5">
        <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">Tournament Record</p>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-9">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-secondary">{stat.label}</p>
              <p className="mt-2 text-xl font-black text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.20)]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-text-secondary">{label}</p>
      <p className="mt-2 truncate font-display text-3xl font-black text-accent">{value}</p>
    </div>
  );
}

function formatGoalDifference(value?: number): string {
  if (value === undefined) return '-';
  return value > 0 ? `+${value}` : String(value);
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
