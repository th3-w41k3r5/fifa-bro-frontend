'use client';

import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Goal,
} from 'lucide-react';
import { FifaPlayer } from '@/types';
import {
  getPlayerPictureUrl,
  getPlayerShortName,
  getPositionLabel,
  PlayerMatchEvents,
} from '@/lib/fifaMatchUtils';
import { RedCardIcon, YellowCardIcon } from './matchCentreIcons';

interface PitchPlayerMarkerProps {
  player: FifaPlayer;
  events?: PlayerMatchEvents;
  compact?: boolean;
}

function formatPitchName(name: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].toUpperCase();
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return `${firstName.charAt(0).toUpperCase()}. ${lastName.toUpperCase()}`;
}

function EventBadges({ events, compact }: { events: PlayerMatchEvents; compact?: boolean }) {
  const goalSize = compact ? 'h-6 w-6' : 'h-6 w-6 sm:h-7 sm:w-7';
  const smallSize = compact ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5';
  const goalIcon = compact ? 11 : 12;
  const smallIcon = compact ? 11 : 13;
  const badges: React.ReactNode[] = [];

  if (events.goals > 0) {
    badges.push(
      <div
        key="goals"
        className={`relative flex ${goalSize} items-center justify-center rounded-full border border-white/25 bg-black/90 shadow-[0_2px_8px_rgba(0,0,0,0.45)]`}
      >
        <Goal size={goalIcon} className="text-accent" aria-hidden />
        {events.goals > 1 && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-accent px-0.5 text-[7px] font-extrabold text-dark sm:text-[8px]">
            {events.goals}
          </span>
        )}
      </div>
    );
  }

  if (events.redCards > 0) {
    badges.push(
      <div
        key="red"
        className={`flex ${smallSize} items-center justify-center rounded-full border border-white/20 bg-black/90 shadow-sm`}
      >
        <RedCardIcon className="h-2.5 w-2 sm:h-3.5 sm:w-2.5" />
      </div>
    );
  }

  if (events.yellowCards > 0) {
    badges.push(
      <div
        key="yellow"
        className={`flex ${smallSize} items-center justify-center rounded-full border border-white/20 bg-black/90 shadow-sm`}
      >
        <YellowCardIcon className="h-2.5 w-2 sm:h-3.5 sm:w-2.5" />
      </div>
    );
  }

  if (events.substitutedOff) {
    badges.push(
      <div
        key="sub-off"
        className={`flex ${smallSize} items-center justify-center rounded-full border border-white/20 bg-black/90 shadow-sm`}
      >
        <ArrowDownCircle size={smallIcon} className="text-danger" aria-hidden />
      </div>
    );
  }

  if (events.substitutedOn) {
    badges.push(
      <div
        key="sub-on"
        className={`flex ${smallSize} items-center justify-center rounded-full border border-white/20 bg-black/90 shadow-sm`}
      >
        <ArrowUpCircle size={smallIcon} className="text-success" aria-hidden />
      </div>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="absolute -right-1.5 top-0 z-10 flex flex-col items-center gap-0.5 sm:-right-2.5">
      {badges}
    </div>
  );
}

export default function PitchPlayerMarker({ player, events, compact = false }: PitchPlayerMarkerProps) {
  const pictureUrl = getPlayerPictureUrl(player);
  const shortName = formatPitchName(getPlayerShortName(player));
  const avatarSize = compact
    ? 'h-11 w-11'
    : 'h-10 w-10 min-[390px]:h-11 min-[390px]:w-11 sm:h-12 sm:w-12 md:h-14 md:w-14';
  const widthClass = compact
    ? 'w-[88px]'
    : 'w-[54px] min-[390px]:w-[60px] sm:w-[72px] md:w-[84px]';
  const numberClass = compact ? 'text-[8px]' : 'text-[7px] min-[390px]:text-[8px] sm:text-[9px]';

  return (
    <div className={`flex shrink-0 flex-col items-center ${widthClass}`}>
      <div className="relative">
        <div
          className={`${avatarSize} overflow-hidden rounded-full border-2 border-white/20 bg-[#F8F8FF] shadow-[0_4px_14px_rgba(0,0,0,0.35)]`}
        >
          {pictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pictureUrl}
              alt={shortName}
              className={`h-full w-full scale-[3.8] md:scale-[3] translate-y-[45px] translate-x-[-2px] md:translate-x-[-3px] object-cover object-top ${compact ? 'md:translate-y-[35px]' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-white/30 sm:text-[10px]">
              #{player.ShirtNumber ?? '?'}
            </div>
          )}
        </div>

        <span
          className={`absolute -left-0.5 -top-0.5 z-10 rounded-full border border-white/15 bg-black/80 px-1 py-0.5 sm:-left-1 sm:-top-1 sm:px-1.5 ${numberClass} font-extrabold text-accent backdrop-blur-sm`}
        >
          {player.ShirtNumber ?? '?'}
        </span>

        {events && <EventBadges events={events} compact={compact} />}
      </div>

      <p
        className={`mt-1 flex w-full items-start justify-center text-center font-bold leading-tight text-white ${
          compact ? 'h-[26px] text-[9px]' : 'h-[22px] text-[8px] min-[390px]:h-[24px] min-[390px]:text-[9px] sm:h-[26px] sm:text-[10px] md:text-[11px]'
        }`}
      >
        <span className="line-clamp-2 break-words">{shortName}</span>
      </p>
      {!compact && (
        <p className="mt-0.5 hidden text-center text-[7px] font-semibold uppercase tracking-[0.08em] text-white/55 min-[390px]:block sm:text-[8px]">
          {getPositionLabel(player.Position)}
        </p>
      )}
      {player.Captain && !compact && (
        <span className="mt-0.5 text-[7px] font-extrabold uppercase tracking-[0.14em] text-accent">C</span>
      )}
    </div>
  );
}
