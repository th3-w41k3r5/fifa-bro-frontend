'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TeamLogo } from '@/components';
import { GroupSummary, MatchSummary, StandingGroup, StandingRow, ThirdPlaceRankingsPayload } from '@/types';
import { ArrowRight, ShieldCheck, Trophy } from 'lucide-react';

interface GroupsExplorerProps {
  groups: GroupSummary[];
  standings?: StandingGroup[];
  matches?: MatchSummary[];
  thirdPlaceRankings?: ThirdPlaceRankingsPayload | null;
}

function normalizeTeamKey(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

export const GroupsExplorer: React.FC<GroupsExplorerProps> = ({ groups, standings = [], matches = [], thirdPlaceRankings }) => {
  const [hydratedStandings, setHydratedStandings] = useState<StandingGroup[]>(standings);

  useEffect(() => {
    setHydratedStandings(standings);
  }, [standings]);

  useEffect(() => {
    if (!groups.length) return;

    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

    async function fetchGroupStandings() {
      const results = await Promise.all(
        groups.map(async (group) => {
          try {
            const response = await fetch(`${apiBase}/groups/${group.code}`);
            if (!response.ok) return null;

            const payload = await response.json();
            const groupStandings = payload?.data?.standings;

            if (!payload?.success || !Array.isArray(groupStandings)) {
              return null;
            }

            return {
              groupCode: group.code,
              standings: groupStandings as StandingRow[],
            };
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        const validResults = results.filter(Boolean) as StandingGroup[];

        if (validResults.length > 0) {
          setHydratedStandings(validResults);
        }
      }
    }

    fetchGroupStandings();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  const standingsByGroup = useMemo(
    () => new Map(hydratedStandings.map((group) => [group.groupCode, group.standings])),
    [hydratedStandings]
  );

  const { teamsByCode, teamsByName } = useMemo(() => {
    const codeMap = new Map<string, { name: string; flagCode?: string; teamCode?: string }>();
    const nameMap = new Map<string, { name: string; flagCode?: string; teamCode?: string }>();

    matches.forEach((match) => {
      const homeMeta = {
        name: match.homeTeam,
        flagCode: match.homeFlagCode,
        teamCode: match.homeTeamCode,
      };
      const awayMeta = {
        name: match.awayTeam,
        flagCode: match.awayFlagCode,
        teamCode: match.awayTeamCode,
      };

      if (match.homeTeamCode) {
        codeMap.set(match.homeTeamCode, homeMeta);
      }

      if (match.awayTeamCode) {
        codeMap.set(match.awayTeamCode, awayMeta);
      }

      nameMap.set(normalizeTeamKey(match.homeTeam), homeMeta);
      nameMap.set(normalizeTeamKey(match.awayTeam), awayMeta);
    });

    return { teamsByCode: codeMap, teamsByName: nameMap };
  }, [matches]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupCard
          key={group.code}
          group={group}
          standings={standingsByGroup.get(group.code) ?? []}
          teamsByCode={teamsByCode}
          teamsByName={teamsByName}
          thirdPlaceRankings={thirdPlaceRankings}
        />
      ))}
    </div>
  );
};

interface GroupCardProps {
  group: GroupSummary;
  standings: StandingRow[];
  teamsByCode: Map<string, { name: string; flagCode?: string; teamCode?: string }>;
  teamsByName: Map<string, { name: string; flagCode?: string; teamCode?: string }>;
  thirdPlaceRankings?: ThirdPlaceRankingsPayload | null;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, standings, teamsByCode, teamsByName, thirdPlaceRankings }) => {
  return (
    <article className="group relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_28px_72px_rgba(0,183,255,0.10)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)] opacity-70 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Group</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-6xl font-black leading-[0.82] text-text-primary">{group.code}</span>
            <div className="pb-1">
              <h3 className="text-base font-extrabold text-text-primary">{group.name || `Group ${group.code}`}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Full standings
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/groups/${group.code}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.08] text-accent transition-transform hover:bg-accent hover:text-dark group-hover:translate-x-1"
          aria-label={`Open Group ${group.code}`}
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20">
        <div className="grid grid-cols-[34px_1fr_34px_34px_38px] gap-2 border-b border-white/[0.06] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">
          <span>#</span>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">GD</span>
          <span className="text-right">Pts</span>
        </div>

        <div>
          {standings.length > 0 ? (
            standings.map((standing, index) => (
              <StandingLine
                key={standing.teamCode || index}
                standing={standing}
                index={index}
                teamMeta={
                  teamsByCode.get(standing.teamCode) ||
                  teamsByName.get(normalizeTeamKey(standing.teamName)) ||
                  teamsByName.get(normalizeTeamKey(standing.teamCode))
                }
                thirdPlaceRankings={thirdPlaceRankings}
              />
            ))
          ) : (
            <div className="px-3 py-8 text-center text-sm font-semibold text-text-secondary">
              Standings will appear once group data is available.
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between pt-4 text-xs font-bold text-text-secondary">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-300" />
          Top 2 qualify
        </span>
        <span className="inline-flex items-center gap-2">
          <Trophy size={14} className="text-yellow-300" />
          3rd holding
        </span>
      </div>
    </article>
  );
};

function StandingLine({
  standing,
  index,
  teamMeta,
  thirdPlaceRankings,
}: {
  standing: StandingRow;
  index: number;
  teamMeta?: { name: string; flagCode?: string; teamCode?: string };
  thirdPlaceRankings?: ThirdPlaceRankingsPayload | null;
}) {
  const position = standing.position || index + 1;
  const teamName = standing.teamName || teamMeta?.name || standing.teamCode || 'TBD';
  const teamId = teamMeta?.teamCode || standing.teamCode || teamName;
  const teamHref = teamId ? `/teams/${encodeURIComponent(teamId)}` : undefined;
  const flagCode = teamMeta?.flagCode || teamName.toLowerCase().slice(0, 2);
  
  let isQualifiedThird = false;
  if (position === 3 && thirdPlaceRankings) {
    // Check if team is in qualified list
    isQualifiedThird = thirdPlaceRankings.qualified.some(
      (t: { teamName: string; teamCode: string }) => t.teamName.toLowerCase() === teamName.toLowerCase() || 
           (teamMeta?.teamCode && t.teamCode.toLowerCase() === teamMeta.teamCode.toLowerCase())
    );
  }

  const rowTone =
    position <= 2
      ? 'bg-emerald-400/[0.080]'
      : position === 3
        ? (isQualifiedThird ? 'bg-yellow-300/[0.080]' : 'bg-red-400/[0.080]')
        : 'bg-red-400/[0.080]';
  const borderTone =
    position <= 2
      ? 'border-l-emerald-300'
      : position === 3
        ? (isQualifiedThird ? 'border-l-yellow-300' : 'border-l-red-700/[0.12]')
        : 'border-l-red-700/[0.12]';
      

  return (
    <div
      className={`grid grid-cols-[34px_1fr_34px_34px_38px] border-t border-white/[0.055] border-l-2 items-center gap-2 px-3 py-3 text-sm transition-colors hover:bg-white/[0.04] ${rowTone} ${borderTone}`}
    >
      <span className={`-ml-3 pl-3 font-black text-text-primary`}>
        {position}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-5 w-5 shrink-0">
          <TeamLogo flagCode={flagCode} teamName={teamName} size="sm" />
        </span>
        {teamHref ? (
          <Link
            href={teamHref}
            className="truncate font-extrabold text-text-primary transition-colors duration-200 hover:text-[#00B7FF] focus:outline-none focus-visible:text-[#00B7FF]"
          >
            {teamName}
          </Link>
        ) : (
          <span className="truncate font-extrabold text-text-primary">{teamName}</span>
        )}
      </span>
      <span className="text-center font-bold text-text-secondary">{standing.played ?? 0}</span>
      <span className="text-center font-bold text-text-secondary">
        {(standing.goalDifference ?? 0) > 0 ? '+' : ''}
        {standing.goalDifference ?? 0}
      </span>
      <span className="text-right font-black text-accent">{standing.points ?? 0}</span>
    </div>
  );
}

GroupsExplorer.displayName = 'GroupsExplorer';
