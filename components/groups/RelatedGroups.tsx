'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RelatedGroupsProps {
  currentCode: string;
}

export default function RelatedGroups({ currentCode }: RelatedGroupsProps) {
  const groupCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const currentIndex = groupCodes.indexOf(currentCode);
  const related = [groupCodes[currentIndex - 1], groupCodes[currentIndex + 1]].filter(Boolean) as string[];

  if (related.length === 0) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Continue Exploring</p>
        <h3 className="mt-1 font-display text-3xl font-black uppercase tracking-[0.06em] text-text-primary">
          Related Groups
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {related.map((code) => (
          <Link key={code} href={`/groups/${code}`} className="block">
            <article className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#080b10] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,183,255,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_45%)] opacity-70 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-end gap-3">
                  <span className="font-display text-6xl font-black leading-[0.82] text-text-primary">{code}</span>
                  <div className="pb-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">Group</p>
                    <p className="text-sm font-bold text-text-secondary">View fixtures and standings</p>
                  </div>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-accent/[0.08] text-accent transition-transform group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
