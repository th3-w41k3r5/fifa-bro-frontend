import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

interface Props {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  try {
    const { code } = await params;

    // Fetch group data
    const response = await fetch(`${API_BASE}/groups/${code}`, {
      next: { revalidate: 30 }, // 10 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch group');
    }

    const data = await response.json();
    const group = data.data;

    if (!group) {
      return {
        title: 'Group Not Found | FIFA Bro',
        description: 'The group you are looking for does not exist.',
      };
    }

    const title = `Group ${code} - ${group.name || ''} | FIFA Bro`;
    const description = `FIFA World Cup 2026 - Group ${code}. View standings, teams, matches, and detailed group analysis.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/groups/${code}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Group Details | FIFA Bro',
      description: 'View FIFA World Cup 2026 group information.',
    };
  }
}

export default function GroupDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
