'use client';

import React from 'react';
import { MatchSummary } from '@/types';
import { SectionTitle } from '@/components';
import { Calendar, Clock, MapPin, Trophy, Users } from 'lucide-react';
import { getMatchStatusLabel } from '@/lib/matchStatus';

interface MatchDetailsProps {
  match: MatchSummary;
}

export default function MatchDetails({ match }: MatchDetailsProps) {
  const matchDate = match.matchDate ? new Date(match.matchDate) : null;
  const dateStr = matchDate && !isNaN(matchDate.getTime())
    ? matchDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBD';

  const details = [
    {
      label: 'Status',
      value: getMatchStatusLabel(match),
      subtext:
        match.homeScore !== undefined && match.awayScore !== undefined
          ? `${match.homeTeam || match.homeSlot || 'TBD'} ${match.homeScore} - ${match.awayScore} ${match.awayTeam || match.awaySlot || 'TBD'}`
          : undefined,
      icon: <Trophy size={18} className="text-secondary" />,
    },
    {
      label: 'Date',
      value: dateStr,
      icon: <Calendar size={18} className="text-secondary" />,
    },
    {
      label: 'Kickoff',
      value: match.kickoffTime || 'TBD',
      icon: <Clock size={18} className="text-secondary" />,
    },
    {
      label: 'Stadium',
      value: match.stadium,
      subtext: match.city,
      icon: <MapPin size={18} className="text-secondary" />,
    },
    {
      label: 'Group',
      value: `Group ${match.groupCode}`,
      subtext: match.stage,
      icon: <Users size={18} className="text-secondary" />,
    },
  ];

  return (
    <section className="space-y-6">
      <SectionTitle title="Match Details" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="border border-border bg-surface p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              {detail.icon}
              <h4 className="text-sm font-semibold text-text-primary uppercase tracking-widest">
                {detail.label}
              </h4>
            </div>
            <p className="text-lg font-semibold text-text-primary">{detail.value}</p>
            {detail.subtext && <p className="mt-2 text-sm text-text-secondary">{detail.subtext}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
