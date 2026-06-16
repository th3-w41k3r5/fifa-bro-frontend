'use client';

import React from 'react';
import {
  Calendar,
  Cloud,
  ClipboardList,
  MapPin,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { FifaMatchDetail } from '@/types';
import { getLocalizedText, getOfficialName } from '@/lib/fifaMatchUtils';

interface MatchCentreDetailsProps {
  fifaDetail: FifaMatchDetail;
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

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.22)] transition hover:border-accent/25">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.08] text-accent">
            {icon}
          </span>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-secondary">
            {label}
          </p>
        </div>
        <p className="text-lg font-extrabold text-text-primary">{value}</p>
        {subtext && <p className="mt-1 text-sm text-text-secondary">{subtext}</p>}
      </div>
    </article>
  );
}

export default function MatchCentreDetails({ fifaDetail }: MatchCentreDetailsProps) {
  const referee = (fifaDetail.Officials ?? []).find((official) => official?.OfficialType === 1);
  const stageName = getLocalizedText(fifaDetail.StageName);
  const groupName = getLocalizedText(fifaDetail.GroupName);
  const stadiumName = getLocalizedText(fifaDetail.Stadium?.Name);
  const cityName = getLocalizedText(fifaDetail.Stadium?.CityName);
  const weatherType =
    getLocalizedText(fifaDetail.Weather?.TypeLocalized) || fifaDetail.Weather?.Type || '';

  const kickoff = fifaDetail.LocalDate
    ? new Date(fifaDetail.LocalDate).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : fifaDetail.MatchTime || 'TBD';

  const cards: StatCardProps[] = [
    {
      label: 'Venue',
      value: stadiumName || 'TBD',
      subtext: cityName || undefined,
      icon: <MapPin size={16} />,
    },
    {
      label: 'Attendance',
      value: fifaDetail.Attendance ? Number(fifaDetail.Attendance).toLocaleString('en-US') : 'TBD',
      icon: <Users size={16} />,
    },
    {
      label: 'Referee',
      value: getOfficialName(referee),
      icon: <User size={16} />,
    },
    {
      label: 'Match Number',
      value: fifaDetail.MatchNumber != null ? String(fifaDetail.MatchNumber) : 'TBD',
      icon: <ClipboardList size={16} />,
    },
    {
      label: 'Kickoff',
      value: kickoff,
      icon: <Calendar size={16} />,
    },
    {
      label: 'Stage',
      value: stageName || 'TBD',
      icon: <Trophy size={16} />,
    },
    {
      label: 'Group',
      value: groupName || 'TBD',
      icon: <ClipboardList size={16} />,
    },
  ];

  if (weatherType) {
    cards.push({
      label: 'Weather',
      value: weatherType,
      icon: <Cloud size={16} />,
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Match Details" icon={<ClipboardList size={28} />} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
