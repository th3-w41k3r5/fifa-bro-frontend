'use client';

import React, { useMemo } from 'react';
import { GroupSummary } from '@/types';
import GroupCard from './GroupCard';

interface TeamWithFlag {
  name: string;
  flagCode?: string;
}

interface GroupGridProps {
  groups: GroupSummary[];
  matchCounts?: Record<string, number>;
  groupNotes?: Record<string, string>;
  groupTeams?: Record<string, TeamWithFlag[]>;
}

export default function GroupGrid({
  groups,
  matchCounts = {},
  groupNotes = {},
  groupTeams = {},
}: GroupGridProps) {
  // Sort groups by code (A-L)
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.code.localeCompare(b.code));
  }, [groups]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedGroups.map((group) => (
        <GroupCard
          key={group.code}
          group={group}
          teams={groupTeams[group.code] || []}
          matchCount={matchCounts[group.code] || 6}
          note={groupNotes[group.code]}
        />
      ))}
    </div>
  );
}
