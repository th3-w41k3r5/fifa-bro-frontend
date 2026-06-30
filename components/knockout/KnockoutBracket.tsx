'use client';

import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import { Flag } from '@/components/common/Flag';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MatchSummary } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface KnockoutBracketProps {
  matches: MatchSummary[];
}

/* ------------------------------------------------------------------ */
/*  Bracket Structure Constants                                        */
/* ------------------------------------------------------------------ */


const LEFT_SF  = 101;
const RIGHT_SF = 102;
const FINAL_ID = 104;
const THIRD_PLACE_ID = 103;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatMatchDate(dateStr: string, timeStr?: string): string {
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mon = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    
    let timeFormatted = timeStr || '';
    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let hour = parseInt(parts[0], 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      timeFormatted = `${hour}:${parts[1]} ${ampm}`;
    }
    
    return `${weekday}, ${mon} ${day} • ${timeFormatted || 'TBD'}`;
  } catch {
    return '';
  }
}

function isMatchCompleted(m?: MatchSummary): boolean {
  return m?.status === 'completed' || m?.status === 'Completed';
}

function isMatchLive(m?: MatchSummary): boolean {
  return m?.status === 'live' || m?.status === 'Live';
}

/* ------------------------------------------------------------------ */
/*  MatchCard (uses depth prop ko-d0 to ko-d4)                         */
/* ------------------------------------------------------------------ */
const MatchCard: React.FC<{
  match: MatchSummary | undefined;
  matchId: number;
  depth: number;
}> = ({ match, matchId, depth }) => {
  const completed = isMatchCompleted(match);
  const live = isMatchLive(match);

  const homeScoreNum = Number(match?.homeScore);
  const awayScoreNum = Number(match?.awayScore);
  const hasScore = match?.homeScore != null && match?.awayScore != null && !isNaN(homeScoreNum) && !isNaN(awayScoreNum);
  
  const homePenNum = Number(match?.homePenaltyScore);
  const awayPenNum = Number(match?.awayPenaltyScore);
  const hasPenalties = match?.homePenaltyScore != null && match?.awayPenaltyScore != null && !isNaN(homePenNum) && !isNaN(awayPenNum);

  const homeWins = hasScore && (homeScoreNum > awayScoreNum || (homeScoreNum === awayScoreNum && hasPenalties && homePenNum > awayPenNum));
  const awayWins = hasScore && (awayScoreNum > homeScoreNum || (homeScoreNum === awayScoreNum && hasPenalties && awayPenNum > homePenNum));

  const statusText = completed
    ? 'FT'
    : live
      ? `LIVE ${match?.liveMinute ? match.liveMinute + "'" : ''}`
      : match?.matchDate
        ? formatMatchDate(match.matchDate, match.kickoffTime)
        : '';

  const classes = ['ko-card', `ko-d${depth}`];
  if (live) classes.push('ko-card--live');

  return (
    <Link href={`/matches/${matchId}`} className={classes.join(' ')} prefetch={false}>
      {/* Meta row */}
      <div className="ko-card__meta">
        <span>M{matchId}</span>
        <span className={live ? 'ko-card__meta-live' : ''}>{statusText}</span>
      </div>

      {/* Home team */}
      <TeamRow
        name={match?.homeTeam}
        flagCode={match?.homeFlagCode}
        slot={match?.homeSlot}
        score={match?.homeScore}
        penaltyScore={match?.homePenaltyScore}
        isWinner={homeWins}
        isLoser={awayWins}
        isPredicted={match?.homeIsPredicted}
        qualificationStatus={match?.homeQualificationStatus}
      />

      {/* Away team */}
      <TeamRow
        name={match?.awayTeam}
        flagCode={match?.awayFlagCode}
        slot={match?.awaySlot}
        score={match?.awayScore}
        penaltyScore={match?.awayPenaltyScore}
        isWinner={awayWins}
        isLoser={homeWins}
        isPredicted={match?.awayIsPredicted}
        qualificationStatus={match?.awayQualificationStatus}
      />
    </Link>
  );
};

