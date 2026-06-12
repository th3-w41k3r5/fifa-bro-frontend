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

    // Fetch team data
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      next: { revalidate: 600 }, // 10 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team');
    }

    const data = await response.json();
    const team = data.data;

    if (!team) {
      return {
        title: 'Team Not Found | FIFA Bro',
        description: 'The team you are looking for does not exist.',
      };
    }

    const title = `${team.name} - ${team.confederation || 'International'} | FIFA Bro`;
    const description = `FIFA World Cup 2026 - ${team.name}. View team profile, squad roster, statistics, upcoming matches, and tournament performance.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/teams/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _error
  ) {
    return {
      title: 'Team Details | FIFA Bro',
      description: 'View FIFA World Cup 2026 team information.',
    };
  }
}

export default function TeamDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
