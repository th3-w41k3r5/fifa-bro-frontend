'use client';

import React from 'react';
import { StandingRow, TeamSummary } from '@/types';
import { Flag } from '@/components';

interface TeamStandingsTableProps {
  standings: StandingRow[];
  highlightTeam?: string;
  teams?: TeamSummary[];
}

function normalizeTeamKey(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

export default function TeamStandingsTable({ standings, highlightTeam, teams = [] }: TeamStandingsTableProps) {
  const teamsByCode = new Map(teams.map((team) => [team.code, team]));
  const teamsByName = new Map(teams.map((team) => [normalizeTeamKey(team.name), team]));

  return (
    <div className="overflow-x-auto rounded-[26px] border border-white/[0.07] bg-[#080b10] shadow-[0_20px_54px_rgba(0,0,0,0.22)]">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-white/[0.035]">
            {['Pos', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((heading) => (
              <th
                key={heading}
                className={`px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-text-secondary ${
                  heading === 'Team' ? 'text-left' : heading === 'Pts' ? 'text-right' : 'text-center'
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.055]">
          {standings.map((row, idx) => {
            const position = row.position || idx + 1;
            const isHighlighted = highlightTeam && row.teamName === highlightTeam;
            const team =
              teamsByCode.get(row.teamCode) || teamsByName.get(normalizeTeamKey(row.teamName || row.teamCode));
            const teamName = row.teamName || team?.name || row.teamCode;
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
                key={row.id ? String(row.id) : `${row.teamName}-${idx}`}
                className={`transition-colors hover:bg-white/[0.04] ${rowTone} ${
                  isHighlighted ? 'outline outline-1 outline-accent/35' : ''
                }`}
              >
                <td className={`border-l-2 px-4 py-4 text-center font-black text-text-primary ${borderTone}`}>
                  {position}
                </td>
                <td className={`px-4 py-4 font-extrabold ${isHighlighted ? 'text-accent' : 'text-text-primary'}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    {team?.flagCode && <Flag flagCode={team.flagCode} size="sm" variant="square" />}
                    <span className="truncate">{teamName}</span>
                  </div>
                </td>
                <StatCell value={row.played} />
                <StatCell value={row.won} />
                <StatCell value={row.drawn} />
                <StatCell value={row.lost} />
                <StatCell value={row.goalsFor} />
                <StatCell value={row.goalsAgainst} />
                <td
                  className={`px-4 py-4 text-center font-black ${
                    (row.goalDifference ?? 0) > 0
                      ? 'text-emerald-300'
                      : (row.goalDifference ?? 0) < 0
                        ? 'text-red-300'
                        : 'text-text-secondary'
                  }`}
                >
                  {(row.goalDifference ?? 0) > 0 ? '+' : ''}
                  {row.goalDifference ?? 0}
                </td>
                <td
                  className={`px-4 py-4 text-right font-black ${isHighlighted ? 'text-accent' : 'text-text-primary'}`}
                >
                  {row.points || 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatCell({ value }: { value?: number }) {
  return <td className="px-4 py-4 text-center font-bold text-text-secondary">{value || 0}</td>;
}
