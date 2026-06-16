'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FifaMatchDetail } from '@/types';
import { buildPlayerMap, buildTimelineEvents } from '@/lib/fifaMatchUtils';
import MatchCentreTabs, { MatchCentreTab } from './MatchCentreTabs';
import MatchTimeline from './MatchTimeline';
import MatchLineups from './MatchLineups';
import MatchCentreDetails from './MatchCentreDetails';

interface MatchCentreSectionProps {
  fifaDetail: FifaMatchDetail;
  homeTeamName: string;
  awayTeamName: string;
  homeFlagCode?: string;
  awayFlagCode?: string;
}

export default function MatchCentreSection({
  fifaDetail,
  homeTeamName,
  awayTeamName,
  homeFlagCode,
  awayFlagCode,
}: MatchCentreSectionProps) {
  const [activeSection, setActiveSection] = useState<MatchCentreTab>('timeline');

  const homeTeamDetail = fifaDetail.HomeTeam;
  const awayTeamDetail = fifaDetail.AwayTeam;

  const playerMap = useMemo(
    () => buildPlayerMap([homeTeamDetail ?? {}, awayTeamDetail ?? {}]),
    [homeTeamDetail, awayTeamDetail]
  );

  const timelineEvents = useMemo(() => {
    if (!homeTeamDetail || !awayTeamDetail) return [];
    return buildTimelineEvents(fifaDetail, homeTeamDetail, awayTeamDetail, playerMap);
  }, [fifaDetail, homeTeamDetail, awayTeamDetail, playerMap]);

  const sectionContent = () => {
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
