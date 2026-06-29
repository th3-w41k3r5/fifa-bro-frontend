/**
 * Common types used throughout the FIFA Bro frontend
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends APIResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Backend API Response Types
export interface ApiMeta {
  requestId?: string;
  count?: number;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface Badge {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
}

export interface GoalScorer {
  minute: string;
  playerName: string;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export interface MatchGoalScorers {
  home: GoalScorer[];
  away: GoalScorer[];
}

export interface FifaLocalizedField {
  Locale?: string;
  Description?: string;
}

export interface FifaPlayerPicture {
  PictureUrl?: string;
}

export interface FifaPlayer {
  IdPlayer: string;
  ShirtNumber?: number;
  Status?: number;
  Position?: number;
  Captain?: boolean;
  PlayerName?: FifaLocalizedField[];
  ShortName?: FifaLocalizedField[];
  PlayerPicture?: FifaPlayerPicture;
}

export interface FifaCoach {
  IdCoach?: string;
  IdCountry?: string;
  Name?: FifaLocalizedField[];
  Role?: number;
  PictureUrl?: string | null;
}

export interface FifaGoal {
  Type?: number;
  IdPlayer?: string;
  IdAssistPlayer?: string | null;
  Minute?: string;
  EventMinute?: string;
  EventMinuteRegulation?: string;
  EventMinuteExtra?: string;
  Period?: number;
  IdTeam?: string;
}

export interface FifaBooking {
  Card?: number;
  Minute?: string;
  IdPlayer?: string;
  IdTeam?: string;
}

export interface FifaSubstitution {
  PlayerOffName?: FifaLocalizedField[];
  PlayerOnName?: FifaLocalizedField[];
  IdPlayerOff?: string;
  IdPlayerOn?: string;
  Minute?: string;
  Period?: number;
  IdTeam?: string;
}

export interface FifaTeamDetail {
  IdTeam?: string;
  Score?: number;
  Tactics?: string;
  Coaches?: FifaCoach[];
  Players?: FifaPlayer[];
  Goals?: FifaGoal[];
  Bookings?: FifaBooking[];
  Substitutions?: FifaSubstitution[];
  TeamName?: FifaLocalizedField[];
}

export interface FifaTimelineEvent {
  EventId?: string;
  IdTeam?: string;
  IdPlayer?: string;
  IdSubPlayer?: string;
  IdSubTeam?: string;
  Timestamp?: string;
  MatchMinute?: string;
  Period?: number;
  HomeGoals?: number;
  AwayGoals?: number;
  Type?: number;
  TypeLocalized?: FifaLocalizedField[];
  EventDescription?: FifaLocalizedField[];
  PositionX?: number;
  PositionY?: number;
  GoalGatePositionX?: number;
  GoalGatePositionY?: number;
  VarNotificationData?: unknown;
}

export interface FifaMatchDetail {
  IdMatch?: string;
  MatchNumber?: number;
  Attendance?: string;
  StageName?: FifaLocalizedField[];
  GroupName?: FifaLocalizedField[];
  Officials?: Array<{ OfficialType?: number; Name?: FifaLocalizedField[]; NameShort?: FifaLocalizedField[] }>;
  Stadium?: {
    Name?: FifaLocalizedField[];
    CityName?: FifaLocalizedField[];
    IdCountry?: string;
  };
  Weather?: {
    Humidity?: string;
    Temperature?: string;
    WindSpeed?: string;
    Type?: string;
    TypeLocalized?: FifaLocalizedField[];
  };
  Date?: string;
  LocalDate?: string;
  MatchTime?: string;
  Period?: number;
  MatchStatus?: number;
  ResultType?: number;
  FirstHalfTime?: string | null;
  SecondHalfTime?: string | null;
  FirstHalfExtraTime?: string | null;
  SecondHalfExtraTime?: string | null;
  HomeTeamPenaltyScore?: number | null;
  AwayTeamPenaltyScore?: number | null;
  HomeTeam?: FifaTeamDetail;
  AwayTeam?: FifaTeamDetail;
}

export interface MatchSummary {
  id: string | number;
  homeTeam: string;
  homeTeamCode?: string;
  homeFlagCode?: string;
  homeSlot?: string;
  homeIsPredicted?: boolean;
  homeQualificationStatus?: string;
  homePlayed?: number;
  awayTeam: string;
  awayTeamCode?: string;
  awayFlagCode?: string;
  awaySlot?: string;
  awayIsPredicted?: boolean;
  awayQualificationStatus?: string;
  awayPlayed?: number;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  matchDate: string;
  kickoffTime: string;
  stage: string;
  groupCode?: string;
  stadium: string;
  city: string;
  badges?: Badge[];
  storylines?: StorylineSummary[];
  liveMinute?: number;
  livePeriod?: string;
  goalScorers?: MatchGoalScorers;
  fifaDetail?: FifaMatchDetail;
}

export interface TeamSummary {
  id?: string | number;
  code: string;
  name: string;
  slug: string;
  groupCode?: string;
  flagUrl?: string;
  logoUrl?: string;
  flagCode?: string;
  fifaCode?: string;
}

export interface FeaturedMatch {
  matchId: string | number;
  displayOrder: number;
  heroText?: string;
  match: MatchSummary;
}

export interface StorylineSummary {
  id: string | number;
  matchId: string | number;
  title: string;
  description: string;
  importance: number;
}

export interface GroupSummary {
  code: string;
  name: string;
}

export interface StandingRow {
  id?: string | number;
  groupCode: string;
  teamCode: string;
  teamName?: string;
  position?: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  qualified?: boolean;
}

export interface StandingGroup {
  groupCode: string;
  standings: StandingRow[];
}

export interface HomePayload {
  heroMatch: FeaturedMatch | null;
  featuredMatches: FeaturedMatch[];
  upcomingMatches: MatchSummary[];
  groups: GroupSummary[];
  standings: StandingGroup[];
  storylines: StorylineSummary[];
}

export interface ThirdPlaceTeamRanking {
  rank: number;
  groupCode: string;
  teamName: string;
  teamCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  conductScore: number;
  qualificationStatus?: string;
}

export interface ThirdPlaceRankingsPayload {
  qualified: ThirdPlaceTeamRanking[];
  eliminated: ThirdPlaceTeamRanking[];
  updatedAt: string;
}

// Frontend-specific types
export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffTime: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  homeTeamScore?: number;
  awayTeamScore?: number;
  venue?: string;
  group?: string;
  stage: 'group' | 'knockout' | 'final';
}

export interface Team {
  id: string;
  name: string;
  flagCode: string;
  logoUrl?: string;
  group?: string;
  FIFA_Code: string;
  confederation?: string;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface Fixture {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  status: 'scheduled' | 'live' | 'finished';
  badges?: BadgeType[];
}

export type BadgeType = 'opening-match' | 'must-watch' | 'featured' | 'group-of-death' | 'revenge-match';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  appName: string;
  season: string;
  enableLiveUpdates: boolean;
  enablePredictions: boolean;
}
