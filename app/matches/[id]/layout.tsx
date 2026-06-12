import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  try {
    const { id } = await params;

    // Fetch match data
    const response = await fetch(`${API_BASE}/matches/${id}`, {
      next: { revalidate: 30 }, // 10 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch match');
    }

    const data = await response.json();
    const match = data.data;

    if (!match) {
      return {
        title: 'Match Not Found | FIFA Bro',
        description: 'The match you are looking for does not exist.',
      };
    }

    const title = `${match.homeTeam} vs ${match.awayTeam} | FIFA Bro`;
    const description = `${match.homeTeam} vs ${match.awayTeam} - ${new Date(match.matchDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${match.stadium}. FIFA World Cup 2026 match details, preview, and analysis.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/matches/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Match Details | FIFA Bro',
      description: 'View detailed FIFA World Cup 2026 match information.',
    };
  }
}

export default function MatchDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
