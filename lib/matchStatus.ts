import type { MatchSummary } from '@/types';

function isHalftimePeriod(period?: string): boolean {
  const normalized = period?.toLowerCase().replace(/[-\s]/g, '_');

  return normalized === 'half_time' || normalized === 'halftime' || normalized === 'ht';
}

export function getMatchStatusLabel(match: MatchSummary): string {
  const status = match.status?.toLowerCase();

  if (isHalftimePeriod(match.livePeriod) || status === 'halftime' || status === 'half_time') {
    return 'Half Time';
  }

  if (status === 'live' || status === 'playing' || status === 'in_progress') {
    return match.liveMinute !== undefined ? `LIVE ${match.liveMinute}'` : 'LIVE';
  }

  return match.status ? match.status.replace(/[-_]/g, ' ').toUpperCase() : 'SCHEDULED';
}
