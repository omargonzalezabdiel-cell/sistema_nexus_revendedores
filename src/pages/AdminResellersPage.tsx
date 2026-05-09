import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard } from '../components/ui';
import {
  Users, TrendingUp, Award, DollarSign, ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, UserRow } from '../services/userService';
import { analyticsService, ResellerStatsData } from '../services/analytics';

const LEVEL_OPTIONS = ['basic', 'pro', 'micro_brand', 'distributor'];

const LEVEL_LABELS: Record<string, string> = {
  basic: 'Basic',
  pro: 'Pro',
  micro_brand: 'Micro Brand',
  distributor: 'Distributor',
};

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-gray-500/20 text-gray-300',
  pro: 'bg-blue-500/20 text-blue-300',
  micro_brand: 'bg-nexus-gold/20 text-nexus-gold',
  distributor: 'bg-purple-500/20 text-purple-300',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface ResellerWithStats extends UserRow {
  stats?: ResellerStatsData;
}

export const AdminResellersPage: React.FC = () => {
  const { loading } = useData();
  const [resellers, setResellers] = useState<ResellerWithStats[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changingLevel, setChangingLevel] = useState<string | null>(null);

  const loadResellers = useCallback(async () => {
    try {
      const data = await userService.getAllResellers();
      const withStats: ResellerWithStats[] = await Promise.all(
        data.map(async (r) => {
          try {
            const stats = await analyticsService.getResellerStats(r.id);
            return { ...r, stats };
          } catch {
            return { ...r };
          }
        })
      );
      setResellers(withStats.sort((a, b) => (b.stats?.totalEarnings || 0) - (a.stats?.totalEarnings || 0)));
    } catch (err) {
      console.error('Error loading resellers:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResellers();
  }, [loadResellers]);

  const handleChangeLevel = async (userId: string, level: string) => {
    setChangingLevel(userId);
    try {
      await userService.changeLevel(userId, level);
      setResellers((prev) =>
        prev.map((r) => (r.id === userId ? { ...r, level } : r))
      );
    } catch (err) {
      console.error('Error changing level:', err);
    }
    setChangingLevel(null);
  };

  const totalSales = resellers.reduce((sum, r) => sum + (r.stats?.totalSales || 0), 0);
  const totalEarnings = resellers.reduce((sum, r) => sum + (r.stats?.totalEarnings || 0), 0);
  const proCount = resellers.filter((r) =>
    ['pro', 'micro_brand', 'distributor'].includes(r.level)
  ).length;

  if (loading || pageLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-3">
                <div className="h-4 bg-white/[0.06] rounded w-1/2" />
                <div className="h-8 bg-white/[0.06] rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Revendedores</h1>
          <p className="text-gray-400">{resellers.length} revendedores registrados</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="Total Revendedores"
              value={resellers.length}
              icon={<Users className="w-6 h-6 text-nexus-gold" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ventas Totales"
              value={totalSales}
              icon={<TrendingUp className="w-6 h-6 text-nexus-accent" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ingresos Generados"
              value={`$${totalEarnings.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6 text-green-400" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Nivel Pro+"
              value={proCount}
              icon={<Award className="w-6 h-6 text-nexus-gold" />}
              subtext="Avanzados"
            />
          </motion.div>
        </motion.div>

        {/* Resellers Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6">Tabla de Revendedores</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.1]">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Revendedor</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Nivel</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Ventas</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Ganancia Total</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Ganancia Mes</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-semibold">Estado</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resellers.map((reseller, index) => (
                    <React.Fragment key={reseller.id}>
                      <tr
                        className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === reseller.id ? null : reseller.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-nexus-gold/10 flex items-center justify-center border border-nexus-gold/20">
                              <span className="text-xs font-bold text-nexus-gold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {reseller.company_name || `${reseller.first_name} ${reseller.last_name}`}
                              </p>
                              <p className="text-xs text-gray-500">{reseller.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${LEVEL_COLORS[reseller.level] || LEVEL_COLORS.basic}`}>
                            {LEVEL_LABELS[reseller.level] || reseller.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-white font-semibold">{reseller.stats?.totalSales || 0}</td>
                        <td className="py-3 px-4 text-right text-nexus-gold font-bold">${(reseller.stats?.totalEarnings || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-semibold">${(reseller.stats?.monthlyEarnings || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          {!reseller.approved ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Pendiente</span>
                          ) : reseller.blocked ? (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/20 text-red-300">Bloqueado</span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-300">Activo</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {expandedId === reseller.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400 inline" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 inline" />
                          )}
                        </td>
                      </tr>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedId === reseller.id && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 bg-white/[0.01] border-t border-white/[0.05] space-y-5">
                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] text-center">
                                      <p className="text-xs text-gray-500 mb-1">Nivel</p>
                                      <p className="text-lg font-bold text-white">{LEVEL_LABELS[reseller.level] || reseller.level}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] text-center">
                                      <p className="text-xs text-gray-500 mb-1">XP</p>
                                      <p className="text-lg font-bold text-nexus-accent">{reseller.stats?.xp || reseller.xp || 0}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] text-center">
                                      <p className="text-xs text-gray-500 mb-1">Meta Mensual</p>
                                      <p className="text-lg font-bold text-white">${(reseller.stats?.monthlyGoal || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05] text-center">
                                      <p className="text-xs text-gray-500 mb-1">Progreso</p>
                                      <p className="text-lg font-bold text-nexus-gold">{reseller.stats?.monthlyProgress?.toLocaleString() || 0}%</p>
                                    </div>
                                  </div>

                                  {/* Level Change */}
                                  <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                                    <p className="text-xs text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                      <Award className="w-4 h-4 text-nexus-gold" />
                                      Cambiar Nivel
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {LEVEL_OPTIONS.map((level) => (
                                        <button
                                          key={level}
                                          onClick={() => handleChangeLevel(reseller.id, level)}
                                          disabled={changingLevel === reseller.id}
                                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                                            reseller.level === level
                                              ? 'bg-nexus-gold text-black'
                                              : `${LEVEL_COLORS[level]} hover:scale-105`
                                          } ${changingLevel === reseller.id ? 'opacity-50' : ''}`}
                                        >
                                          {LEVEL_LABELS[level]}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Contact */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Email</p>
                                      <p className="text-gray-300">{reseller.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Telefono</p>
                                      <p className="text-gray-300">{reseller.phone || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Provincia</p>
                                      <p className="text-gray-300">{reseller.province || '-'}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {resellers.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay revendedores registrados</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
