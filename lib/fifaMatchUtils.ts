import {
  FifaLocalizedField,
  FifaMatchDetail,
  FifaPlayer,
  FifaTeamDetail,
  FifaCoach,
} from '@/types';

export function getLocalizedText(field?: FifaLocalizedField[]): string {
  return field?.[0]?.Description ?? '';
}

export function parseMinute(minute?: string): string {
  return minute ? minute.replace(/'+/g, '').trim() : '';
}

export function formatEventMinute(value?: string, extra?: string): string {
  const raw = parseMinute(value);
  if (!raw) return '';
  const extraRaw = parseMinute(extra);
  if (extraRaw) return `${raw}+${extraRaw}'`;
  return `${raw}'`;
}

export function parseTimelineSortKey(minute: string): number {
  const cleaned = minute.replace(/'/g, '').trim();
  if (!cleaned) return 0;
  if (cleaned.includes('+')) {
    const [base, extra] = cleaned.split('+');
    return (Number(base) || 0) * 100 + (Number(extra) || 0);
  }
  return (Number(cleaned) || 0) * 100;
}

export function getPlayerDisplayName(player?: FifaPlayer | null): string {
  if (!player) return 'Unknown player';
  const fullName = getLocalizedText(player.PlayerName);
  if (fullName) return fullName;
  return getLocalizedText(player.ShortName) || 'Unknown player';
}

export function getPlayerShortName(player?: FifaPlayer | null): string {
  if (!player) return 'Unknown';
  const shortName = getLocalizedText(player.ShortName);
  if (shortName) return shortName;

  const fullName = getLocalizedText(player.PlayerName);
  if (!fullName) return 'Unknown';

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const firstInitial = parts[0][0]?.toUpperCase() ?? '';
  return `${firstInitial}. ${lastName}`;
}

export interface PlayerMatchEvents {
  goals: number;
  yellowCards: number;
  redCards: number;
  substitutedOff: boolean;
  substitutedOn: boolean;
}

export function buildPlayerEventsMap(team: FifaTeamDetail): Map<string, PlayerMatchEvents> {
  const map = new Map<string, PlayerMatchEvents>();

  const ensure = (id: string): PlayerMatchEvents => {
    const existing = map.get(id);
    if (existing) return existing;
    const entry: PlayerMatchEvents = {
      goals: 0,
      yellowCards: 0,
      redCards: 0,
      substitutedOff: false,
      substitutedOn: false,
    };
    map.set(id, entry);
    return entry;
  };

  for (const goal of team.Goals ?? []) {
    if (!goal.IdPlayer) continue;
    const entry = ensure(String(goal.IdPlayer));
    entry.goals += 1;
  }

  for (const booking of team.Bookings ?? []) {
    if (!booking.IdPlayer) continue;
    const entry = ensure(String(booking.IdPlayer));
    if (booking.Card === 2) entry.redCards += 1;
    else if (booking.Card === 1) entry.yellowCards += 1;
  }

  for (const sub of team.Substitutions ?? []) {
    if (sub.IdPlayerOff) ensure(String(sub.IdPlayerOff)).substitutedOff = true;
    if (sub.IdPlayerOn) ensure(String(sub.IdPlayerOn)).substitutedOn = true;
  }

  return map;
}

export function groupPlayersByPosition(players: FifaPlayer[]) {
  const groups: Record<'gk' | 'def' | 'mid' | 'fwd', FifaPlayer[]> = {
    gk: [],
    def: [],
    mid: [],
    fwd: [],
  };

  const sortByShirt = (list: FifaPlayer[]) =>
    [...list].sort((a, b) => (Number(a.ShirtNumber) || 0) - (Number(b.ShirtNumber) || 0));

  for (const player of players) {
    if (player.Position === 0) groups.gk.push(player);
    else if (player.Position === 1) groups.def.push(player);
    else if (player.Position === 2) groups.mid.push(player);
    else if (player.Position === 3) groups.fwd.push(player);
    else groups.mid.push(player);
  }

  return {
    gk: sortByShirt(groups.gk),
    def: sortByShirt(groups.def),
    mid: sortByShirt(groups.mid),
    fwd: sortByShirt(groups.fwd),
  };
}

export function getCoachName(coach?: { Name?: FifaLocalizedField[] }): string {
  return getLocalizedText(coach?.Name) || 'Coach';
}

export function getHeadCoach(coaches?: FifaCoach[]): FifaCoach | undefined {
  if (!coaches?.length) return undefined;
  return coaches.find((coach) => coach.Role === 0) ?? coaches.find((coach) => coach.PictureUrl) ?? coaches[0];
}

export function getCoachPictureUrl(coach?: FifaCoach): string | undefined {
  const url = coach?.PictureUrl;
  return url && url.trim() ? url : undefined;
}

export function getOfficialName(official?: {
  NameShort?: FifaLocalizedField[];
  Name?: FifaLocalizedField[];
}): string {
  return getLocalizedText(official?.NameShort ?? official?.Name) || 'Official';
}

export function getPositionLabel(position?: number): string {
  const labels: Record<number, string> = {
    0: 'Goalkeeper',
    1: 'Defender',
    2: 'Midfielder',
    3: 'Forward',
  };
  if (position == null) return 'Player';
  return labels[position] ?? 'Player';
}

export function getPlayerPictureUrl(player?: FifaPlayer | null): string | undefined {
  return player?.PlayerPicture?.PictureUrl;
}

export function buildPlayerMap(teams: Array<{ Players?: FifaPlayer[] }>) {
  const map = new Map<string, FifaPlayer>();
  for (const team of teams) {
    for (const player of team.Players ?? []) {
      if (player?.IdPlayer) {
        map.set(String(player.IdPlayer), player);
      }
    }
  }
  return map;
}

export type MatchStateKind =
  | 'match_start'
  | 'half_time'
  | 'second_half_start'
  | 'full_time'
  | 'extra_time_start'
  | 'extra_time_half_time'
  | 'extra_time_second_half_start'
  | 'penalty_shootout_start';

export type TimelineEvent =
  | {
      id: string;
      minute: string;
      sortKey: number;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'goal';
      playerName: string;
      goalType: number;
      assistName?: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'booking';
      playerName: string;
      cardType: number;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'substitution';
      playerOff: string;
      playerOn: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      type: 'match_state';
      stateKind: MatchStateKind;
      label: string;
      priority: number;
    };

const EVENT_PRIORITY = {
  goal: 0,
  penaltyGoal: 1,
  ownGoal: 2,
  redCard: 3,
  yellowCard: 4,
  substitution: 5,
  matchState: 6,
} as const;

function goalEventPriority(goalType?: number): number {
  if (goalType === 1) return EVENT_PRIORITY.penaltyGoal;
  if (goalType === 3) return EVENT_PRIORITY.ownGoal;
  return EVENT_PRIORITY.goal;
}

function isValidTimelineMinute(minute: string): boolean {
  const cleaned = minute.replace(/'/g, '').trim();
  return cleaned.length > 0;
}

function resolveStateMinute(value?: string | null, fallback?: string): string {
  if (value && !value.includes('T')) {
    const formatted = formatEventMinute(value);
    if (formatted) return formatted;
  }

  return fallback ?? '';
}

function buildMatchStateEvents(fifaDetail: FifaMatchDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const period = fifaDetail.Period ?? 0;
  const matchTimeMinute = resolveStateMinute(fifaDetail.MatchTime);
  const hasPenalties =
    fifaDetail.HomeTeamPenaltyScore != null || fifaDetail.AwayTeamPenaltyScore != null;
  const hasExtraTime =
    fifaDetail.FirstHalfExtraTime != null || fifaDetail.SecondHalfExtraTime != null;
  const matchStarted =
    period > 0 ||
    Boolean(matchTimeMinute) ||
    Boolean(fifaDetail.HomeTeam?.Goals?.length) ||
    Boolean(fifaDetail.AwayTeam?.Goals?.length);

  const isSecondHalfAvailable = Boolean(fifaDetail.SecondHalfTime);
  const isFullTimeAvailable = Boolean(matchTimeMinute && period >= 10);

  const pushState = (
    id: string,
    stateKind: MatchStateKind,
    label: string,
    minute: string
  ) => {
    if (!minute) return;
    events.push({
      id,
      minute,
      sortKey: parseTimelineSortKey(minute),
      type: 'match_state',
      stateKind,
      label,
      priority: EVENT_PRIORITY.matchState,
    });
  };

  if (matchStarted) {
    pushState(
      'state-match-start',
      'match_start',
      'Match Start',
      resolveStateMinute(fifaDetail.FirstHalfTime, "0'")
    );
  }

  pushState(
    'state-half-time',
    'half_time',
    'Half Time',
    resolveStateMinute(fifaDetail.FirstHalfTime)
  );

  if (isSecondHalfAvailable) {
    pushState(
      'state-second-half-start',
      'second_half_start',
      'Second Half Start',
      resolveStateMinute(fifaDetail.SecondHalfTime)
    );
  }

  if (isFullTimeAvailable) {
    pushState(
      'state-full-time',
      'full_time',
      'Full Time',
      matchTimeMinute
    );
  }

  if (fifaDetail.FirstHalfExtraTime != null || hasExtraTime) {
    pushState(
      'state-extra-time-start',
      'extra_time_start',
      'Extra Time Start',
      resolveStateMinute(fifaDetail.FirstHalfExtraTime, "91'")
    );
  }

  if (fifaDetail.FirstHalfExtraTime != null && fifaDetail.SecondHalfExtraTime != null) {
    pushState(
      'state-extra-time-half-time',
      'extra_time_half_time',
      'Extra Time Half Time',
      "105'"
    );
  }

  if (fifaDetail.SecondHalfExtraTime != null) {
    pushState(
      'state-extra-time-second-half-start',
      'extra_time_second_half_start',
      'Extra Time Second Half Start',
      resolveStateMinute(fifaDetail.SecondHalfExtraTime, "106'")
    );
  }

  if (hasPenalties) {
    pushState(
      'state-penalty-shootout-start',
      'penalty_shootout_start',
      'Penalty Shootout Start',
      matchTimeMinute || "120'"
    );
  }

  return events;
}

function compareTimelineEvents(a: TimelineEvent, b: TimelineEvent): number {
  if (b.sortKey !== a.sortKey) return b.sortKey - a.sortKey;
  return a.priority - b.priority;
}

function createEventId(prefix: string, source: Record<string, unknown>): string {
  return `${prefix}-${String(source.Minute ?? source.IdPlayer ?? source.IdTeam ?? '')}-${String(source.IdPlayer ?? source.IdPlayerOff ?? source.IdPlayerOn ?? '')}`;
}

export function buildTimelineEvents(
  fifaDetail: FifaMatchDetail,
  homeTeamDetail: FifaTeamDetail,
  awayTeamDetail: FifaTeamDetail,
  playerMap: Map<string, FifaPlayer>
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const homeTeamName = getLocalizedText(fifaDetail.HomeTeam?.TeamName);
  const awayTeamName = getLocalizedText(fifaDetail.AwayTeam?.TeamName);

  const pushGoalEvents = (team: FifaTeamDetail, side: 'home' | 'away') => {
    const teamName = side === 'home' ? homeTeamName : awayTeamName;
    for (const goal of team.Goals ?? []) {
      const minute = formatEventMinute(
        goal.EventMinuteRegulation ?? goal.Minute ?? goal.EventMinute,
        goal.EventMinuteExtra
      );
      if (!isValidTimelineMinute(minute)) continue;

      const scorer = playerMap.get(String(goal.IdPlayer));
      const assist = goal.IdAssistPlayer ? playerMap.get(String(goal.IdAssistPlayer)) : undefined;
      events.push({
        id: createEventId('goal', goal as Record<string, unknown>),
        minute,
        sortKey: parseTimelineSortKey(minute),
        type: 'goal',
        teamSide: side,
        teamName,
        playerName: scorer ? getPlayerDisplayName(scorer) : 'Unknown player',
        goalType: goal.Type ?? 0,
        assistName: assist ? getPlayerDisplayName(assist) : undefined,
        priority: goalEventPriority(goal.Type),
      });
    }
  };

  const pushBookingEvents = (team: FifaTeamDetail, side: 'home' | 'away') => {
    const teamName = side === 'home' ? homeTeamName : awayTeamName;
    for (const booking of team.Bookings ?? []) {
      const minute = formatEventMinute(booking.Minute);
      if (!isValidTimelineMinute(minute)) continue;

      const player = playerMap.get(String(booking.IdPlayer));
      events.push({
        id: createEventId('booking', booking as Record<string, unknown>),
        minute,
        sortKey: parseTimelineSortKey(minute),
        type: 'booking',
        teamSide: side,
        teamName,
        playerName: player ? getPlayerDisplayName(player) : 'Unknown player',
        cardType: booking.Card ?? 0,
        priority: booking.Card === 2 ? EVENT_PRIORITY.redCard : EVENT_PRIORITY.yellowCard,
      });
    }
  };

  const pushSubstitutionEvents = (team: FifaTeamDetail, side: 'home' | 'away') => {
    const teamName = side === 'home' ? homeTeamName : awayTeamName;
    for (const sub of team.Substitutions ?? []) {
      const minute = formatEventMinute(sub.Minute);
      if (!isValidTimelineMinute(minute)) continue;

      const playerOff =
        getLocalizedText(sub.PlayerOffName) ||
        (sub.IdPlayerOff ? getPlayerDisplayName(playerMap.get(String(sub.IdPlayerOff))) : 'Unknown');
      const playerOn =
        getLocalizedText(sub.PlayerOnName) ||
        (sub.IdPlayerOn ? getPlayerDisplayName(playerMap.get(String(sub.IdPlayerOn))) : 'Unknown');
      events.push({
        id: createEventId('sub', sub as Record<string, unknown>),
        minute,
        sortKey: parseTimelineSortKey(minute),
        type: 'substitution',
        teamSide: side,
        teamName,
        playerOff,
        playerOn,
        priority: EVENT_PRIORITY.substitution,
      });
    }
  };

  pushGoalEvents(homeTeamDetail, 'home');
  pushGoalEvents(awayTeamDetail, 'away');
  pushBookingEvents(homeTeamDetail, 'home');
  pushBookingEvents(awayTeamDetail, 'away');
  pushSubstitutionEvents(homeTeamDetail, 'home');
  pushSubstitutionEvents(awayTeamDetail, 'away');
  events.push(...buildMatchStateEvents(fifaDetail));

  return events.sort(compareTimelineEvents);
}

export function splitPlayersByStatus(players: FifaPlayer[] = []) {
  const sorted = [...players].sort(
    (a, b) => (Number(a.ShirtNumber) || 0) - (Number(b.ShirtNumber) || 0)
  );
  const hasStatus = sorted.some((player) => player.Status === 1 || player.Status === 2);

  if (!hasStatus) {
    return { starters: sorted, substitutes: [] as FifaPlayer[] };
  }

  return {
    starters: sorted.filter((player) => player.Status === 1),
    substitutes: sorted.filter((player) => player.Status === 2),
  };
}

export function getTeamFormation(team?: FifaTeamDetail): string | null {
  const tactics = team?.Tactics?.trim();
  if (!tactics || tactics.toUpperCase() === 'N/A') return null;
  return tactics;
}
