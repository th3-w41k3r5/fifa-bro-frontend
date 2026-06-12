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
            {group.standings.map((standing, index) => (
              <tr
                key={standing.teamCode || index}
                className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
              >
                <td className="px-3 py-3 text-text-secondary font-semibold">
                  {standing.position || index + 1}
                </td>
                <td className="px-3 py-3 text-text-primary font-semibold">
                  {standing.teamName || standing.teamCode || 'TBD'}
                </td>
                <td className="px-2 py-3 text-center text-primary font-bold">
                  {standing.points || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

StandingsPreview.displayName = 'StandingsPreview';
