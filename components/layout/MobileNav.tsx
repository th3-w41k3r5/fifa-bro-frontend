'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, Layers, Settings } from 'lucide-react';
import { SettingsPanel } from '@/components/layout/SettingsPanel';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface MobileNavProps {
  items?: NavItem[];
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const defaultItems: NavItem[] = [
  { id: 'matches', label: 'Matches', icon: <Trophy size={24} />, href: '/matches' },
  { id: 'home', label: 'Home', icon: <Home size={24} />, href: '/' },
  { id: 'teams', label: 'Teams', icon: <Users size={24} />, href: '/teams' },
  { id: 'groups', label: 'Groups', icon: <Layers size={24} />, href: '/groups' },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  items = defaultItems,
  currentPage,
  onNavigate,
}) => {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const activePage =
    currentPage ||
    (pathname === '/'
      ? 'home'
      : pathname.startsWith('/matches')
        ? 'matches'
        : pathname.startsWith('/teams')
          ? 'teams'
          : pathname.startsWith('/groups')
            ? 'groups'
            : undefined);

  const primaryItems = items.slice(0, 4);

  const handleNavClick = (id: string, href: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      window.location.href = href;
    }
    setSettingsOpen(false);
  };

  const navButtonClass = (active: boolean) =>
    `relative min-w-0 mx-0.5 flex h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-black transition duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      active
        ? 'border border-accent/30 bg-accent/[0.14] text-accent shadow-[0_0_24px_rgba(0,183,255,0.13),inset_0_0_0_1px_rgba(255,255,255,0.03)]'
        : 'border border-transparent text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
    }`;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 w-screen max-w-[100vw] overflow-hidden border-t border-white/[0.08] bg-[rgba(8,11,16,0.94)] shadow-[0_-24px_60px_rgba(0,0,0,0.45)] backdrop-blur-[28px] md:hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,183,255,0.09),transparent_55%)]" />
        <div className="relative grid grid-cols-5 items-center px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
          <button
            onClick={() => {
              setSettingsOpen((isOpen) => !isOpen);
            }}
            className={navButtonClass(settingsOpen)}
            aria-label="Settings"
            aria-expanded={settingsOpen}
          >
            <Settings size={22} />
            <span>Settings</span>
          </button>

          {primaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.href)}
              className={navButtonClass(activePage === item.id)}
              aria-label={item.label}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

        </div>
      </nav>

      {settingsOpen && (
        <div
          className="fixed left-0 right-0 top-[72px] z-40 bg-black/70 backdrop-blur-xl backdrop-saturate-150 md:hidden bottom-[77px]"
          onClick={() => setSettingsOpen(false)}
          role="presentation"
        />
      )}

      {settingsOpen && (
        <div className="fixed left-0 right-0 top-[72px] z-50 flex items-end px-3 pb-4 md:hidden bottom-[215px]">
          <SettingsPanel className="w-full" onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </>
  );
};

MobileNav.displayName = 'MobileNav';
