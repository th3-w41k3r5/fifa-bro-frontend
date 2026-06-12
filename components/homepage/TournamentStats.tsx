'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Flag, Landmark } from 'lucide-react';

interface TournamentStatsProps {
  animated?: boolean;
}

interface Stat {
  icon: React.ReactNode;
  value: number;
  label: string;
  eyebrow: string;
  description: string;
  suffix?: string;
}

export const TournamentStats: React.FC<TournamentStatsProps> = ({ animated = true }) => {
  const [displayValues, setDisplayValues] = useState({
    teams: 0,
    matches: 0,
    groups: 0,
    stadiums: 0,
  });

  const stats: Stat[] = [
    {
      icon: <Users size={24} />,
      value: 48,
      label: 'Teams',
      eyebrow: 'Expanded field',
      description: 'Nations competing across twelve groups',
    },
    {
      icon: <Zap size={24} />,
      value: 104,
      label: 'Matches',
      eyebrow: 'Full schedule',
      description: 'From opening night to the final',
    },
    {
      icon: <Flag size={24} />,
      value: 12,
      label: 'Groups',
      eyebrow: 'First stage',
      description: 'Group paths into the knockout bracket',
    },
    {
      icon: <Landmark size={24} />,
      value: 16,
      label: 'Stadiums',
      eyebrow: 'Host venues',
      description: 'Across the tournament footprint',
    },
  ];

  // Animate counter if enabled
  useEffect(() => {
    if (!animated) {
      setDisplayValues({
        teams: 48,
        matches: 104,
        groups: 12,
        stadiums: 16,
      });
      return;
    }

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayValues({
        teams: Math.floor(48 * progress),
        matches: Math.floor(104 * progress),
        groups: Math.floor(12 * progress),
        stadiums: Math.floor(16 * progress),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={stats[0].icon}
        value={displayValues.teams}
        label={stats[0].label}
        eyebrow={stats[0].eyebrow}
        description={stats[0].description}
      />
      <StatCard
        icon={stats[1].icon}
        value={displayValues.matches}
        label={stats[1].label}
        eyebrow={stats[1].eyebrow}
        description={stats[1].description}
      />
      <StatCard
        icon={stats[2].icon}
        value={displayValues.groups}
        label={stats[2].label}
        eyebrow={stats[2].eyebrow}
        description={stats[2].description}
      />
      <StatCard
        icon={stats[3].icon}
        value={displayValues.stadiums}
        label={stats[3].label}
        eyebrow={stats[3].eyebrow}
        description={stats[3].description}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  eyebrow: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, eyebrow, description }) => {
  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-6 shadow-[0_22px_58px_rgba(0,0,0,0.24)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.16),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.06),transparent_42%)] opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-display text-5xl font-black leading-none text-text-primary tabular-nums md:text-6xl">
              {value}
            </span>
            <span className="pb-1 text-sm font-black uppercase tracking-[0.16em] text-text-secondary">{label}</span>
          </div>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.08] text-accent shadow-[0_12px_34px_rgba(0,183,255,0.10)]">
          {icon}
        </div>
      </div>

      <p className="relative z-10 mt-5 max-w-[240px] text-sm font-semibold leading-relaxed text-text-secondary">
        {description}
      </p>
    </motion.article>
  );
};

TournamentStats.displayName = 'TournamentStats';
