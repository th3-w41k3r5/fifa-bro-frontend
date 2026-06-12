'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { MatchSummary, StorylineSummary } from '@/types';
import { HeroMatch } from './HeroMatch';

interface HeroMatchSelectorProps {
  matches: MatchSummary[];
  storylines: StorylineSummary[];
}

export interface HeroMatchSelection {
  match: MatchSummary;
  storyline: StorylineSummary;
}

const IST_OFFSET_MINUTES = 330;
const LIVE_WINDOW_MINUTES = 90;

function getKickoffTime(match: MatchSummary) {
  const date = match.matchDate.slice(0, 10);
  const time = match.kickoffTime.includes('T') ? match.kickoffTime.split('T')[1] : match.kickoffTime;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.replace(/Z$/, '').split(':').map(Number);

  return Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60 * 1000;
}

export function selectHeroMatch(
  matches: MatchSummary[],
  storylines: StorylineSummary[],
  now: number = Date.now()
): HeroMatchSelection | null {
  const matchesById = new Map(matches.map((match) => [String(match.id), match]));

  const candidates = storylines
    .map((storyline) => {
      const match = matchesById.get(String(storyline.matchId));
      if (!match) return null;

      const kickoff = getKickoffTime(match);
      const liveUntil = kickoff + LIVE_WINDOW_MINUTES * 60 * 1000;
      if (!Number.isFinite(kickoff) || liveUntil <= now) return null;

      return { match, storyline, kickoff };
    })
    .filter(
      (
        candidate
      ): candidate is HeroMatchSelection & {
        kickoff: number;
      } => candidate !== null
    )
    .sort((a, b) => {
      if (a.kickoff !== b.kickoff) return a.kickoff - b.kickoff;
      return b.storyline.importance - a.storyline.importance;
    });

  return candidates[0] ?? null;
}

export const HeroMatchSelector: React.FC<HeroMatchSelectorProps> = ({ matches, storylines }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const selection = useMemo(() => selectHeroMatch(matches, storylines, now), [matches, now, storylines]);

  if (!selection) return null;

  return <HeroMatch match={selection.match} storyline={selection.storyline} allMatches={matches} />;
};

HeroMatchSelector.displayName = 'HeroMatchSelector';

export default HeroMatchSelector;
