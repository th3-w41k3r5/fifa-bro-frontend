'use client';

import type { GoalScorer } from '@/types';
import { Goal } from 'lucide-react';

interface MatchGoalScorersProps {
  goalScorers: GoalScorer[];
  maxHeight?: string;
  align?: 'left' | 'right';
}

export function MatchGoalScorers({
  goalScorers,
  maxHeight = 'auto',
  align = 'left',
}: MatchGoalScorersProps) {
  if (!goalScorers?.length) {
    return null;
  }

  return (
    <div
      className="mt-2 space-y-1"
      style={
        maxHeight !== 'auto'
          ? {
            maxHeight,
            overflowY: 'auto',
          }
          : {}
      }
    >
      {goalScorers.map((goal, index) => {
        const raw = String(goal.minute ?? '').trim();

        const minuteText = raw
          ? `${raw.replace(/'+$/g, '')}'`
          : '';

        return (
          <div
            key={`${goal.minute}-${goal.playerName}-${index}`}
            className={`flex items-start gap-1.5 text-[11px] md:text-xs leading-tight text-text-secondary font-medium ${align === 'right' ? 'flex-row-reverse justify-start text-right' : ''}`}
          >
            <Goal
              size={10}
              className="
                mt-[2px]
                shrink-0
                text-text-secondary
                md:h-3.5
                md:w-3.5
              "
            />

            {minuteText && (
              <span className="shrink-0 font-semibold">
                {minuteText}
              </span>
            )}

            <span>
              <span className="hidden sm:inline">
                {goal.playerName}
              </span>

              <span className="sm:hidden">
                {goal.playerName.split(' ').slice(-1)[0]}
              </span>

              {goal.isOwnGoal ? ' (OG)' : goal.isPenalty ? ' (P)' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}