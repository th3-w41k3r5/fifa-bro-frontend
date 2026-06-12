import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Groups - FIFA Bro',
  description: 'Explore all FIFA World Cup 2026 groups. View group standings, team rosters, and match schedules.',
};

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
