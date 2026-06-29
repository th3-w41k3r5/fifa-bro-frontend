'use client';

import React from 'react';
import { ThirdPlaceRankingsPayload } from '@/types';
import { Award, Info } from 'lucide-react';
import { TeamLogo, SectionTitle } from '@/components';
import { motion } from 'framer-motion';

interface BestThirdPlacedProps {
  data: ThirdPlaceRankingsPayload | null;
}

export const BestThirdPlaced: React.FC<BestThirdPlacedProps> = ({ data }) => {
  if (!data) return null;

  const allTeams = [...data.qualified, ...data.eliminated];

  if (allTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[26px] border border-white/[0.07] bg-[#080b10] py-16 text-center">
        <Award size={48} className="text-white/20 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Third-Placed Teams Yet</h3>
        <p className="text-sm text-text-secondary">Rankings will appear as the group stage progresses.</p>
      </div>
    );
  }

  const formattedDate = new Date(data.updatedAt).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata', // IST timezone
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className="flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <SectionTitle
          title="Best Third-Placed Teams"
          subtitle="Top 8 qualify for the Round of 32"
          icon={<Award size={24} />}
        />
        <div className="flex flex-col items-end gap-3">
          <div className="text-sm font-semibold text-accent/80 tracking-wider">
            Last Updated: {formattedDate} IST
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface to-surface-elevated/30 backdrop-blur-xl shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_40px_40px_40px] md:grid-cols-[50px_1fr_50px_40px_40px_40px_40px_40px_40px_50px_50px_50px] gap-2 border-b border-white/[0.08] px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] text-text-secondary bg-black/50 relative z-10">
          <span className="text-center">Rank</span>
          <span>Team</span>
          <span className="text-center">Grp</span>
          
          {/* Extended Stats (PC Only) */}
          <span className="text-center hidden md:block">P</span>
          <span className="text-center hidden md:block">W</span>
          <span className="text-center hidden md:block">D</span>
          <span className="text-center hidden md:block">L</span>
          <span className="text-center hidden md:block">GF</span>
          <span className="text-center hidden md:block">GA</span>
          <span className="text-center hidden md:block" title="Conduct Score">TCS</span>

          {/* Core Stats */}
          <span className="text-center">GD</span>
          <span className="text-right">Pts</span>
        </div>

        <div className="flex flex-col relative z-10">
          {allTeams.map((team, index) => {
            const isQualified = index < 8;
            const isNinth = index === 8;

            let rowClasses = "grid grid-cols-[40px_1fr_40px_40px_40px] md:grid-cols-[50px_1fr_50px_40px_40px_40px_40px_40px_40px_50px_50px_50px] gap-2 items-center px-4 py-3 border-b border-white/[0.04] transition-all hover:bg-white/[0.05] group";
            
            if (isQualified) {
              rowClasses += " border-l-4 border-l-emerald-500/80 bg-emerald-500/[0.02]";
            } else {
              rowClasses += " border-l-4 border-l-red-500/80 bg-red-500/[0.02]";
            }

            return (
              <React.Fragment key={team.teamCode}>
                {isNinth && (
                  <div className="bg-red-500/10 text-red-500/80 text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 border-y border-red-500/20 shadow-inner">
                    Qualification Cutoff
                  </div>
                )}
                <motion.div variants={itemVariants} className={rowClasses}>
                  <span className="text-center font-black text-sm md:text-base text-text-primary group-hover:text-accent transition-colors">{team.rank}</span>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo flagCode={team.teamCode} teamName={team.teamName} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm md:text-base text-text-primary truncate">{team.teamName}</span>
                      {(isQualified || team.qualificationStatus?.includes('Qualified')) && (team.played || 0) < 3 && (
                        <span className="inline-block mt-0.5 rounded bg-yellow-400/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-400/20 w-fit">
                          Provisional
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-center font-bold text-xs md:text-sm text-text-secondary">{team.groupCode}</span>
                  
                  {/* Extended Stats (PC Only) */}
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.played ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.wins ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.draws ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.losses ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.goalsFor ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.goalsAgainst ?? '-'}</span>
                  <span className="text-center font-medium text-xs md:text-sm text-text-secondary hidden md:block">{team.conductScore ?? '-'}</span>

                  {/* Core Stats */}
                  <span className="text-center font-bold text-xs md:text-sm text-text-primary">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</span>
                  <span className="text-right font-black text-sm md:text-base text-text-primary">{team.points}</span>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Legend below table on the left */}
      <div className="flex items-center gap-6 mt-4 text-xs font-bold text-text-secondary tracking-widest uppercase pl-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span>Qualified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          <span>Eliminated</span>
        </div>
        
        {/* Info for extended stats */}
        <div className="hidden md:flex items-center gap-2 ml-auto opacity-70">
          <Info size={14} />
          <span>Tie-breakers: Pts, GD, GF, TCS</span>
        </div>
      </div>
    </motion.div>
  );
};
