'use client';

import React from 'react';
import { StandingGroup } from '@/types';
import { Trophy } from 'lucide-react';

interface StandingsPreviewProps {
  standings: StandingGroup[];
  onViewAll?: () => void;
}

export const StandingsPreview: React.FC<StandingsPreviewProps> = ({ standings, onViewAll }) => {
  return (
    <div className="space-y-8">
      {/* Grid of Group Standings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {standings.slice(0, 4).map((group) => (
          <GroupStandings key={group.groupCode} group={group} />
        ))}
      </div>

      {/* View All Button */}
      {onViewAll && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onViewAll}
            className="px-8 py-3 bg-primary text-dark font-bold rounded-lg hover:opacity-90 transition-opacity duration-200 uppercase tracking-widest text-sm"
          >
            View All Standings
          </button>
        </div>
      )}
    </div>
  );
};

interface GroupStandingsProps {
  group: StandingGroup;
}

const GroupStandings: React.FC<GroupStandingsProps> = ({ group }) => {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-surface-elevated px-4 py-3 border-b border-border flex items-center gap-2">
        <Trophy size={18} className="text-secondary" />
        <h3 className="font-bold text-lg text-text-primary">Group {group.groupCode}</h3>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-elevated/50 border-b border-border">
              <th className="px-3 py-2 text-left text-xs text-text-secondary uppercase font-semibold">
                Pos
              </th>
              <th className="px-3 py-2 text-left text-xs text-text-secondary uppercase font-semibold">
                Team
              </th>
              <th className="px-2 py-2 text-center text-xs text-text-secondary uppercase font-semibold">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing, index) => {
              const position = standing.position || index + 1;
              const rowTone =
                position <= 2
                  ? 'bg-emerald-400/[0.12]'
                  : position === 3
                    ? 'bg-yellow-300/[0.11]'
                    : 'bg-white/[0.015]';
              const borderTone =
                position <= 2
                  ? 'border-l-emerald-300'
                  : position === 3
                    ? 'border-l-yellow-300'
                    : 'border-l-white/[0.12]';

              return (
                <tr
  key={standing.teamCode || index}
  className={`border-b border-border/50 border-l-[3px] transition-colors hover:bg-surface-elevated/30 ${rowTone} ${borderTone}`}
>
  <td className="px-3 py-3 font-semibold text-text-primary">
    {position}
  </td>
                  <td className="px-3 py-3 font-semibold text-text-primary">
                    {standing.teamName || standing.teamCode || 'TBD'}
                  </td>
                  <td className="px-2 py-3 text-center font-bold text-primary">
                    {standing.points || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

StandingsPreview.displayName = 'StandingsPreview';
