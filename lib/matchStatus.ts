import type { MatchSummary } from '@/types';

function isHalftimePeriod(period?: string): boolean {
  const normalized = period?.toLowerCase().replace(/[-\s]/g, '_');

  return normalized === 'half_time' || normalized === 'halftime' || normalized === 'ht';
}

export function getMatchStatusLabel(match: MatchSummary): string {
  const status = match.status?.toLowerCase();
  
  if (status === 'complete') {
    if (match.homePenaltyScore != null && match.awayPenaltyScore != null) {
      return 'FT (PENS)';
    }
    const fifaPeriod = match.fifaDetail?.Period;
    if (fifaPeriod === 10 || fifaPeriod === 11) {
      // 10 is match end, check if it went to ET by seeing if livePeriod went high enough or there are penalty scores
      // but since penalty scores are checked above, if it's period 10 and we had ET, it's AET.
      if (match.fifaDetail?.MatchTime && Number(match.fifaDetail.MatchTime.replace("'", "")) > 100) {
          return 'AET';
      }
      return 'FT';
    }
    return 'FT';
  }

  if (isHalftimePeriod(match.livePeriod) || status === 'halftime' || status === 'half_time' || match.fifaDetail?.Period === 4) {
    return 'HT';
  }

  if (status === 'live' || status === 'playing' || status === 'in_progress') {
    const period = match.fifaDetail?.Period;
    let prefix = 'LIVE';
    if (period === 7 || period === 9) prefix = 'ET'; // First/Second half of Extra Time
    if (period === 11) return 'PENS';
    return match.liveMinute !== undefined ? `${prefix} ${match.liveMinute}'` : prefix;
  }

  return match.status ? match.status.replace(/[-_]/g, ' ').toUpperCase() : 'SCHEDULED';
}
