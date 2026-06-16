'use client';

import React from 'react';

export function YellowCardIcon({ className = 'h-3 w-2.5' }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-[2px] bg-warning shadow-[0_0_6px_rgba(245,158,11,0.45)] ${className}`}
      aria-hidden
    />
  );
}

export function RedCardIcon({ className = 'h-3 w-2.5' }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-[2px] bg-danger shadow-[0_0_6px_rgba(239,68,68,0.45)] ${className}`}
      aria-hidden
    />
  );
}

export function GoalTypeBadge({ type, prominent = false }: { type: 'P' | 'OG'; prominent?: boolean }) {
  return (
    <span
      className={`rounded-md border font-extrabold uppercase tracking-wider text-white ${
        prominent
          ? 'border-accent/40 bg-accent/20 px-1.5 py-0.5 text-[9px]'
          : 'border-white/10 bg-black/70 px-1 py-0.5 text-[8px]'
      }`}
    >
      {type}
    </span>
  );
}

export function WhistleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4a2 2 0 0 0-2 2v1.2a6 6 0 0 0-4 4.8v2a6 6 0 0 0 12 0v-2a6 6 0 0 0-4-4.8V6a2 2 0 0 0-2-2z" />
      <path d="M8 14h8" />
      <path d="M10 18h4" />
    </svg>
  );
}
