'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { TeamLogo } from '@/components';
import type { MatchSummary } from '@/types';

interface FeaturedNationsCarouselProps {
  matches: MatchSummary[];
}

const FEATURED_NATIONS = ['Portugal', 'Argentina', 'Brazil', 'France', 'Spain', 'England'];
const IST_OFFSET_MINUTES = 330;

interface NationCard {
  nation: string;
  nextMatch: MatchSummary | null;
  opponent: string;
  date: string;
  time: string;
  stage: string;
  venue: string;
}

function getKickoffTime(match: MatchSummary) {
  const date = match.matchDate.slice(0, 10);
  const time = match.kickoffTime.includes('T') ? match.kickoffTime.split('T')[1] : match.kickoffTime;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.replace(/Z$/, '').split(':').map(Number);

  return new Date(Date.UTC(year, month - 1, day, hour, minute) - IST_OFFSET_MINUTES * 60 * 1000);
}

function formatStage(match: MatchSummary) {
  if (match.groupCode) return `Group ${match.groupCode}`;
  return match.stage.replace(/[-_]/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

const FeaturedNationsCarouselComponent: React.FC<FeaturedNationsCarouselProps> = ({ matches }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseAutoScroll = () => {
    setAutoScroll(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setAutoScroll(true), 8000);
  };

  const holdAutoScroll = () => {
    setAutoScroll(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  };

  const resumeAutoScroll = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setAutoScroll(true), 1200);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1180) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const nationCards = useMemo<NationCard[]>(() => {
    const now = Date.now();

    return FEATURED_NATIONS.map((nation) => {
      const nextMatch = matches
        .filter(
          (match) =>
            match.matchDate &&
            match.kickoffTime &&
            (match.homeTeam.toLowerCase() === nation.toLowerCase() ||
              match.awayTeam.toLowerCase() === nation.toLowerCase())
        )
        .map((match) => ({
          match,
          kickoff: getKickoffTime(match),
        }))
        .filter(({ kickoff }) => kickoff.getTime() > now)
        .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())[0];

      if (!nextMatch) {
        return {
          nation,
          nextMatch: null,
          opponent: 'TBA',
          date: 'TBA',
          time: 'TBA',
          stage: 'TBA',
          venue: 'TBA',
        };
      }

      const match = nextMatch.match;
      const opponent = match.homeTeam.toLowerCase() === nation.toLowerCase() ? match.awayTeam : match.homeTeam;

      return {
        nation,
        nextMatch: match,
        opponent,
        date: nextMatch.kickoff.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Kolkata',
        }),
        time: nextMatch.kickoff.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }),
        stage: formatStage(match),
        venue: [match.stadium, match.city].filter(Boolean).join(', '),
      };
    });
  }, [matches]);

  const totalPages = Math.max(1, Math.ceil(FEATURED_NATIONS.length / itemsPerPage));
  const canNavigatePrev = currentPage > 0;
  const canNavigateNext = currentPage < totalPages - 1;

  const visibleCards = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return nationCards.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage, nationCards]);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoScroll, totalPages]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    pauseAutoScroll();
  };

  return (
    <div
      className="space-y-5"
      onMouseEnter={holdAutoScroll}
      onMouseLeave={resumeAutoScroll}
      onTouchStart={holdAutoScroll}
      onTouchEnd={resumeAutoScroll}
      onFocus={holdAutoScroll}
      onBlur={resumeAutoScroll}
    >
      <div className="flex items-center justify-end gap-3">
        <motion.button
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canNavigatePrev}
          whileHover={{ scale: canNavigatePrev ? 1.06 : 1 }}
          whileTap={{ scale: canNavigatePrev ? 0.96 : 1 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0b0f14]/90 text-accent shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Previous featured nations"
        >
          <ChevronLeft size={21} />
        </motion.button>

        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-secondary">
          {currentPage + 1} / {totalPages}
        </div>

        <motion.button
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canNavigateNext}
          whileHover={{ scale: canNavigateNext ? 1.06 : 1 }}
          whileTap={{ scale: canNavigateNext ? 0.96 : 1 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0b0f14]/90 text-accent shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition disabled:cursor-not-allowed disabled:opacity-25"
          aria-label="Next featured nations"
        >
          <ChevronRight size={21} />
        </motion.button>
      </div>

      <div className="relative rounded-[28px] border border-white/[0.04] bg-white/[0.01] p-1">
        <div className="grid gap-5 md:gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))` }}>
          {visibleCards.map((card, index) => (
            <motion.div
              key={`${card.nation}-${currentPage}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <NationCard card={card} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentPage
                ? 'w-8 bg-accent shadow-[0_0_18px_rgba(0,183,255,0.45)]'
                : 'w-2 bg-white/10 hover:bg-accent/50'
            }`}
            aria-label={`Go to featured nations page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

interface NationCardProps {
  card: NationCard;
}

const NationCard: React.FC<NationCardProps> = ({ card }) => {
  if (!card.nextMatch) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[26px] border border-white/[0.07] bg-[#080b10] p-6">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-text-primary">{card.nation}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
            No upcoming match
          </p>
        </div>
      </div>
    );
  }

  const teamId =
    card.nextMatch.homeTeam.toLowerCase() === card.nation.toLowerCase()
      ? card.nextMatch.homeTeamCode || card.nation.toLowerCase()
      : card.nextMatch.awayTeamCode || card.nation.toLowerCase();

  return (
    <Link href={`/teams/${teamId}`} className="block h-full text-white hover:text-white">
      <motion.article
        whileHover={{ y: -6 }}
        className="group relative flex min-h-[340px] h-full flex-col overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#080b10] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.32)] transition-colors duration-300 hover:border-accent/25"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-accent/[0.06] blur-3xl transition group-hover:bg-accent/[0.1]" />

        <div className="relative z-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-accent">Featured</p>
          <h3 className="mt-4 font-fifa-normal text-[clamp(44px,5vw,76px)] leading-[0.82] tracking-[-0.04em] text-text-primary transition group-hover:text-accent">
            {card.nation}
          </h3>
        </div>

        <div className="relative z-10 my-6 border-y border-white/[0.07] py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-text-secondary">Next Match</p>
            <span className="rounded-full border border-accent/20 bg-accent/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              {card.stage}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <TeamBlock name={card.nextMatch.homeTeam} flagCode={card.nextMatch.homeFlagCode} align="left" />
            <span className="text-sm font-black uppercase tracking-[-0.04em] text-accent drop-shadow-[0_0_14px_rgba(0,183,255,0.3)]">
              VS
            </span>
            <TeamBlock name={card.nextMatch.awayTeam} flagCode={card.nextMatch.awayFlagCode} align="right" />
          </div>
        </div>

        <div className="relative z-10 mt-auto grid gap-3">
          <MetaRow icon={<Calendar size={15} />} label="Date" value={card.date} />
          <MetaRow icon={<Clock size={15} />} label="Kickoff" value={card.time} />
          <MetaRow icon={<MapPin size={15} />} label="Venue" value={card.venue} />
        </div>
      </motion.article>
    </Link>
  );
};

function TeamBlock({ name, flagCode, align }: { name: string; flagCode?: string; align: 'left' | 'right' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className={`mb-3 flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {flagCode && <TeamLogo flagCode={flagCode} teamName={name} size="sm" />}
      </div>
      <p className="truncate text-sm font-extrabold leading-tight text-text-primary">{name}</p>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[20px_74px_minmax(0,1fr)] items-center gap-2 text-sm">
      <span className="text-accent/75">{icon}</span>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-secondary">{label}</span>
      <span className="truncate font-bold text-text-primary">{value}</span>
    </div>
  );
}

export const FeaturedNationsCarousel = memo(FeaturedNationsCarouselComponent);
FeaturedNationsCarousel.displayName = 'FeaturedNationsCarousel';
