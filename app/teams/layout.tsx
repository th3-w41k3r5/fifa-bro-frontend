import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teams - FIFA Bro',
  description: 'Browse all FIFA World Cup 2026 teams. View team profiles, rosters, statistics, and match schedules.',
};

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
