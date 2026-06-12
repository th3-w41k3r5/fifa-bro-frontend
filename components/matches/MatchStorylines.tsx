'use client';

import React, { useMemo } from 'react';
import { StorylineSummary } from '@/types';
import { SectionTitle } from '@/components';
import { Sparkles } from 'lucide-react';

interface MatchStorylinesProps {
  storylines: StorylineSummary[];
}

export default function MatchStorylines({ storylines }: MatchStorylinesProps) {
  // Sort by importance descending
  const sortedStorylines = useMemo(() => {
    return [...storylines].sort((a, b) => b.importance - a.importance);
  }, [storylines]);

  const getImportanceColor = (importance: number) => {
    if (importance >= 80) return 'from-danger to-secondary';
    if (importance >= 60) return 'from-secondary to-primary';
    return 'from-primary to-secondary';
  };

  const getImportanceLabel = (importance: number) => {
    if (importance >= 80) return 'Must-Watch';
    if (importance >= 60) return 'Highly Featured';
    return 'Featured';
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Match Storylines" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStorylines.map((storyline) => (
          <article
            key={storyline.id}
            className="group relative overflow-hidden rounded-xl bg-surface border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 p-6 flex flex-col h-full"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getImportanceColor(
                storyline.importance
              )} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">STORYLINE</p>
                  <h3 className="text-lg md:text-xl font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                    {storyline.title}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  <Sparkles size={20} className="text-secondary" />
                </div>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed flex-grow mb-4 line-clamp-3">
                {storyline.description}
              </p>

              {/* Importance Badge */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary uppercase tracking-wider">Importance</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 w-16">
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getImportanceColor(storyline.importance)}`}
                          style={{ width: `${storyline.importance}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-secondary">{storyline.importance}%</span>
                  </div>
                </div>
                <p className="text-xs text-secondary font-semibold mt-2">
                  {getImportanceLabel(storyline.importance)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
