'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FifaMatchDetail, FifaTimelineEvent } from '@/types';
import {
  buildPlayerMap,
  buildTimelineEvents,
  buildTimelineEventsFromApi,
  sortTimelineEvents,
} from '@/lib/fifaMatchUtils';
import MatchCentreTabs, { MatchCentreTab } from './MatchCentreTabs';
import MatchLiveFeed from './MatchLiveFeed';
import MatchTimeline from './MatchTimeline';
import MatchLineups from './MatchLineups';
import MatchCentreDetails from './MatchCentreDetails';
import type { TimelineEvent } from '@/lib/fifaMatchUtils';

interface MatchCentreSectionProps {
  fifaDetail: FifaMatchDetail;
  homeTeamName: string;
  awayTeamName: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
}

function getFeedEventMergeKey(event: TimelineEvent): string {
  const actor =
    event.type === 'goal' || event.type === 'booking'
      ? event.playerName
      : event.type === 'substitution'
        ? `${event.playerOn}-${event.playerOff}`
        : event.label;

  return [
    event.type,
    event.minute,
    'teamSide' in event ? event.teamSide : '',
    actor,
  ].join('|');
}

export default function MatchCentreSection({
  fifaDetail,
  homeTeamName,
  awayTeamName,
  homeFlagCode,
  awayFlagCode,
}: MatchCentreSectionProps) {
  const [activeSection, setActiveSection] = useState<MatchCentreTab>('live-feed');
  const [timelineApiEvents, setTimelineApiEvents] = useState<FifaTimelineEvent[]>([]);

  const homeTeamDetail = fifaDetail.HomeTeam;
  const awayTeamDetail = fifaDetail.AwayTeam;
  const fifaMatchId = fifaDetail.IdMatch;

  const playerMap = useMemo(
    () => buildPlayerMap([homeTeamDetail ?? {}, awayTeamDetail ?? {}]),
    [homeTeamDetail, awayTeamDetail]
  );

  const timelineEvents = useMemo(() => {
    if (!homeTeamDetail || !awayTeamDetail) return [];
    return buildTimelineEvents(fifaDetail, homeTeamDetail, awayTeamDetail, playerMap);
  }, [fifaDetail, homeTeamDetail, awayTeamDetail, playerMap]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const fetchTimeline = async () => {
      if (!fifaMatchId) {
        setTimelineApiEvents([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.fifa.com/api/v3/timelines/${fifaMatchId}?language=en`
        );
        if (!response.ok) throw new Error(`FIFA timeline request failed: ${response.status}`);
        const data = (await response.json()) as { Event?: FifaTimelineEvent[] };
        if (!cancelled) {
          setTimelineApiEvents(Array.isArray(data.Event) ? data.Event : []);
        }
      } catch (error) {
        console.error('Failed to fetch FIFA timeline feed', error);
      }
    };

    fetchTimeline();

    // Poll every 30s to keep the feed current during live matches
    pollTimer = setInterval(fetchTimeline, 30_000);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [fifaMatchId]);

  const liveFeedEvents = useMemo(() => {
    if (!homeTeamDetail || !awayTeamDetail) return [];
    if (timelineApiEvents.length > 0) {
      const apiFeed = buildTimelineEventsFromApi(
        fifaDetail,
        homeTeamDetail,
        awayTeamDetail,
        timelineApiEvents
      );
      const seen = new Set(apiFeed.map(getFeedEventMergeKey));
      const websocketOnlyEvents = timelineEvents.filter((event) => {
        return !seen.has(getFeedEventMergeKey(event));
      });
      return sortTimelineEvents([...apiFeed, ...websocketOnlyEvents]);
    }
    return timelineEvents;
  }, [fifaDetail, homeTeamDetail, awayTeamDetail, timelineApiEvents, timelineEvents]);

  const sectionContent = () => {
    if (activeSection === 'live-feed') {
      return (
        <MatchLiveFeed
          events={liveFeedEvents}
          homeFlagCode={homeFlagCode}
          awayFlagCode={awayFlagCode}
        />
      );
    }

    if (activeSection === 'timeline') {
      return (
        <MatchTimeline
          events={timelineEvents}
          homeFlagCode={homeFlagCode}
          awayFlagCode={awayFlagCode}
        />
      );
    }

    if (activeSection === 'lineups') {
      if (!homeTeamDetail || !awayTeamDetail) {
        return (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] px-6 py-10 text-center text-sm text-text-secondary">
            No lineup data available.
          </div>
        );
      }
      return (
        <MatchLineups
          homeTeam={homeTeamDetail}
          awayTeam={awayTeamDetail}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          homeFlagCode={homeFlagCode}
          awayFlagCode={awayFlagCode}
        />
      );
    }

    return <MatchCentreDetails fifaDetail={fifaDetail} />;
  };

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_20px_54px_rgba(0,0,0,0.24)] md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.10),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_45%)]" />

      <div className="relative z-10 min-w-0 space-y-8 overflow-x-hidden">
        <MatchCentreTabs activeSection={activeSection} onChange={setActiveSection} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {sectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
