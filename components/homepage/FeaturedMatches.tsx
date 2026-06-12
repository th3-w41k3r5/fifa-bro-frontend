'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TeamLogo } from '@/components';
import { Calendar } from 'lucide-react';
import type { MatchSummary, StorylineSummary } from '@/types';

interface FeaturedMatchesProps {
  storylines: StorylineSummary[];
  matches?: MatchSummary[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.45,
      ease: 'easeOut',
    },
  }),
};

const FeaturedMatchesComponent: React.FC<FeaturedMatchesProps> = ({ storylines, matches = [] }) => {
  const sortedStorylines = useMemo(() => {
    const withMatches = storylines.map((storyline) => ({
      storyline,
      match: matches.find((m) => String(m.id) === String(storyline.matchId)),
    }));

    return withMatches
      .filter(({ match }) => match)
      .sort((a, b) => {
        const aDate = new Date(`${a.match!.matchDate}T${a.match!.kickoffTime}Z`).getTime();
        const bDate = new Date(`${b.match!.matchDate}T${b.match!.kickoffTime}Z`).getTime();

        if (aDate !== bDate) {
          return aDate - bDate;
        }
        return b.storyline.importance - a.storyline.importance;
      });
  }, [storylines, matches]);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sortedStorylines.map(({ storyline, match }, index) => (
        <MatchCard key={storyline.id} index={index} storyline={storyline} match={match!} />
      ))}
    </div>
  );
};

interface MatchCardProps {
  index: number;
  storyline: StorylineSummary;
  match: MatchSummary;
}

const MatchCard: React.FC<MatchCardProps> = memo(function MatchCard({ storyline, match, index }) {
  const kickoffTime = new Date(`${match.matchDate}T${match.kickoffTime}`);
  const matchDate = new Date(match.matchDate);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      variants={cardVariants}
      whileHover={{ translateY: -6 }}
      className="group story-card rounded-[24px] p-6 cursor-pointer overflow-hidden flex flex-col h-[340px] transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,.02)',
        border: '1px solid rgba(255,255,255,.06)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 40px rgba(0,0,0,.3)',
      }}
    >
      <Link href={`/matches/${match.id}`} className="block h-full flex flex-col">
        {/* Badge Row */}
        <div className="flex items-center justify-between gap-2 mb-3 text-[9px] uppercase tracking-[0.18em]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-text-secondary group-badge">{match.stage}</span>
          </div>
          {match.groupCode && (
            <span className="text-text-secondary/60 group-badge px-2 py-0.5 rounded" style={{
              background: 'rgba(0,183,255,.05)',
              border: '1px solid rgba(0,183,255,.1)',
            }}>
              {match.groupCode}
            </span>
          )}
        </div>

        {/* Importance Bar */}
        <div className="h-0.5 rounded-full bg-white/8 overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, storyline.importance)}%` }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-accent"
          />
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-fifa-semi text-text-primary leading-tight mb-3 group-hover:text-accent transition-colors line-clamp-2 tracking-[-0.01em]">
          {storyline.title}
        </h3>

        {/* Description */}
        <p className="text-xs md:text-sm leading-relaxed text-text-secondary line-clamp-3 mb-4 flex-grow">
          {storyline.description}
        </p>

        {/* Matchup - Divider */}
        <div className="border-t border-white/8 my-3" />

        {/* Matchup */}
        <div className="flex items-center justify-between gap-2 py-2 mb-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-5 h-5">
              <TeamLogo
                flagCode={match.homeFlagCode || match.homeTeam.toLowerCase().slice(0, 2)}
                teamName={match.homeTeam}
                size="sm"
              />
            </div>
            <span className="text-xs font-fifa-semi text-text-primary truncate uppercase tracking-[-0.005em]">
              {match.homeTeam}
            </span>
          </div>

          <span className="text-[8px] text-text-secondary/40 uppercase tracking-[0.1em] flex-shrink-0 font-bold">vs</span>

          <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
            <span className="text-xs font-fifa-semi text-text-primary truncate text-right uppercase tracking-[-0.005em]">
              {match.awayTeam}
            </span>
            <div className="w-5 h-5">
              <TeamLogo
                flagCode={match.awayFlagCode || match.awayTeam.toLowerCase().slice(0, 2)}
                teamName={match.awayTeam}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="border-t border-white/8 pt-2 flex items-center justify-between gap-2 text-[9px] text-text-secondary">
          <div className="flex items-center gap-1">
            <Calendar size={11} className="text-accent/50 flex-shrink-0" />
            <span>{matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <span className="font-fifa-semi text-text-primary/80">
            {kickoffTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </Link>
    </motion.div>
  );
});

MatchCard.displayName = 'MatchCard';

export const FeaturedMatches = memo(FeaturedMatchesComponent);
FeaturedMatches.displayName = 'FeaturedMatches';
