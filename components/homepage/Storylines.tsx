'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { StorylineSummary, MatchSummary } from '@/types';
import { Flag, SectionTitle } from '@/components';
import { Sparkles, Calendar, Clock, ChevronDown, Zap } from 'lucide-react';
import {
  STORY_STAGES,
  getCurrentStorylineStage,
  slugToStage,
  type StoryStage,
} from '@/lib/storyStages';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

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
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return timeString;
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface StorylinesProps {
  storylines: StorylineSummary[];
  matches?: MatchSummary[];
}

type SortOption = 'importance' | 'latest' | 'oldest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'importance', label: 'Sort by Importance' },
  { value: 'latest', label: 'Latest Matches First' },
  { value: 'oldest', label: 'Oldest Matches First' },
];

/* ------------------------------------------------------------------ */
/*  Custom Dropdown Component                                           */
/* ------------------------------------------------------------------ */

function CustomDropdown<T>({
  value,
  options,
  onChange,
  renderLabel,
  renderOption,
  className = '',
}: {
  value: T;
  options: T[];
  onChange: (val: T) => void;
  renderLabel: (val: T) => React.ReactNode;
  renderOption: (val: T, isActive: boolean) => React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0a0f1a] px-4 py-3 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-white/[0.16] focus:border-accent focus:outline-none"
      >
        <span className="truncate whitespace-nowrap">{renderLabel(value)}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : 'text-text-secondary'}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0f1a]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="max-h-[280px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
              {options.map((opt, i) => {
                const isActive = opt === value;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`
                      relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-all
                      ${
                        isActive
                          ? 'bg-accent/[0.12] text-accent'
                          : 'text-text-secondary hover:bg-white/[0.06] hover:text-text-primary'
                      }
                    `}
                  >
                    {renderOption(opt, isActive)}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                         */
/* ------------------------------------------------------------------ */

const StageEmptyState: React.FC<{ stage: StoryStage }> = ({ stage }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center rounded-[22px] border border-white/[0.06] bg-[#080b10] py-16 px-6 text-center"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
      <Sparkles size={20} className="text-accent/60" />
    </div>
    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent/60">
      {stage.label}
    </p>
    <h3 className="mb-2 text-lg font-black text-text-primary">No storylines yet</h3>
    <p className="max-w-xs text-sm font-medium leading-6 text-text-secondary">
      Storylines will unlock once {stage.label.toLowerCase()} fixtures are confirmed.
    </p>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Regular Storyline Card                                              */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.38, ease: 'easeOut' },
  }),
};

