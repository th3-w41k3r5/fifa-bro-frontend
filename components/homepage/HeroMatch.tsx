'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TeamLogo } from '@/components';
import type { MatchSummary, StorylineSummary } from '@/types';
import styles from './HeroMatch.module.css';

interface Props {
  match: MatchSummary;
  storyline: StorylineSummary;
  allMatches: MatchSummary[];
}

const HERO_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET_MINUTES = 330;
const LIVE_WINDOW_MINUTES = 90;

function getKickoffTime(match: MatchSummary) {
  const date = match.matchDate.slice(0, 10);
  const time = match.kickoffTime.includes('T') ? match.kickoffTime.split('T')[1] : match.kickoffTime;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.replace(/Z$/, '').split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60 * 1000);
}

function formatDate(match: MatchSummary) {
  return getKickoffTime(match).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: HERO_TIME_ZONE,
  });
}

function formatTime(match: MatchSummary) {
  return getKickoffTime(match).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: HERO_TIME_ZONE,
  });
}

function formatStageName(stage: string) {
  return stage.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStageDisplay(match: MatchSummary, allMatches: MatchSummary[]) {
  const sameStageMatches = allMatches
    .filter((candidate) =>
      match.groupCode
        ? candidate.groupCode === match.groupCode
        : !candidate.groupCode && candidate.stage === match.stage
    )
    .sort((a, b) => {
      const kickoffDifference = getKickoffTime(a).getTime() - getKickoffTime(b).getTime();
      if (kickoffDifference !== 0) return kickoffDifference;
      return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });

  const matchNumber = Math.max(
    1,
    sameStageMatches.findIndex((candidate) => String(candidate.id) === String(match.id)) + 1
  );
  const stageName = match.groupCode ? `Group ${match.groupCode}` : formatStageName(match.stage);

  return `${stageName} \u2022 Match ${matchNumber}`;
}

function getCountdown(match: MatchSummary) {
  const difference = getKickoffTime(match).getTime() - Date.now();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

function isLiveNow(match: MatchSummary) {
  const kickoff = getKickoffTime(match).getTime();
  const now = Date.now();
  return now >= kickoff && now < kickoff + LIVE_WINDOW_MINUTES * 60 * 1000;
}

export const HeroMatch: React.FC<Props> = ({ match, storyline, allMatches }) => {
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown>>(null);
  const [liveNow, setLiveNow] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(match));
      setLiveNow(isLiveNow(match));
    };
    updateCountdown();

    const interval = setInterval(updateCountdown, 60_000);
    return () => clearInterval(interval);
  }, [match]);

  const stageDisplay = useMemo(() => getStageDisplay(match, allMatches), [allMatches, match]);
  const venue = [match.stadium, match.city].filter(Boolean).join(', ');
  const matchHref = `/matches/${encodeURIComponent(String(match.id))}`;
  const pills = [stageDisplay, ...(match.badges?.map((badge) => badge.name) ?? [])].filter(
    (pill, index, values) => values.indexOf(pill) === index
  );
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;
  const homeWon = hasScore && match.homeScore! > match.awayScore!;
  const awayWon = hasScore && match.awayScore! > match.homeScore!;
  const statusLabel = match.status ? match.status.replace(/[-_]/g, ' ').toUpperCase() : 'SCHEDULED';

  return (
    <section className={`${styles.root} animate-fade-in`}>
      <div className={styles.left}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>{storyline.title}</h1>

          <p className={styles.description}>{storyline.description}</p>

          {pills.length > 0 && (
            <div className={styles.tags} aria-label="Match categories">
              {pills.map((pill) => (
                <span className={styles.pill} key={pill}>
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.buttons}>
          <Link href={matchHref} className={styles.primaryButton}>
            View Match Details
          </Link>
          <Link href="/matches" className={styles.secondaryButton}>
            Explore More Fixtures
          </Link>
        </div>
      </div>

      <div className={styles.center}>
        <div className={styles.watermark} aria-hidden="true">
          <Image src="/fifa-world-cup-26-emblem.png" alt="" width={250} height={383} />
        </div>

        <div className={styles.matchup} aria-label={`${match.homeTeam} versus ${match.awayTeam}`}>
          <div className={styles.team}>
            <div className={styles.flag}>
              {match.homeFlagCode && <TeamLogo flagCode={match.homeFlagCode} teamName={match.homeTeam} size="lg" />}
            </div>
            <div className={`${styles.teamName} ${homeWon ? styles.winnerTeamName : ''}`}>{match.homeTeam}</div>
          </div>

          <div className={styles.versus} aria-hidden="true">
            {hasScore ? `${match.homeScore}-${match.awayScore}` : 'VS'}
          </div>

          <div className={styles.team}>
            <div className={styles.flag}>
              {match.awayFlagCode && <TeamLogo flagCode={match.awayFlagCode} teamName={match.awayTeam} size="lg" />}
            </div>
            <div className={`${styles.teamName} ${awayWon ? styles.winnerTeamName : ''}`}>{match.awayTeam}</div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Match Details</h2>
          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>Date</dt>
              <dd>{formatDate(match)}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Kickoff</dt>
              <dd>{formatTime(match)}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Venue</dt>
              <dd>{venue}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Stage</dt>
              <dd>{stageDisplay}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Status</dt>
              <dd>{statusLabel}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Countdown</h2>
          {liveNow ? (
            <div className={styles.liveNow}>LIVE NOW!</div>
          ) : (
            <div className={styles.countdown} aria-label="Time until kickoff">
              {[
                ['Days', countdown?.days],
                ['Hours', countdown?.hours],
                ['Minutes', countdown?.minutes],
              ].map(([label, value]) => (
                <div className={styles.countdownItem} key={String(label)}>
                  <div className={styles.countdownNumber}>{String(value ?? 0).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

HeroMatch.displayName = 'HeroMatch';

export default HeroMatch;
