'use client';

import React from 'react';
import { Badge } from '@/types';
import { SectionTitle } from '@/components';

interface MatchBadgesProps {
  badges: Badge[];
}

const badgeDescriptions: Record<string, string> = {
  'opening-match': 'The opening match of the FIFA World Cup 2026.',
  'must-watch': 'Selected as one of the most important matches of the tournament.',
  'featured': 'Highlighted as a featured match.',
  'group-of-death': 'Part of the toughest group in the tournament.',
  'revenge-match': 'A rematch between two rivals.',
  'historic-clash': 'A historic matchup between two football giants.',
  'heavyweights': 'A clash between two top-ranked teams.',
  'underdog-battle': 'An underdog team facing a stronger opponent.',
};

export default function MatchBadges({ badges }: MatchBadgesProps) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Match Badges" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="rounded-lg bg-surface border border-border p-6 hover:border-primary/50 transition-colors duration-300"
          >
            <div className="flex items-start gap-4">
              {/* Badge Icon */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                <span
                  className="text-xl"
                  title={badge.name}
                  role="img"
                  aria-label={badge.name}
                >
                  {badge.icon}
                </span>
              </div>

              {/* Badge Info */}
              <div className="flex-grow">
                <h3 className="font-bold text-text-primary mb-2">{badge.name}</h3>
                <p className="text-sm text-text-secondary">
                  {badgeDescriptions[badge.slug] || `${badge.name} badge`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