const StorylineCard: React.FC<{
  index: number;
  storyline: StorylineSummary;
  match?: MatchSummary;
  stage: StoryStage;
}> = ({ index, storyline, match, stage }) => {
  const homeScoreNum = Number(match?.homeScore);
  const awayScoreNum = Number(match?.awayScore);
  const hasScore =
    match?.homeScore !== undefined &&
    match?.awayScore !== undefined &&
    !isNaN(homeScoreNum) &&
    !isNaN(awayScoreNum);
  const homePenNum = Number(match?.homePenaltyScore);
  const awayPenNum = Number(match?.awayPenaltyScore);
  const hasPens =
    match?.homePenaltyScore != null && match?.awayPenaltyScore != null && !isNaN(homePenNum) && !isNaN(awayPenNum);
  const homeWon =
    hasScore &&
    (homeScoreNum > awayScoreNum ||
      (homeScoreNum === awayScoreNum && hasPens && homePenNum > awayPenNum));
  const awayWon =
    hasScore &&
    (awayScoreNum > homeScoreNum ||
      (homeScoreNum === awayScoreNum && hasPens && awayPenNum > homePenNum));

  const getImportanceGradient = (imp: number) => {
    if (imp >= 80) return 'from-accent via-sky-300 to-white';
    if (imp >= 60) return 'from-accent via-cyan-300 to-accent/70';
    return 'from-accent/70 via-accent to-cyan-200';
  };

  const getImportanceLabel = (imp: number) => {
    if (imp >= 80) return 'Must-Watch';
    if (imp >= 60) return 'Highly Featured';
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
                    className={`truncate text-sm font-extrabold ${
                      homeWon ? 'text-text-primary underline decoration-emerald-400 decoration-2 underline-offset-4' : 'text-text-primary'
                    }`}
                  >
                    {match.homeTeam || match.homeSlot || 'TBD'}
                  </span>
                </div>
                <span className="text-center text-xs font-black text-accent">
                  {hasScore ? `${match.homeScore}-${match.awayScore}` : 'VS'}
                </span>
                <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                  <span
                    className={`truncate text-sm font-extrabold ${
                      awayWon ? 'text-text-primary underline decoration-emerald-400 decoration-2 underline-offset-4' : 'text-text-primary'
                    }`}
                  >
                    {match.awayTeam || match.awaySlot || 'TBD'}
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
                  <span className="hidden sm:inline">{stage.label}</span>
                  <span className="sm:hidden">{stage.label.replace('Round of ', 'R - ')}</span>
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

/* ------------------------------------------------------------------ */
/*  Main Storylines Component                                           */
/* ------------------------------------------------------------------ */

export const Storylines: React.FC<StorylinesProps> = ({ storylines, matches = [] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial stage from URL or smart default
  const getInitialStage = useCallback((): StoryStage => {
    const slugParam = searchParams.get('stage');
    if (slugParam) {
      const fromUrl = slugToStage(slugParam);
      if (fromUrl) return fromUrl;
    }
    return getCurrentStorylineStage(matches);
  }, [searchParams, matches]);

  const [selectedStage, setSelectedStage] = useState<StoryStage>(() => {
    // Safe default for SSR
    return STORY_STAGES[0];
  });

  const [selectedSort, setSelectedSort] = useState<SortOption>('oldest');


  // Sync from matches data + URL once we have matches
  useEffect(() => {
    if (matches.length > 0) {
      setSelectedStage(getInitialStage());
    }
  }, [matches.length, getInitialStage]);

  const handleStageChange = useCallback(
    (stage: StoryStage) => {
      setSelectedStage(stage);
      // Update URL without full navigation
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('stage', stage.slug);
      router.replace(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Join storylines to matches, filter by selected stage
  const { filteredItems } = useMemo(() => {
    const stageDbValue = selectedStage.dbValue;

    const withMatches = storylines
      .map((s) => ({
        storyline: s,
        match: matches.find((m) => String(m.id) === String(s.matchId)),
      }))
      .filter(({ match }) => match && match.stage === stageDbValue)
      .sort((a, b) => {
        const parseDate = (m: MatchSummary | undefined) => {
          if (!m) return 0;
          const dateStr = m.matchDate ? m.matchDate.split('T')[0] : '1970-01-01';
          let timeStr = m.kickoffTime || '00:00:00';
          if (timeStr.includes('T')) timeStr = timeStr.split('T')[1];
          timeStr = timeStr.replace('Z', '');
          if (timeStr.split(':').length === 2) timeStr += ':00';
          return new Date(`${dateStr}T${timeStr}Z`).getTime();
        };

        const aDate = parseDate(a.match);
        const bDate = parseDate(b.match);

        if (selectedSort === 'latest') return bDate - aDate;
        if (selectedSort === 'oldest') return aDate - bDate;

        // Default: importance desc
        const impDiff = b.storyline.importance - a.storyline.importance;
        if (impDiff !== 0) return impDiff;
        // Secondary: match date asc
        return aDate - bDate;
      });

    return { filteredItems: withMatches };
  }, [storylines, matches, selectedStage, selectedSort]);

  return (
    <div>
      <SectionTitle
        title="Amazing Matches of FIFA WC 2026"
        subtitle="The biggest stories from every stage of FIFA World Cup 2026"
        icon={<Zap size={24} />}
        action={
          <div className="relative z-20 mt-6 flex flex-col sm:flex-row sm:items-center gap-3 md:mt-0">
            <CustomDropdown
              className="w-full sm:w-[220px]"
              value={selectedStage}
              options={STORY_STAGES}
              onChange={handleStageChange}
              renderLabel={(stage) => stage.label}
              renderOption={(stage) => <span>{stage.label}</span>}
            />
            <CustomDropdown
              className="w-full sm:w-[220px]"
              value={selectedSort}
              options={SORT_OPTIONS.map((opt) => opt.value)}
              onChange={setSelectedSort}
              renderLabel={(val) => SORT_OPTIONS.find((o) => o.value === val)?.label}
              renderOption={(val) => <span>{SORT_OPTIONS.find((o) => o.value === val)?.label}</span>}
            />
          </div>
        }
      />

      {/* Content area with animated transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStage.slug}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {filteredItems.length === 0 ? (
            <StageEmptyState stage={selectedStage} />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(({ storyline, match }, index) => (
                <StorylineCard
                  key={storyline.id}
                  index={index}
                  storyline={storyline}
                  match={match}
                  stage={selectedStage}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

Storylines.displayName = 'Storylines';
