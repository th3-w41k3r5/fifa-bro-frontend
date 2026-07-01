import type { MatchSummary } from '@/types';

export interface StoryStage {
  label: string;
  shortLabel: string;
  dbValue: string;
  slug: string;
}

export const STORY_STAGES: StoryStage[] = [
  { label: 'First Stage', shortLabel: 'Groups', dbValue: 'First Stage', slug: 'group' },
  { label: 'Round of 32', shortLabel: 'R32', dbValue: 'Round of 32', slug: 'r32' },
  { label: 'Round of 16', shortLabel: 'R16', dbValue: 'Round of 16', slug: 'r16' },
  { label: 'Quarter Finals', shortLabel: 'QF', dbValue: 'Quarter-final', slug: 'qf' },
  { label: 'Semi Finals', shortLabel: 'SF', dbValue: 'Semi-final', slug: 'sf' },
  { label: '3rd Place', shortLabel: '3rd', dbValue: 'Play-off for third place', slug: '3rd' },
  { label: 'Final', shortLabel: 'Final', dbValue: 'Final', slug: 'final' },
];

export function slugToStage(slug: string): StoryStage | undefined {
  return STORY_STAGES.find((s) => s.slug === slug);
}

export function dbValueToStage(dbValue: string): StoryStage | undefined {
  return STORY_STAGES.find((s) => s.dbValue === dbValue);
}

function isCompleted(status?: string): boolean {
  const s = status?.toLowerCase() ?? '';
  return s === 'complete' || s === 'completed' || s === 'ft';
}

export function getCurrentStorylineStage(matches: MatchSummary[]): StoryStage {
  for (const stage of STORY_STAGES) {
    const stageMatches = matches.filter((m) => m.stage === stage.dbValue);
    if (stageMatches.length === 0) {
      return stage;
    }
    const allComplete = stageMatches.every((m) => isCompleted(m.status));
    if (!allComplete) {
      return stage;
    }
  }
  return STORY_STAGES[STORY_STAGES.length - 1];
}
