import {
  FifaLocalizedField,
  FifaMatchDetail,
  FifaPlayer,
  FifaTeamDetail,
  FifaCoach,
  FifaTimelineEvent,
  PenaltyShootoutEvent,
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
  | 'regular_time_end'
  | 'full_time'
  | 'match_end'
  | 'hydration_break'
  | 'match_resumed'
  | 'var_check'
  | 'coin_toss'
  | 'extra_time_start'
  | 'extra_time_half_time'
  | 'extra_time_second_half_start'
  | 'extra_time_end'
  | 'penalty_shootout_start'
  | 'penalty_shootout_end';

export type TimelineEvent =
  | PenaltyShootoutEvent
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'penalty_goal' | 'penalty_saved' | 'penalty_miss';
      playerName: string;
      playerPictureUrl?: string;
      homePenaltyScore?: number;
      awayPenaltyScore?: number;
      description?: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'goal';
      playerName: string;
      playerPictureUrl?: string;
      goalType: number;
      assistName?: string;
      homeGoals?: number;
      awayGoals?: number;
      description?: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'booking';
      playerName: string;
      playerPictureUrl?: string;
      cardType: number;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'substitution';
      playerOff: string;
      playerOn: string;
      playerOffPictureUrl?: string;
      playerOnPictureUrl?: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      type: 'match_state';
      stateKind: MatchStateKind;
      label: string;
      description?: string;
      priority: number;
    }
  | {
      id: string;
      minute: string;
      sortKey: number;
      timestamp?: string;
      teamSide: 'home' | 'away';
      teamName: string;
      type: 'simple';
      eventType: number;
      label: string;
      playerName?: string;
      description?: string;
      positionX?: number;
      positionY?: number;
      priority: number;
    }
  | PenaltyShootoutEvent;

const EVENT_PRIORITY = {
  varCheck: 1,
  penaltyAwarded: 2,
  attempt: 3,
  goalPrevention: 4,
  goal: 5,
  yellowCard: 6,
  redCard: 7,
  substitution: 8,
  foul: 9,
  corner: 10,
  matchState: 11,
  simple: 12,
} as const;

function goalEventPriority(): number {
  return EVENT_PRIORITY.goal;
}

