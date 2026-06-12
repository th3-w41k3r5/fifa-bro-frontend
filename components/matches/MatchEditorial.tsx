'use client';

import React from 'react';
import { SectionTitle } from '@/components';
import { StorylineSummary } from '@/types';

interface MatchEditorialProps {
  homeTeam: string;
  awayTeam: string;
  group: string;
  heroText: string;
  storylines?: StorylineSummary[];
}

export default function MatchEditorial({
  homeTeam,
  awayTeam,
  group,
  heroText,
  storylines = [],
}: MatchEditorialProps) {
  const primaryStoryline = storylines.length > 0 ? storylines[0] : null;

  return (
    <section className="space-y-8">
      <div className="border border-border bg-surface p-8 rounded-2xl">
        <SectionTitle title="Match Preview" />

        {primaryStoryline && (
          <div className="mt-6 border-l-4 border-secondary bg-dark/30 p-6">
            <p className="text-xs uppercase tracking-widest text-text-secondary mb-3">Featured Narrative</p>
            <h3 className="text-2xl font-bold text-text-primary mb-3">{primaryStoryline.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{primaryStoryline.description}</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-black text-text-primary leading-tight">{heroText}</h2>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              {homeTeam} takes on {awayTeam} in a crucial Group {group} encounter of the FIFA World Cup 2026. This match promises to be a compelling battle between two fierce competitors as they vie for qualification to the knockout stages of the tournament.
            </p>
            <p>
              Watch as these two nations clash in what could be a decisive moment in their tournament journey. Every goal, every save, and every play could determine their path forward in the competition.
            </p>
          </div>
        </div>

        {storylines.length > 1 && (
          <div className="mt-10 border-t border-border pt-6">
            <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-4">Additional Themes</h4>
            <div className="space-y-4">
              {storylines.slice(1, 3).map((storyline) => (
                <div key={storyline.id}>
                  <p className="text-sm font-semibold text-text-primary mb-1">{storyline.title}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{storyline.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
