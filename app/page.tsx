'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SectionTitle, LoadingState, EmptyState } from '@/components';
import { PageContainer } from '@/components';
import {
  HeroMatchSelector,
  FeaturedNationsCarousel,
  Storylines,
  MatchSchedule,
  GroupsExplorer,
  TournamentStats,
} from '@/components/homepage';
import { Trophy, Zap, BookOpen, Users, BarChart3 } from 'lucide-react';

// Import API client and types
import { getGroups, getHomeData, getMatches, getStandings, getStorylines } from '@/lib/api';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import type { GroupSummary, HomePayload, MatchSummary, StandingGroup, StorylineSummary } from '@/types';

export default function HomePage() {
  const { mascotEnabled } = useAppSettings();
  // Data states
  const [homeData, setHomeData] = useState<HomePayload | null>(null);
  const [allMatches, setAllMatches] = useState<MatchSummary[]>([]);
  const [allStandings, setAllStandings] = useState<StandingGroup[]>([]);
  const [allGroups, setAllGroups] = useState<GroupSummary[]>([]);
  const [allStorylines, setAllStorylines] = useState<StorylineSummary[]>([]);

  // Loading states
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingStandings, setIsLoadingStandings] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingStorylines, setIsLoadingStorylines] = useState(true);

  // Error states
  const [homeError, setHomeError] = useState<string | null>(null);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [storylinesError, setStorylinesError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch home data
      try {
        const data = await getHomeData();
        setHomeData(data);
        setHomeError(null);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setHomeError(error instanceof Error ? error.message : 'Failed to load home data');
      }

      // Fetch all matches
      try {
        setIsLoadingMatches(true);
        const matches = await getMatches();
        setAllMatches(matches);
        setMatchesError(null);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatchesError(error instanceof Error ? error.message : 'Failed to load matches');
      } finally {
        setIsLoadingMatches(false);
      }

      // Fetch standings
      try {
        setIsLoadingStandings(true);
        const standings = await getStandings();
        setAllStandings(standings);
        setStandingsError(null);
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandingsError(error instanceof Error ? error.message : 'Failed to load standings');
      } finally {
        setIsLoadingStandings(false);
      }

      // Fetch full groups
      try {
        setIsLoadingGroups(true);
        const groups = await getGroups();
        setAllGroups(groups);
        setGroupsError(null);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroupsError(error instanceof Error ? error.message : 'Failed to load groups');
      } finally {
        setIsLoadingGroups(false);
      }

      // Fetch all storylines
      try {
        setIsLoadingStorylines(true);
        const storylines = await getStorylines();
        setAllStorylines(storylines);
        setStorylinesError(null);
      } catch (error) {
        console.error('Error fetching storylines:', error);
        setStorylinesError(error instanceof Error ? error.message : 'Failed to load storylines');
      } finally {
        setIsLoadingStorylines(false);
      }
    };

    fetchData();
  }, []);

  const homepageStorylines = allStorylines.length > 0 ? allStorylines : (homeData?.storylines ?? []);
  const homepageGroups = allGroups.length > 0 ? allGroups : (homeData?.groups ?? []);

  return (
    <PageContainer
      variant="default"
      header={{
        title: 'FIFA WORLD CUP 2026',
        subtitle: 'Live Coverage & Results',
      }}
    >
      {mascotEnabled && (
        <div
          className="homepage-mascot-overlay pointer-events-none fixed bottom-24 right-3 z-[9999] w-[92px] opacity-100 sm:w-[92px] lg:bottom-7 lg:right-7 lg:w-[150px]"
          aria-hidden="true"
        >
          <Image src="https://files.catbox.moe/ehhz06.png" alt="" width={680} height={680} priority />
        </div>
      )}

      <div className="space-y-24 pb-20">
        {/* SECTION 1: Hero Match */}
        <section>
          {isLoadingMatches ? (
            <LoadingState variant="skeleton" />
          ) : matchesError ? (
            <EmptyState title="Unable to select hero match" description={matchesError} variant="error" />
          ) : isLoadingStorylines && homepageStorylines.length === 0 ? (
            <LoadingState variant="skeleton" />
          ) : storylinesError && homepageStorylines.length === 0 ? (
            <EmptyState title="Unable to load hero storylines" description={storylinesError} variant="error" />
          ) : homeError && homepageStorylines.length === 0 ? (
            <EmptyState title="Unable to load hero match" description={homeError} variant="error" />
          ) : homepageStorylines.length && allMatches.length ? (
            <HeroMatchSelector matches={allMatches} storylines={homepageStorylines} />
          ) : (
            <EmptyState
              title="No upcoming hero match"
              description="No future match with an editorial storyline is currently available."
            />
          )}
        </section>

        {/* SECTION 2: Featured Nations Carousel */}
        <section id="featured-nations" className="scroll-mt-24">
          <SectionTitle
            title="Featured Nations"
            subtitle="Upcoming matches of major football nations"
            icon={<Trophy size={24} />}
          />
          {isLoadingMatches ? (
            <LoadingState variant="skeleton" />
          ) : matchesError ? (
            <EmptyState title="Unable to load featured nations" description={matchesError} variant="error" />
          ) : allMatches.length > 0 ? (
            <FeaturedNationsCarousel matches={allMatches} />
          ) : (
            <EmptyState
              title="No matches available"
              description="Featured nations will appear as matches are scheduled"
            />
          )}
        </section>

        {/* SECTION 3: Amazing Matches */}
        <section id="amazing-matches" className="scroll-mt-24">
          <SectionTitle
            title="Amazing Matches of FIFA WC 2026"
            subtitle="All 19 matches with exclusive storylines"
            icon={<Zap size={24} />}
          />
          {isLoadingStorylines && homepageStorylines.length === 0 ? (
            <LoadingState variant="skeleton" />
          ) : storylinesError && homepageStorylines.length === 0 ? (
            <EmptyState title="Unable to load amazing matches" description={storylinesError} variant="error" />
          ) : homeError && homepageStorylines.length === 0 ? (
            <EmptyState title="Unable to load amazing matches" description={homeError} variant="error" />
          ) : isLoadingMatches ? (
            <LoadingState variant="skeleton" />
          ) : matchesError ? (
            <EmptyState title="Unable to match storylines to fixtures" description={matchesError} variant="error" />
          ) : homepageStorylines.length > 0 ? (
            <Storylines storylines={homepageStorylines} matches={allMatches} />
          ) : (
            <EmptyState title="No matches yet" description="Amazing matches will be announced soon" />
          )}
        </section>

        {/* SECTION 4: Complete Match Schedule */}
        <section id="match-schedule" className="scroll-mt-24">
          <SectionTitle
            title="Complete Match Schedule"
            subtitle="All 104 matches with search and filtering"
            icon={<BookOpen size={24} />}
          />
          {isLoadingMatches ? (
            <LoadingState variant="skeleton" />
          ) : matchesError ? (
            <EmptyState title="Unable to load matches" description={matchesError} variant="error" />
          ) : allMatches.length > 0 ? (
            <MatchSchedule matches={allMatches} />
          ) : (
            <EmptyState title="No matches available" description="Match schedule will be available soon" />
          )}
        </section>

        {/* SECTION 5: Groups Explorer */}
        <section id="standings" className="scroll-mt-24">
          <SectionTitle
            title="Groups Explorer"
            subtitle="Navigate through all tournament groups"
            icon={<Users size={24} />}
          />
          {isLoadingStandings || (isLoadingGroups && homepageGroups.length === 0) ? (
            <LoadingState variant="skeleton" />
          ) : groupsError && homepageGroups.length === 0 ? (
            <EmptyState title="Unable to load groups" description={groupsError} variant="error" />
          ) : homeError && homepageGroups.length === 0 ? (
            <EmptyState title="Unable to load groups" description={homeError} variant="error" />
          ) : standingsError ? (
            <EmptyState title="Unable to load standings" description={standingsError} variant="error" />
          ) : homepageGroups.length > 0 ? (
            <GroupsExplorer groups={homepageGroups} standings={allStandings} matches={allMatches} />
          ) : (
            <EmptyState title="No groups available" description="Group information will be available soon" />
          )}
        </section>

        {/* SECTION 6: Tournament Stats */}
        <section id="tournament-stats" className="scroll-mt-24">
          <SectionTitle
            title="Tournament Statistics"
            subtitle="Key numbers for FIFA World Cup 2026"
            icon={<BarChart3 size={24} />}
          />
          <TournamentStats animated={true} />
        </section>
      </div>
    </PageContainer>
  );
}
