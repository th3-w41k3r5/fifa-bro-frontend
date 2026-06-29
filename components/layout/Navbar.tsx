'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Search, LogOut, User, Menu, Trophy, Zap, Calendar, CalendarDays, Users, BarChart3, Settings, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { SettingsPanel } from '@/components/layout/SettingsPanel';
import type { MatchSummary, TeamSummary, GroupSummary, StorylineSummary } from '@/types';

interface UserMenu {
  profile?: string;
  onLogout: () => void;
}

interface NavbarProps {
  currentPage?: string;
  userMenu?: UserMenu;
  teams?: TeamSummary[];
  matches?: MatchSummary[];
  groups?: GroupSummary[];
  storylines?: StorylineSummary[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, userMenu, teams = [], matches = [], groups = [], storylines = [] }) => {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sectionsMenuOpen, setSectionsMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setSearchOpen(false);
    setUserMenuOpen(false);
    setSectionsMenuOpen(false);
    setSettingsOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Matches', href: '/matches', id: 'matches' },
    { label: 'Knockout', href: '/knockout', id: 'knockout' },
    { label: 'Teams', href: '/teams', id: 'teams' },
    { label: 'Groups', href: '/groups', id: 'groups' },
  ];

  const homepageSections = [
    { id: 'today-matchday', label: "Today's Matches", href: '#today-matchday', icon: CalendarDays },
    { id: 'featured-nations', label: 'Featured Nations', href: '#featured-nations', icon: Trophy },
    { id: 'amazing-matches', label: 'Amazing Matches', href: '#amazing-matches', icon: Zap },
    { id: 'match-schedule', label: 'Match Schedule', href: '#match-schedule', icon: Calendar },
    { id: 'standings', label: 'Standings', href: '#standings', icon: Users },
    { id: 'tournament-stats', label: 'Tournament Stats', href: '#tournament-stats', icon: BarChart3 },
    { id: 'knockout', label: 'Knockout Stage', href: '/knockout', icon: Trophy },
  ];

  const handleSectionClick = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
    } else {
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setSectionsMenuOpen(false);
  };

  const activePage =
    currentPage ||
    (pathname === '/'
      ? 'home'
      : pathname.startsWith('/matches')
        ? 'matches'
        : pathname.startsWith('/knockout')
          ? 'knockout'
          : pathname.startsWith('/teams')
            ? 'teams'
            : pathname.startsWith('/groups')
              ? 'groups'
              : undefined);

  const hasSearchData = teams.length > 0 || matches.length > 0 || groups.length > 0 || storylines.length > 0;

  const overlayRoot =
    mounted && typeof document !== 'undefined'
      ? createPortal(
        <AnimatePresence>
          {sectionsMenuOpen && (
            <>
              <motion.div
                className="fixed inset-x-0 md:bottom-0 bottom-[77px] top-[72px] z-[8000] bg-black/65 backdrop-blur-2xl backdrop-saturate-150"
                onClick={() => setSectionsMenuOpen(false)}
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />

              <motion.div
                className="fixed inset-x-0 bottom-[78px] z-[8100] max-h-[calc(100vh-150px)] overflow-y-auto rounded-t-[28px] border-t border-white/[0.08] bg-[rgba(8,11,16,0.96)] shadow-[0_-24px_60px_rgba(0,0,0,0.48)] backdrop-blur-[36px] md:hidden"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_10%_0%,rgba(0,183,255,0.08),transparent_45%)]" />
                <div className="relative z-10">
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[rgba(8,11,16,0.96)] px-6 py-5 backdrop-blur-xl">
                    <div>
                      <h3 className="text-base font-black uppercase tracking-[0.14em] text-text-primary">Quick Navigation</h3>
                      <p className="mt-1 text-xs font-medium text-text-secondary/70">Jump anywhere in the tournament</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSectionsMenuOpen(false)}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-text-secondary transition duration-300 hover:border-accent/25 hover:bg-white/[0.08] hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
                      aria-label="Close quick navigation"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-1.5 px-5 py-6">
                    {homepageSections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.href)}
                          className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-lg px-4 py-3.5 text-left transition-all duration-250 hover:translate-x-1"
                        >
                          <div className="absolute inset-0 bg-white/[0.03] opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
                          <div className="absolute bottom-0 left-0 top-0 w-1 origin-top scale-y-0 rounded-r-full bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                          <div className="relative z-10 flex-shrink-0 text-accent/60 transition-all duration-300 group-hover:scale-110 group-hover:text-accent">
                            <IconComponent size={20} strokeWidth={2.5} />
                          </div>
                          <span className="relative z-10 text-sm font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent">
                            {section.label}
                          </span>
                          <div className="relative z-10 ml-auto text-accent/0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent/60">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-4" />
                </div>
              </motion.div>

              <motion.div
                className="fixed left-1/2 top-28 z-[8100] hidden w-[420px] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(8,11,16,0.96)] shadow-[0_26px_70px_rgba(0,0,0,0.58)] backdrop-blur-[36px] md:block"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_10%_0%,rgba(0,183,255,0.08),transparent_45%)]" />

                <div className="relative z-10 px-5 py-5">
                  <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/[0.05] pb-5">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-text-primary">Quick Navigation</h3>
                      <p className="mt-1.5 text-xs font-medium text-text-secondary/70">Jump anywhere in the tournament</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSectionsMenuOpen(false)}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-text-secondary transition duration-300 hover:border-accent/25 hover:bg-white/[0.08] hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
                      aria-label="Close quick navigation"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {homepageSections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.href)}
                          className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-lg px-3.5 py-3 text-left transition-all duration-250 hover:translate-x-1"
                        >
                          <div className="absolute inset-0 bg-white/[0.03] opacity-0 transition-opacity duration-250 group-hover:opacity-100" />
                          <div className="absolute bottom-0 left-0 top-0 w-1 origin-top scale-y-0 rounded-r-full bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                          <div className="relative z-10 flex-shrink-0 text-accent/60 transition-all duration-300 group-hover:scale-110 group-hover:text-accent">
                            <IconComponent size={18} strokeWidth={2.5} />
                          </div>
                          <span className="relative z-10 text-sm font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent">
                            {section.label}
                          </span>
                          <div className="relative z-10 ml-auto text-accent/0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent/60">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {settingsOpen && (
            <>
              <motion.div
                className="fixed inset-x-0 bottom-0 top-[72px] z-[8000] bg-black/65 backdrop-blur-2xl backdrop-saturate-150"
                onClick={() => setSettingsOpen(false)}
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
              <motion.div
                className="fixed left-1/2 top-28 z-[8100] hidden w-[420px] max-w-[calc(100vw-2rem)] -translate-x-1/2 md:block"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <SettingsPanel className="w-full" onClose={() => setSettingsOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )
      : null;

  return (
    <>
      <nav className="sticky top-0 z-50 h-[72px] border-b border-white/[0.06] bg-[rgba(8,8,8,0.75)] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.30)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(0,183,255,0.08),transparent_32%),linear-gradient(180deg,rgba(0,183,255,0.03),transparent_50%)]" />
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8 relative z-10">
          <div className="flex h-full items-center gap-8">
            {/* Logo & Branding */}
            <a href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="relative h-11 w-11 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <Image
                  src="https://files.catbox.moe/9aejnd.png"
                  alt="FIFA Bro WC26 logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <p className="text-xs font-fifa-semi text-accent uppercase tracking-[0.1em]">FIFA Bro</p>
                <p className="text-[9px] uppercase tracking-[0.15em] text-text-secondary font-semibold">World Cup 2026</p>
              </div>
            </a>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6 ml-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group relative text-xs font-semibold uppercase tracking-[0.12em] transition duration-250 px-2 py-1"
                  aria-current={activePage === item.id ? 'page' : undefined}
                >
                  <span className={activePage === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-accent transition duration-300'}>{item.label}</span>
                  <span
                    className={`absolute left-2 right-2 -bottom-1 h-1 rounded-full bg-[linear-gradient(90deg,rgba(0,183,255,0.8),rgba(0,183,255,0.4))] shadow-[0_0_12px_rgba(0,183,255,0.35)] transition-all duration-300 ${activePage === item.id ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                  />
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center gap-2 md:gap-3">
              {/* Live Coverage Pill
            <div className="hidden lg:flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-text-secondary transition hover:-translate-y-[1px] hover:bg-white/15">
              <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="uppercase tracking-[0.12em] font-semibold">Live</span>
            </div>*/}

              {/* Knockout Mobile Icon */}
              <a
                href="/knockout"
                className="md:hidden inline-flex items-center justify-center rounded-full border border-accent/20 bg-[linear-gradient(135deg,rgba(0,183,255,0.15),rgba(0,183,255,0.08))] px-3 py-2.5 text-accent transition duration-300 hover:border-accent/40 hover:bg-[linear-gradient(135deg,rgba(0,183,255,0.20),rgba(0,183,255,0.12))] hover:shadow-[0_8px_24px_rgba(0,183,255,0.10)] focus:outline-none focus:ring-2 focus:ring-accent/40"
                aria-label="Knockout Stage"
              >
                <Trophy size={16} />
              </a>

              {/* Search Button */}
              {hasSearchData && (
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition duration-300 focus:outline-none focus:ring-2 focus:ring-accent/40 sm:px-4 ${searchOpen
                      ? 'border-accent/40 bg-[linear-gradient(135deg,rgba(0,183,255,0.20),rgba(0,183,255,0.12))] text-accent shadow-[0_8px_24px_rgba(0,183,255,0.10)]'
                      : 'border-accent/20 bg-[linear-gradient(135deg,rgba(0,183,255,0.15),rgba(0,183,255,0.08))] text-accent hover:border-accent/40 hover:bg-[linear-gradient(135deg,rgba(0,183,255,0.20),rgba(0,183,255,0.12))] hover:shadow-[0_8px_24px_rgba(0,183,255,0.10)]'
                    }`}
                  aria-label="Search"
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              )}

              {isHomepage && (
                <button
                  onClick={() => {
                    setSectionsMenuOpen(!sectionsMenuOpen);
                    setSettingsOpen(false);
                  }}
                  className={`md:hidden inline-flex h-11 w-11 items-center justify-center transition duration-300 ${sectionsMenuOpen
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-accent'
                    }`}
                  aria-label="Quick navigation menu"
                  aria-expanded={sectionsMenuOpen}
                >
                  <Menu size={18} />
                </button>
              )}





              {/* Sections Menu Button (Desktop - Homepage Only) */}
              {isHomepage && (
                <div className="relative">
                  <button
                    onClick={() => setSectionsMenuOpen(!sectionsMenuOpen)}
                    className={`hidden md:inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition duration-300 focus:outline-none focus:ring-2 focus:ring-accent/40 ${sectionsMenuOpen
                        ? 'bg-white/[0.08] text-accent border border-accent/40 shadow-[0_8px_24px_rgba(0,183,255,0.12)]'
                        : 'bg-white/[0.04] text-text-secondary hover:text-accent border border-white/[0.06] hover:border-accent/20 hover:bg-white/[0.06]'
                      }`}
                    aria-label="Quick navigation menu"
                    aria-expanded={sectionsMenuOpen}
                  >
                    <Menu size={16} />
                    <span>Quick Nav</span>
                  </button>
                </div>
              )}

              <div className="relative hidden md:block">
                <button
                  onClick={() => {
                    setSettingsOpen(!settingsOpen);
                    setSectionsMenuOpen(false);
                  }}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-300 ${settingsOpen
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-accent'
                    }`}
                  aria-label="Open settings"
                  aria-expanded={settingsOpen}
                >
                  <Settings size={18} />
                </button>
              </div>

              {userMenu && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition duration-300 ${userMenuOpen
                        ? 'border-accent/40 bg-[rgba(0,183,255,0.12)] text-accent shadow-[0_8px_24px_rgba(0,183,255,0.15)]'
                        : 'border-white/[0.08] bg-white/[0.05] text-text-secondary hover:text-accent hover:border-accent/20 hover:bg-white/[0.08]'
                      } focus:outline-none focus:ring-2 focus:ring-accent/40`}
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <User size={18} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 rounded-[18px] border border-white/[0.08] bg-[rgba(8,11,16,0.95)] backdrop-blur-[24px] p-3 shadow-[0_20px_56px_rgba(0,0,0,0.40)]">
                      <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_10%_0%,rgba(0,183,255,0.08),transparent_40%)]" />
                      <div className="relative z-10">
                        {userMenu.profile && (
                          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-text-secondary mb-2">
                            {userMenu.profile}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            userMenu.onLogout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left text-sm font-semibold text-text-primary transition duration-300 hover:bg-white/[0.08] hover:border-accent/20 hover:text-accent"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut size={16} />
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {searchOpen && (
            <div className="mt-4 pb-4">
              <SearchBar teams={teams} matches={matches} groups={groups} storylines={storylines} />
            </div>
          )}
        </div>
      </nav>
      {overlayRoot}
    </>
  );
};

Navbar.displayName = 'Navbar';
