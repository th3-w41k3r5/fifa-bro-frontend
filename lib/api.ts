import type { MatchSummary, FeaturedMatch, StorylineSummary, GroupSummary, HomePayload, StandingGroup } from '@/types';

/**
 * Type-safe API client for FIFA Bro backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

interface FetchOptions {
  timeout?: number;
  revalidate?: number;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 10000, revalidate = 60 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      signal: controller.signal,
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Unknown API error');
    }

    return data.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get home page aggregated data
 */
export async function getHomeData(): Promise<HomePayload> {
  return fetchAPI<HomePayload>('/home', { revalidate: 60 }); // 10 minutes
}

/**
 * Get all matches with pagination support
 */
export async function getMatches(limit?: number, offset?: number): Promise<MatchSummary[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', String(limit));
  if (offset) params.append('offset', String(offset));

  const query = params.toString();
  return fetchAPI<MatchSummary[]>(`/matches${query ? `?${query}` : ''}`);
}

/**
 * Get all groups
 */
export async function getGroups(): Promise<GroupSummary[]> {
  return fetchAPI<GroupSummary[]>('/groups');
}

/**
 * Get standings data
 */
export async function getStandings(): Promise<StandingGroup[]> {
  return fetchAPI<StandingGroup[]>('/standings');
}

/**
 * Get featured matches
 */
export async function getFeaturedMatches(): Promise<FeaturedMatch[]> {
  return fetchAPI<FeaturedMatch[]>('/featured');
}

/**
 * Get storylines
 */
export async function getStorylines(): Promise<StorylineSummary[]> {
  return fetchAPI<StorylineSummary[]>('/storylines');
}

/**
 * Get single group detail
 */
export async function getGroupDetail(groupCode: string) {
  return fetchAPI(`/groups/${groupCode}`);
}

/**
 * Get single match detail
 */
export async function getMatchDetail(matchId: string | number) {
  return fetchAPI(`/matches/${matchId}`);
}
