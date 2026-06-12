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

export interface MatchSummary {
  id: string | number;
  homeTeam: string;
  homeTeamCode?: string;
  homeFlagCode?: string;
  awayTeam: string;
  awayTeamCode?: string;
  awayFlagCode?: string;
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
