import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard } from '../components/ui';
import { Trophy, Medal, Crown, Gem, Shield, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analytics';

interface RankingEntry {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  level: string;
  sales_count: number;
  xp: number;
  rank: number;
}

const LEVEL_CONFIG: Record<string, { name: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  basic: { name: 'Basico', icon: <Shield className="w-4 h-4" />, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  pro: { name: 'Pro', icon: <Star className="w-4 h-4" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  micro_brand: { name: 'Micro Marca', icon: <Crown className="w-4 h-4" />, color: 'text-nexus-gold', bgColor: 'bg-nexus-gold/20' },
  distributor: { name: 'Distribuidor', icon: <Gem className="w-4 h-4" />, color: 'text-nexus-accent', bgColor: 'bg-nexus-accent/20' },
};

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Trophy className="w-6 h-6 text-yellow-400" />,
  2: <Medal className="w-6 h-6 text-gray-300" />,
  3: <Medal className="w-6 h-6 text-amber-600" />,
};

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-16 bg-white/[0.05] rounded-lg" />
    ))}
  </div>
);

export const ResellerRankingPage: React.FC = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await analyticsService.getRanking();
        setRanking(data as RankingEntry[]);
      } catch (err) {
        console.error('Error fetching ranking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const currentUserRank = ranking.find(r => r.id === user?.id);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Ranking de Resellers</h1>
          <p className="text-gray-400">Los mejores resellers de la plataforma NEXUS</p>
        </motion.div>

        {/* Current User Position */}
        {currentUserRank && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="border-nexus-gold/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-nexus-gold/20 flex items-center justify-center border-2 border-nexus-gold">
                    <span className="text-2xl font-bold text-nexus-gold">#{currentUserRank.rank}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tu Posicion</p>
                    <p className="text-xl font-bold text-white">{currentUserRank.company_name || `${currentUserRank.first_name} ${currentUserRank.last_name}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${(LEVEL_CONFIG[currentUserRank.level] || LEVEL_CONFIG.basic).bgColor} ${(LEVEL_CONFIG[currentUserRank.level] || LEVEL_CONFIG.basic).color}`}>
                        {(LEVEL_CONFIG[currentUserRank.level] || LEVEL_CONFIG.basic).name}
                      </span>
                      <span className="text-xs text-gray-400">{currentUserRank.sales_count} ventas</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">XP</p>
                  <p className="text-2xl font-bold text-nexus-accent">{currentUserRank.xp}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {!loading && ranking.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center border-2 border-gray-400 mb-3">
                  <span className="text-xl font-bold text-gray-300">2</span>
                </div>
                <p className="text-white font-semibold text-sm text-center truncate w-full">
                  {ranking[1]?.company_name || `${ranking[1]?.first_name} ${ranking[1]?.last_name}`}
                </p>
                <p className="text-gray-400 text-xs mt-1">{ranking[1]?.sales_count} ventas</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 ${(LEVEL_CONFIG[ranking[1]?.level] || LEVEL_CONFIG.basic).bgColor} ${(LEVEL_CONFIG[ranking[1]?.level] || LEVEL_CONFIG.basic).color}`}>
                  {(LEVEL_CONFIG[ranking[1]?.level] || LEVEL_CONFIG.basic).name}
                </span>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-nexus-gold/20 flex items-center justify-center border-2 border-nexus-gold mb-3 shadow-glow">
                  <Trophy className="w-8 h-8 text-nexus-gold" />
                </div>
                <p className="text-white font-bold text-center truncate w-full">
                  {ranking[0]?.company_name || `${ranking[0]?.first_name} ${ranking[0]?.last_name}`}
                </p>
                <p className="text-nexus-gold text-sm mt-1">{ranking[0]?.sales_count} ventas</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 ${(LEVEL_CONFIG[ranking[0]?.level] || LEVEL_CONFIG.basic).bgColor} ${(LEVEL_CONFIG[ranking[0]?.level] || LEVEL_CONFIG.basic).color}`}>
                  {(LEVEL_CONFIG[ranking[0]?.level] || LEVEL_CONFIG.basic).name}
                </span>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-14 h-14 rounded-full bg-amber-700/20 flex items-center justify-center border-2 border-amber-600 mb-3">
                  <span className="text-lg font-bold text-amber-500">3</span>
                </div>
                <p className="text-white font-semibold text-sm text-center truncate w-full">
                  {ranking[2]?.company_name || `${ranking[2]?.first_name} ${ranking[2]?.last_name}`}
                </p>
                <p className="text-gray-400 text-xs mt-1">{ranking[2]?.sales_count} ventas</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 ${(LEVEL_CONFIG[ranking[2]?.level] || LEVEL_CONFIG.basic).bgColor} ${(LEVEL_CONFIG[ranking[2]?.level] || LEVEL_CONFIG.basic).color}`}>
                  {(LEVEL_CONFIG[ranking[2]?.level] || LEVEL_CONFIG.basic).name}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-nexus-gold" />
              Tabla de Lideres
            </h3>
            {loading ? (
              <Skeleton />
            ) : ranking.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                {ranking.map((entry) => {
                  const isCurrentUser = entry.id === user?.id;
                  const levelConfig = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG.basic;
                  return (
                    <motion.div
                      key={entry.id}
                      variants={item}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                        isCurrentUser
                          ? 'bg-nexus-gold/10 border border-nexus-gold/30'
                          : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-10 flex-shrink-0 text-center">
                        {RANK_ICONS[entry.rank] || (
                          <span className="text-lg font-bold text-gray-500">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {entry.company_name || `${entry.first_name} ${entry.last_name}`}
                          {isCurrentUser && <span className="text-nexus-gold text-xs ml-2">(Tu)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${levelConfig.bgColor} ${levelConfig.color}`}>
                            {levelConfig.icon}
                            {levelConfig.name}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{entry.sales_count}</p>
                          <p className="text-xs text-gray-500">Ventas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-nexus-accent">{entry.xp}</p>
                          <p className="text-xs text-gray-500">XP</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No hay datos de ranking disponibles</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
