'use client';

import React from 'react';
import { BookOpen, Trophy, Users, Zap } from 'lucide-react';

interface GroupStatsProps {
  teams: number;
  matches: number;
  featuredMatches: number;
  storylines?: number;
}

export default function GroupStats({ teams = 4, matches = 6, featuredMatches = 0, storylines = 0 }: GroupStatsProps) {
  const stats = [
    { icon: Users, label: 'Teams', value: teams },
    { icon: Zap, label: 'Matches', value: matches },
    { icon: Trophy, label: 'Featured', value: featuredMatches },
    { icon: BookOpen, label: 'Stories', value: storylines },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-text-secondary">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-4xl font-black text-accent">{stat.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.08] text-accent">
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
