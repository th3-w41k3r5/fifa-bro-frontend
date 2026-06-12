import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Matches - FIFA Bro',
  description: 'Browse all FIFA World Cup 2026 matches. View detailed match information, standings, and analysis.',
};

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
