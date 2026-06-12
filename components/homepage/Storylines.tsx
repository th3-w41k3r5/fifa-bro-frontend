'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StorylineSummary, MatchSummary } from '@/types';
import { Flag } from '@/components';
import { Sparkles, Calendar, Clock } from 'lucide-react';

function formatMatchDate(dateString?: string): string {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

function formatMatchTime(timeString?: string): string {
  if (!timeString) return 'TBA';
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeString;
  }
}

function formatStage(match?: MatchSummary): string {
  if (!match) return 'Featured';
  if (match.groupCode) return `Group ${match.groupCode}`;
  return match.stage.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

interface StorylinesProps {
  storylines: StorylineSummary[];
  matches?: MatchSummary[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.07,
      duration: 0.42,
      ease: 'easeOut',
    },
  }),
};

export const Storylines: React.FC<StorylinesProps> = ({ storylines, matches = [] }) => {
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

        if (aDate !== bDate) return aDate - bDate;
        return b.storyline.importance - a.storyline.importance;
      });
  }, [storylines, matches]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedStorylines.map(({ storyline, match }, index) => (
        <StorylineCard key={storyline.id} index={index} storyline={storyline} match={match} />
      ))}
    </div>
  );
};

interface StorylineCardProps {
  index: number;
  storyline: StorylineSummary;
  match?: MatchSummary;
}

const StorylineCard: React.FC<StorylineCardProps> = ({ index, storyline, match }) => {
  const hasScore = match?.homeScore !== undefined && match?.awayScore !== undefined;
  const homeWon = Boolean(hasScore && match!.homeScore! > match!.awayScore!);
  const awayWon = Boolean(hasScore && match!.awayScore! > match!.homeScore!);

  const getImportanceGradient = (importance: number) => {
    if (importance >= 80) return 'from-accent via-sky-300 to-white';
    if (importance >= 60) return 'from-accent via-cyan-300 to-accent/70';
    return 'from-accent/70 via-accent to-cyan-200';
  };

  const getImportanceLabel = (importance: number) => {
    if (importance >= 80) return 'Must-Watch';
    if (importance >= 60) return 'Highly Featured';
    return 'Featured';
  };

  return (
    <Link href={`/matches/${storyline.matchId}`} className="block h-full text-white hover:text-white">
      <motion.article
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px 0px -80px 0px' }}
        variants={cardVariants}
        whileHover={{ y: -6 }}
        className="group relative h-full cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#080b10] shadow-[0_22px_54px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_28px_70px_rgba(0,183,255,0.1)]"
        role="article"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,183,255,0.12),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.025),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

        <div className="relative z-10 flex h-full flex-col space-y-4 p-5">
          {match && (
            <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.035] px-4 py-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {match.homeFlagCode && <Flag flagCode={match.homeFlagCode} size="sm" />}
                  <span
                    className={`truncate border-b-2 pb-1 text-sm font-extrabold ${
                      homeWon ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
                    }`}
                  >
                    {match.homeTeam}
                  </span>
                </div>

                <span className="text-center text-xs font-black text-accent">
                  {hasScore ? `${match.homeScore}-${match.awayScore}` : 'VS'}
                </span>

                <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                  <span
                    className={`truncate border-b-2 pb-1 text-sm font-extrabold ${
                      awayWon ? 'border-emerald-400 text-text-primary' : 'border-transparent text-text-primary'
                    }`}
                  >
                    {match.awayTeam}
                  </span>
                  {match.awayFlagCode && <Flag flagCode={match.awayFlagCode} size="sm" />}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3 text-xs text-text-secondary">
                {match.matchDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-accent/80" />
                    <span className="font-semibold">{formatMatchDate(match.matchDate)}</span>
                  </div>
                )}
                {match.kickoffTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-accent/80" />
                    <span className="font-semibold">{formatMatchTime(match.kickoffTime)}</span>
                  </div>
                )}
                <span className="rounded-full border border-accent/20 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-accent">
                  {formatStage(match)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">Storyline</p>
              <h3 className="font-fifa-semi text-[18px] md:text-[20px] leading-[0.9] tracking-[-0.035em] text-text-primary transition-colors group-hover:text-accent">
                {storyline.title}
              </h3>
            </div>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-1 shrink-0 text-accent/80"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>

          <p className="line-clamp-3 flex-grow text-sm font-medium leading-6 text-text-secondary">
            {storyline.description}
          </p>

          <div className="border-t border-white/[0.07] pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-secondary">
                  Importance
                </span>
                <p className="mt-1 text-sm font-bold text-text-primary">{getImportanceLabel(storyline.importance)}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${storyline.importance}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + index * 0.04, duration: 0.55, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${getImportanceGradient(storyline.importance)} shadow-[0_0_14px_rgba(0,183,255,0.32)]`}
                  />
                </div>
                <span className="text-sm font-black text-text-primary">{storyline.importance}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

Storylines.displayName = 'Storylines';