/* ------------------------------------------------------------------ */
/*  TeamRow                                                            */
/* ------------------------------------------------------------------ */
const TeamRow: React.FC<{
  name?: string;
  flagCode?: string;
  slot?: string;
  score?: number;
  penaltyScore?: number;
  isWinner?: boolean;
  isLoser?: boolean;
  isPredicted?: boolean;
  qualificationStatus?: string;
}> = ({ name, flagCode, slot, score, penaltyScore, isWinner, isLoser, isPredicted, qualificationStatus }) => {
  const displayName = name || slot || 'TBD';
  const isTbd = !name;
  const isProvisional = qualificationStatus === 'provisional' || qualificationStatus === 'Provisional';

  const nameClasses = ['ko-card__name'];
  if (isTbd) nameClasses.push('ko-card__name--tbd');
  if (isWinner) nameClasses.push('ko-card__name--winner');
  if (isLoser) nameClasses.push('ko-card__name--loser');

  const scoreClasses = ['ko-card__score'];
  if (isWinner) scoreClasses.push('ko-card__score--winner');
  if (isLoser) scoreClasses.push('ko-card__score--loser');

  return (
    <div className="ko-card__team">
      <div className={flagCode ? 'ko-card__flag' : 'ko-card__flag ko-card__flag--empty'}>
        {flagCode ? (
          <Flag flagCode={flagCode} size="sm" />
        ) : (
          <span style={{ fontSize: 8, opacity: 0.25, fontWeight: 700 }}>?</span>
        )}
      </div>

      <span className={nameClasses.join(' ')}>
        <span className="ko-card__name-inner">{displayName}</span>
      </span>

      {isPredicted && <span className="ko-card__badge ko-card__badge--predicted">PREDICTED</span>}
      {isProvisional && <span className="ko-card__badge ko-card__badge--provisional">PROV</span>}

      {score != null && (
        <div className={scoreClasses.join(' ')}>
          {score}
          {penaltyScore != null && <span className="ml-1 text-[10px] font-bold opacity-70">({penaltyScore})</span>}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  BracketMerge (Recursive Node)                                      */
/* ------------------------------------------------------------------ */
const BracketMerge: React.FC<{
  topSource: React.ReactNode;
  bottomSource: React.ReactNode;
  result: React.ReactNode;
  isMirrored?: boolean;
  connDepth?: number;
}> = ({ topSource, bottomSource, result, isMirrored, connDepth = 1 }) => {
  return (
    <div className={`bm ${isMirrored ? 'bm--mirror' : ''}`}>
      <div className="bm__sources">
        {topSource}
        {bottomSource}
      </div>
      <div className={`bm__conn bm__conn--d${connDepth}`} />
      <div className="bm__result">{result}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Desktop Bracket                                                    */
/* ------------------------------------------------------------------ */
const DesktopBracket: React.FC<{ matches: MatchSummary[] }> = ({ matches }) => {
  const bracketRef = useRef<HTMLDivElement>(null);

  const matchMap = useMemo(() => {
    const map = new Map<number, MatchSummary>();
    matches.forEach(m => map.set(Number(m.id), m));
    return map;
  }, [matches]);

  // Helper to build a leaf (R32)
  const renderLeaf = (id: number) => (
    <MatchCard match={matchMap.get(id)} matchId={id} depth={0} />
  );

  // Helper to build a node (R16, QF, SF)
  const renderNode = (
    resultId: number,
    _topSourceId: number,
    _botSourceId: number,
    depth: number,
    isMirrored: boolean,
    renderTopSource: () => React.ReactNode,
    renderBotSource: () => React.ReactNode
  ) => (
    <BracketMerge
      isMirrored={isMirrored}
      connDepth={depth}
      result={<MatchCard match={matchMap.get(resultId)} matchId={resultId} depth={depth} />}
      topSource={renderTopSource()}
      bottomSource={renderBotSource()}
    />
  );

  // BUILD LEFT SIDE
  const leftSF = renderNode(LEFT_SF, 97, 98, 3, false,
    () => renderNode(97, 89, 90, 2, false,
      () => renderNode(89, 73, 75, 1, false, () => renderLeaf(73), () => renderLeaf(75)),
      () => renderNode(90, 74, 77, 1, false, () => renderLeaf(74), () => renderLeaf(77))
    ),
    () => renderNode(98, 93, 94, 2, false,
      () => renderNode(93, 83, 84, 1, false, () => renderLeaf(83), () => renderLeaf(84)),
      () => renderNode(94, 81, 82, 1, false, () => renderLeaf(81), () => renderLeaf(82))
    )
  );

  // BUILD RIGHT SIDE
  const rightSF = renderNode(RIGHT_SF, 99, 100, 3, true,
    () => renderNode(99, 91, 92, 2, true,
      () => renderNode(91, 76, 78, 1, true, () => renderLeaf(76), () => renderLeaf(78)),
      () => renderNode(92, 79, 80, 1, true, () => renderLeaf(79), () => renderLeaf(80))
    ),
    () => renderNode(100, 95, 96, 2, true,
      () => renderNode(95, 86, 88, 1, true, () => renderLeaf(86), () => renderLeaf(88)),
      () => renderNode(96, 85, 87, 1, true, () => renderLeaf(85), () => renderLeaf(87))
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="ko-bracket"
      ref={bracketRef}
    >
      <div className="ko-bracket__headers">
        <div className="ko-bh" style={{ width: 124 }}>Round of 32</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 132 }}>Round of 16</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 140 }}>Quarter-final</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 150 }}>Semi-final</div><div className="ko-bh-conn" />
        <div className="ko-bh ko-bh--center" style={{ width: 192 }}>FINAL</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 150 }}>Semi-final</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 140 }}>Quarter-final</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 132 }}>Round of 16</div><div className="ko-bh-conn" />
        <div className="ko-bh" style={{ width: 124 }}>Round of 32</div>
      </div>
      <div className="ko-bracket__canvas">
        {/* Left Side Tree */}
        <div className="bm">
          <div className="bm__sources">{leftSF}</div>
          <div className="ko-sf-conn" />
        </div>

        {/* Centerpiece: Final & 3rd Place */}
        <div className="ko-final-col">
          <div className="ko-final-spacer" />
          
          <div className="ko-final-main relative">
            {/* Absolute wrapper for Trophy and Champion block to prevent breaking vertical alignment */}
            <div className="absolute bottom-[calc(100%+32px)] flex flex-col items-center pointer-events-none w-max z-10">
              
              <div className="ko-final-badge !mb-6 pointer-events-auto">
                <Trophy size={20} strokeWidth={2.5} />
                <span>FIFA World Cup Final</span>
              </div>

              {/* World Champion Card */}
              <div className="flex flex-col items-center relative pointer-events-auto">
                <div className="absolute inset-0 bg-accent opacity-20 blur-xl rounded-full scale-150" />
                <div className="text-[0.55rem] font-black text-accent tracking-[0.3em] uppercase mb-2 relative z-10">World Champion 2026</div>
                <div className="flex items-center gap-3 bg-surface-elevated/90 border border-accent/40 rounded-xl px-6 py-3 shadow-[0_0_25px_rgba(0,183,255,0.15)] backdrop-blur-md relative z-10">
                  {(() => {
                    const finalMatch = matchMap.get(FINAL_ID);
                    const isComplete = finalMatch?.status === 'completed' || finalMatch?.status === 'finished';
                    let winner: { name: string; flagCode: string } | null = null;
                    if (isComplete && finalMatch?.homeScore != null && finalMatch?.awayScore != null) {
                      winner = finalMatch.homeScore > finalMatch.awayScore 
                        ? { name: finalMatch.homeTeam, flagCode: finalMatch.homeFlagCode! }
                        : { name: finalMatch.awayTeam, flagCode: finalMatch.awayFlagCode! };
                    }
                    
                    if (winner) {
                      return (
                        <>
                          <div className="w-8 h-6 rounded overflow-hidden shadow-sm"><Flag flagCode={winner.flagCode} size="md" /></div>
                          <span className="font-fifa-semi text-lg text-white tracking-widest uppercase">{winner.name}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="w-8 h-6 rounded border border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/40">?</span>
                        </div>
                        <span className="font-fifa-semi text-lg text-white/30 tracking-widest uppercase">TBD</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <MatchCard match={matchMap.get(FINAL_ID)} matchId={FINAL_ID} depth={4} />
          </div>

          <div className="ko-final-bottom">
            <span className="ko-third-label">3RD PLACE PLAYOFF</span>
            <MatchCard match={matchMap.get(THIRD_PLACE_ID)} matchId={THIRD_PLACE_ID} depth={1} />
            
            <div className="hidden md:flex flex-col items-center pointer-events-none mt-12">
              <h1 className="text-xl font-fifa-semi text-white tracking-[0.2em] uppercase whitespace-nowrap">Knockout Matches</h1>
              <div className="relative mt-2 w-[80%] flex justify-center">
                {/* Soft glow behind */}
                <div className="absolute inset-0 h-[3px] bg-gradient-to-r from-transparent via-accent/40 to-transparent blur-[3px]" />
                {/* Sharp crisp line */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-accent/90 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Tree */}
        <div className="bm bm--mirror">
          <div className="bm__sources">{rightSF}</div>
          <div className="ko-sf-conn" />
        </div>
      </div>
    </motion.div>
  );
};


/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */
export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches }) => {
  return (
    <div className="relative">
      {/* Mobile Title */}
      <div className="md:hidden px-4 py-[10px] text-center border-b border-white/5">
        <h1 className="text-[18px] font-fifa-semi font-black text-white tracking-tight uppercase">Knockout Matches</h1>
        <p className="text-[10px] font-bold text-accent tracking-widest mt-1 uppercase">FIFA World Cup 2026™</p>
      </div>

      <DesktopBracket matches={matches} />
    </div>
  );
};

KnockoutBracket.displayName = 'KnockoutBracket';
