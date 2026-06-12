'use client';

import React from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { Navbar } from '@/components/layout/Navbar';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { getGroups, getHomeData, getMatches, getStorylines } from '@/lib/api';
import type { GroupSummary, MatchSummary, StorylineSummary, TeamSummary } from '@/types';

const buildTeamsFromMatches = (matches: MatchSummary[]): TeamSummary[] => {
  const teams = new Map<string, TeamSummary>();

  matches.forEach((match) => {
    [
      { name: match.homeTeam, code: match.homeTeamCode || match.homeFlagCode },
      { name: match.awayTeam, code: match.awayTeamCode || match.awayFlagCode },
    ].forEach((team) => {
      const code = team.code || team.name.toLowerCase().replace(/\s+/g, '-');
      if (!teams.has(code)) {
        teams.set(code, {
          id: code,
          code,
          name: team.name,
          slug: team.name.toLowerCase().replace(/\s+/g, '-'),
        });
      }
    });
  });

  return Array.from(teams.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export function AppChrome({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = React.useState<MatchSummary[]>([]);
  const [groups, setGroups] = React.useState<GroupSummary[]>([]);
  const [storylines, setStorylines] = React.useState<StorylineSummary[]>([]);

  React.useEffect(() => {
    let mounted = true;

    const fetchSearchData = async () => {
      try {
        const [matchesData, groupsData, storylinesData] = await Promise.all([
          getMatches(),
          getGroups(),
          getStorylines(),
        ]);

        if (!mounted) return;
        setMatches(matchesData);
        setGroups(groupsData);
        setStorylines(storylinesData);
      } catch {
        try {
          const homeData = await getHomeData();
          if (!mounted) return;
          setMatches(homeData.upcomingMatches || []);
          setGroups(homeData.groups || []);
          setStorylines(homeData.storylines || []);
        } catch {
          if (!mounted) return;
          setMatches([]);
          setGroups([]);
          setStorylines([]);
        }
      }
    };

    fetchSearchData();

    return () => {
      mounted = false;
    };
  }, []);

  const teams = React.useMemo(() => buildTeamsFromMatches(matches), [matches]);

  return (
    <AppSettingsProvider>
      <Navbar teams={teams} matches={matches} groups={groups} storylines={storylines} />
      <MobileNav />
      {children}
    </AppSettingsProvider>
  );
}