function isValidTimelineMinute(minute: string): boolean {
  const cleaned = minute.replace(/'/g, '').trim();
  return cleaned.length > 0;
}

function parseTimelineApiMinute(minute?: string): string {
  if (!minute) return '';
  const cleaned = minute.replace(/\s/g, '').replace(/'/g, '').trim();
  if (!cleaned) return '';
  const normalized = cleaned.replace(/^(\d+)\+(\d+)$/, "$1+$2");
  return `${normalized}'`;
}

function compareTimelineEvents(a: TimelineEvent, b: TimelineEvent): number {
  if (b.sortKey !== a.sortKey) return b.sortKey - a.sortKey;
  return a.priority - b.priority;
}

export function sortTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  const sorted = [...events].sort(compareTimelineEvents);
  
  // Fill in missing running scores backwards (oldest to newest)
  let currentHome = 0;
  let currentAway = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const event = sorted[i];
    if (event.type === 'goal') {
      if (event.homeGoals != null && event.awayGoals != null) {
        currentHome = event.homeGoals;
        currentAway = event.awayGoals;
      } else {
        if (event.teamSide === 'home') currentHome++;
        else if (event.teamSide === 'away') currentAway++;
        
        event.homeGoals = currentHome;
        event.awayGoals = currentAway;
      }
    }
  }
  
  return sorted;
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
    const isVar = stateKind === 'var_check';
    events.push({
      id,
      minute,
      sortKey: parseTimelineSortKey(minute),
      type: 'match_state',
      stateKind,
      label,
      priority: isVar ? EVENT_PRIORITY.varCheck : EVENT_PRIORITY.matchState,
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

  if (period >= 4 || isSecondHalfAvailable) {
    pushState(
      'state-half-time',
      'half_time',
      'Half Time',
      resolveStateMinute(fifaDetail.FirstHalfTime, "45'")
    );
  }

  if (isSecondHalfAvailable) {
    pushState(
      'state-second-half-start',
      'second_half_start',
      'Second Half Start',
      resolveStateMinute(fifaDetail.SecondHalfTime, "46'")
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

function createEventId(prefix: string, source: Record<string, unknown>): string {
  return `${prefix}-${String(source.EventId ?? source.Minute ?? source.IdPlayer ?? source.IdTeam ?? '')}-${String(source.IdPlayer ?? source.IdPlayerOff ?? source.IdPlayerOn ?? source.IdSubPlayer ?? '')}`;
}

function getTimelineText(field?: FifaLocalizedField[]): string {
  return getLocalizedText(field).trim();
}

function resolveTimelineTeamSide(
  event: FifaTimelineEvent,
  homeTeamDetail: FifaTeamDetail,
  awayTeamDetail: FifaTeamDetail
): 'home' | 'away' | null {
  const idTeam = event.IdTeam != null ? String(event.IdTeam) : '';
  if (idTeam && homeTeamDetail.IdTeam != null && idTeam === String(homeTeamDetail.IdTeam)) return 'home';
  if (idTeam && awayTeamDetail.IdTeam != null && idTeam === String(awayTeamDetail.IdTeam)) return 'away';
  return null;
}

function stateKindFromTimelineEvent(event: FifaTimelineEvent): MatchStateKind | null {
  const label = getTimelineText(event.TypeLocalized).toLowerCase();
  const description = getTimelineText(event.EventDescription).toLowerCase();
  const combined = `${label} ${description}`;

  if (event.Type === 71 || /\bvar\b/.test(combined)) return 'var_check';
  if (event.Type === 79 || event.Type === 80 || combined.includes('coin toss')) return 'coin_toss';
  if (event.Type === 83 || combined.includes('hydration')) return 'hydration_break';
  if (event.Type === 78 || combined.includes('resume')) return 'match_resumed';
  if (event.Type === 26 || combined.includes('final whistle') || combined.includes('match end')) return 'match_end';
  if (event.Type === 7 && (event.Period === 5 || combined.includes('second'))) return 'second_half_start';
  if (event.Type === 7 && event.Period === 7) return 'extra_time_start';
  if (event.Type === 8 && event.Period === 7) return 'extra_time_half_time';
  if (event.Type === 7 && event.Period === 9) return 'extra_time_second_half_start';
  if (event.Type === 8 && event.Period === 9) return 'extra_time_end';
  if (event.Type === 7 && event.Period === 11) return 'penalty_shootout_start';
  if (event.Type === 8 && event.Period === 11) return 'penalty_shootout_end';
  if (event.Type === 7) return 'match_start';
  if (event.Type === 8 && (event.Period === 3 || combined.includes('first period'))) return 'half_time';
  if (event.Type === 8 && event.Period === 5) return 'regular_time_end';
  if (event.Type === 8) return 'full_time';
  return null;
}

function stateLabel(kind: MatchStateKind): string {
  const labels: Record<MatchStateKind, string> = {
    match_start: 'Match Start',
    half_time: 'Half Time',
    second_half_start: 'Second Half Start',
    regular_time_end: 'End of 2nd Half',
    full_time: 'Full Time',
    match_end: 'Match End',
    hydration_break: 'Hydration Break',
    match_resumed: 'Match Resumed',
    var_check: 'VAR Check',
    coin_toss: 'Coin Toss',
    extra_time_start: 'Extra Time Start',
    extra_time_half_time: 'Extra Time Half Time',
    extra_time_second_half_start: 'Extra Time Second Half Start',
    extra_time_end: 'Extra Time End',
    penalty_shootout_start: 'Penalty Shootout Start',
    penalty_shootout_end: 'Penalty Shootout End',
  };
  return labels[kind];
}

function isGoalTimelineEvent(event: FifaTimelineEvent): boolean {
  return event.Type === 0 || event.Type === 34 || event.Type === 33 || event.Type === 41;
}

function isPenaltyGoalTimelineEvent(event: FifaTimelineEvent): boolean {
  return event.Type === 33 || event.Type === 41;
}

function isOwnGoalTimelineEvent(event: FifaTimelineEvent): boolean {
  return event.Type === 34;
}

function simpleTimelineEventLabel(event: FifaTimelineEvent): string | null {
  const labels: Record<number, string> = {
    12: 'Attempt at Goal',
    18: 'Foul',
    57: 'Goal Prevention',
    16: 'Corner',
    15: 'Offside',
    83: 'Delay',
    78: 'Resume',
    6: 'Penalty Awarded',
    1: 'Assist',
  };
  return event.Type != null ? labels[event.Type] ?? null : null;
}

function simpleTimelineEventPriority(type?: number, label?: string): number {
  const lower = label?.toLowerCase() || '';
  if (lower.includes('penalty awarded') || type === 6) return EVENT_PRIORITY.penaltyAwarded;
  if (type === 12) return EVENT_PRIORITY.attempt;
  if (type === 57) return EVENT_PRIORITY.goalPrevention;
  if (type === 16) return EVENT_PRIORITY.corner;
  if (type === 18) return EVENT_PRIORITY.foul;
  if (type === 1) return EVENT_PRIORITY.goal; // Assist shown near its goal
  return EVENT_PRIORITY.simple;
}

export function buildTimelineEventsFromApi(
  fifaDetail: FifaMatchDetail,
  homeTeamDetail: FifaTeamDetail,
  awayTeamDetail: FifaTeamDetail,
  apiEvents: FifaTimelineEvent[]
): TimelineEvent[] {
  let events: TimelineEvent[] = [];
  const homeTeamName = getLocalizedText(fifaDetail.HomeTeam?.TeamName);
  const awayTeamName = getLocalizedText(fifaDetail.AwayTeam?.TeamName);
  const playerMap = buildPlayerMap([homeTeamDetail, awayTeamDetail]);

  for (const event of apiEvents) {
    const minute = parseTimelineApiMinute(event.MatchMinute);
    const sortKey = parseTimelineSortKey(minute);
    const stateKind = stateKindFromTimelineEvent(event);
    const description = getTimelineText(event.EventDescription);

    if (stateKind) {
      let finalMinute = minute;
      let finalSortKey = sortKey;
      
      // Ensure Second Half Start always sorts above First Half stoppage time
      if (stateKind === 'second_half_start' && finalSortKey < 4600) {
        finalMinute = finalMinute || "46'";
        finalSortKey = 4600;
      } else if (stateKind === 'regular_time_end' || (stateKind === 'full_time' && event.Period === 5)) {
        finalMinute = finalMinute || "FT";
        finalSortKey = 9100;
      } else if (stateKind === 'extra_time_start') {
        finalMinute = finalMinute || "90'";
        finalSortKey = 9200;
      } else if (stateKind === 'extra_time_half_time') {
        finalMinute = finalMinute || "105'";
        finalSortKey = 10600;
      } else if (stateKind === 'extra_time_second_half_start') {
        finalMinute = finalMinute || "106'";
        finalSortKey = 10601;
      } else if (stateKind === 'extra_time_end') {
        finalMinute = finalMinute || "120'";
        finalSortKey = 12500;
      } else if (stateKind === 'penalty_shootout_start') {
        finalMinute = finalMinute || "PSO";
        finalSortKey = 12600;
      } else if (stateKind === 'penalty_shootout_end') {
        finalMinute = finalMinute || "PSO";
        finalSortKey = 15001;
      } else if (stateKind === 'full_time' || stateKind === 'match_end') {
        finalMinute = "FT";
        finalSortKey = 20000;
      }

      events.push({
        id: createEventId('timeline-state', event as Record<string, unknown>),
        minute: finalMinute,
        sortKey: finalSortKey,
        timestamp: event.Timestamp,
        type: 'match_state',
        stateKind,
        label: stateLabel(stateKind),
        description,
        priority: stateKind === 'var_check' ? EVENT_PRIORITY.varCheck : EVENT_PRIORITY.matchState,
      });
      continue;
    }

    const side = resolveTimelineTeamSide(event, homeTeamDetail, awayTeamDetail);
    if (!side) continue;

    const teamName = side === 'home' ? homeTeamName : awayTeamName;
    const player = event.IdPlayer ? playerMap.get(String(event.IdPlayer)) : undefined;

    if (event.Period === 11 && event.Type !== 7 && event.Type !== 8) {
      const isGoal = event.Type === 41;
      const isSaved = event.Type === 60;
      const penaltySortKey = sortKey === 0 ? 15000 : sortKey;
      events.push({
        id: createEventId('timeline-shootout', event as Record<string, unknown>),
        minute: minute || "PSO",
        sortKey: penaltySortKey,
        timestamp: event.Timestamp,
        type: isGoal ? 'penalty_goal' : (isSaved ? 'penalty_saved' : 'penalty_miss'),
        teamSide: side,
        teamName,
        playerName: getPlayerDisplayName(player),
        playerPictureUrl: getPlayerPictureUrl(player),
        homePenaltyScore: event.HomePenaltyGoals ?? event.HomeTeamPenaltyScore,
        awayPenaltyScore: event.AwayPenaltyGoals ?? event.AwayTeamPenaltyScore,
        description,
        priority: EVENT_PRIORITY.goal,
      });
      continue;
    }

    if (isGoalTimelineEvent(event) && event.Period !== 11) {
      const goalType = isOwnGoalTimelineEvent(event) ? 34 : isPenaltyGoalTimelineEvent(event) ? 33 : 0;
      events.push({
        id: createEventId('timeline-goal', event as Record<string, unknown>),
        minute,
        sortKey,
        timestamp: event.Timestamp,
        type: 'goal',
        teamSide: side,
        teamName,
        playerName: getPlayerDisplayName(player),
        playerPictureUrl: getPlayerPictureUrl(player),
        goalType,
        homeGoals: event.HomeGoals,
        awayGoals: event.AwayGoals,
        description,
        priority: goalEventPriority(),
      });
      continue;
    }

    if (event.Type === 2 || event.Type === 3) {
      events.push({
        id: createEventId('timeline-booking', event as Record<string, unknown>),
        minute,
        sortKey,
        timestamp: event.Timestamp,
        type: 'booking',
        teamSide: side,
        teamName,
        playerName: getPlayerDisplayName(player),
        playerPictureUrl: getPlayerPictureUrl(player),
        cardType: event.Type === 3 ? 2 : 1,
        priority: event.Type === 3 ? EVENT_PRIORITY.redCard : EVENT_PRIORITY.yellowCard,
      });
      continue;
    }

    if (event.Type === 5) {
      const playerOn = event.IdPlayer ? playerMap.get(String(event.IdPlayer)) : undefined;
      const playerOff = event.IdSubPlayer ? playerMap.get(String(event.IdSubPlayer)) : undefined;
      events.push({
        id: createEventId('timeline-sub', event as Record<string, unknown>),
        minute,
        sortKey,
        timestamp: event.Timestamp,
        type: 'substitution',
        teamSide: side,
        teamName,
        playerOn: getPlayerDisplayName(playerOn),
        playerOff: getPlayerDisplayName(playerOff),
        playerOnPictureUrl: getPlayerPictureUrl(playerOn),
        playerOffPictureUrl: getPlayerPictureUrl(playerOff),
        priority: EVENT_PRIORITY.substitution,
      });
      continue;
    }

    const simpleLabel = simpleTimelineEventLabel(event);
    events.push({
      id: createEventId('timeline-simple', event as Record<string, unknown>),
      minute,
      sortKey,
      timestamp: event.Timestamp,
      type: 'simple',
      eventType: event.Type ?? -1,
      teamSide: side,
      teamName,
      label: simpleLabel ?? (getTimelineText(event.TypeLocalized) || 'Unknown Event'),
      playerName: player ? getPlayerDisplayName(player) : undefined,
      description,
      positionX: event.PositionX,
      positionY: event.PositionY,
      priority: simpleTimelineEventPriority(event.Type, simpleLabel || ''),
    });
  }

  // Deduplicate FULL TIME events: API can send multiple full time events (e.g. Type 8 and Type 26)
  // We want to keep the one that uses a relative stoppage time minute (e.g., "90'+9'")
  // rather than an absolute minute (e.g., "99'") if both exist.
  const fullTimeEvents = events.filter(e => e.type === 'match_state' && e.stateKind === 'full_time');
  if (fullTimeEvents.length > 1) {
    // Sort so that events with '+' in the minute come first. If neither or both have '+', fallback to sortKey descending
    const sortedFullTime = [...fullTimeEvents].sort((a, b) => {
      const aHasPlus = a.minute.includes('+') ? 1 : 0;
      const bHasPlus = b.minute.includes('+') ? 1 : 0;
      if (aHasPlus !== bHasPlus) return bHasPlus - aHasPlus;
      return b.sortKey - a.sortKey;
    });
    const toKeep = sortedFullTime[0];
    events = events.filter(e => !(e.type === 'match_state' && e.stateKind === 'full_time' && e.id !== toKeep.id));
  }

  return sortTimelineEvents(events);
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
        playerPictureUrl: getPlayerPictureUrl(scorer),
        goalType: goal.Type ?? 0,
        assistName: assist ? getPlayerDisplayName(assist) : undefined,
        priority: goalEventPriority(),
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
        playerPictureUrl: getPlayerPictureUrl(player),
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
      const playerOffRecord = sub.IdPlayerOff ? playerMap.get(String(sub.IdPlayerOff)) : undefined;
      const playerOnRecord = sub.IdPlayerOn ? playerMap.get(String(sub.IdPlayerOn)) : undefined;
      events.push({
        id: createEventId('sub', sub as Record<string, unknown>),
        minute,
        sortKey: parseTimelineSortKey(minute),
        type: 'substitution',
        teamSide: side,
        teamName,
        playerOff,
        playerOn,
        playerOffPictureUrl: getPlayerPictureUrl(playerOffRecord),
        playerOnPictureUrl: getPlayerPictureUrl(playerOnRecord),
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

  return sortTimelineEvents(events);
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
