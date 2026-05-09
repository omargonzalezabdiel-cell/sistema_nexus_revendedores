import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { StatCard, GlassCard } from '../components/ui';
import { Award, Zap, Trophy, Star, Flame, Crown, Shield, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

const LEVEL_CONFIG: Record<string, { name: string; minSales: number; maxSales: number; icon: React.ReactNode; color: string; bgColor: string }> = {
  basic: { name: 'Basico', minSales: 1, maxSales: 14, icon: <Shield className="w-8 h-8" />, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  pro: { name: 'Pro', minSales: 15, maxSales: 49, icon: <Star className="w-8 h-8" />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  micro_brand: { name: 'Micro Marca', minSales: 50, maxSales: 99, icon: <Crown className="w-8 h-8" />, color: 'text-nexus-gold', bgColor: 'bg-nexus-gold/20' },
  distributor: { name: 'Distribuidor', minSales: 100, maxSales: Infinity, icon: <Gem className="w-8 h-8" />, color: 'text-nexus-accent', bgColor: 'bg-nexus-accent/20' },
};

const LEVEL_ORDER = ['basic', 'pro', 'micro_brand', 'distributor'];

const ACHIEVEMENTS = [
  { id: 1, name: 'Primer Pedido', description: 'Crea tu primer pedido', icon: <Zap className="w-6 h-6" />, checkKey: 'salesCount', threshold: 1 },
  { id: 2, name: 'Pro Alcanzado', description: 'Completa 15 ventas', icon: <Star className="w-6 h-6" />, checkKey: 'salesCount', threshold: 15 },
  { id: 3, name: 'Micro Marca', description: 'Alcanza 50 ventas', icon: <Crown className="w-6 h-6" />, checkKey: 'salesCount', threshold: 50 },
  { id: 4, name: 'Distribuidor Elite', description: 'Alcanza 100 ventas', icon: <Gem className="w-6 h-6" />, checkKey: 'salesCount', threshold: 100 },
  { id: 5, name: 'Mes Oro', description: 'Gana $5,000 en un mes', icon: <Trophy className="w-6 h-6" />, checkKey: 'monthlyEarnings', threshold: 5000 },
  { id: 6, name: 'Racha Fuego', description: 'Mantente activo', icon: <Flame className="w-6 h-6" />, checkKey: 'salesCount', threshold: 5 },
];

const LEVEL_BENEFITS: Record<string, { title: string; description: string }[]> = {
  basic: [
    { title: 'Comision Base', description: 'Margen de reseller estandar en cada pedido' },
    { title: 'Panel Basico', description: 'Acceso al dashboard de pedidos y ganancias' },
    { title: 'Soporte', description: 'Soporte por WhatsApp en horario laboral' },
  ],
  pro: [
    { title: 'Comision Mejorada', description: 'Margen mejorado por nivel Pro' },
    { title: 'Panel Avanzado', description: 'Analiticas detalladas y reportes' },
    { title: 'Soporte Prioritario', description: 'Atencion prioritaria las 24 horas' },
    { title: 'Bono de Referencia', description: '5% adicional por cada referido' },
  ],
  micro_brand: [
    { title: 'Comision Premium', description: 'El mejor margen de ganancia' },
    { title: 'Acceso Premium', description: 'Panel de analiticas avanzadas completo' },
    { title: 'Soporte VIP', description: 'Atencion dedicada con gerente de cuenta' },
    { title: 'Productos Exclusivos', description: 'Acceso a productos y lanzamientos exclusivos' },
    { title: 'Descuento Produccion', description: 'Costos de produccion reducidos' },
  ],
  distributor: [
    { title: 'Comision Maxima', description: 'Margen maximo de ganancia' },
    { title: 'Todo Premium', description: 'Acceso completo a todas las herramientas' },
    { title: 'Gerente Dedicado', description: 'Atencion exclusiva y personalizada' },
    { title: 'Productos Exclusivos', description: 'Acceso prioritario a nuevos productos' },
    { title: 'Descuento Produccion', description: 'Los mejores costos de produccion' },
    { title: 'Programa de Referidos', description: 'Comisiones por referidos activos' },
  ],
};

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-white/[0.05] rounded w-3/4 mb-2" />
    <div className="h-8 bg-white/[0.05] rounded w-1/2 mb-2" />
    <div className="h-3 bg-white/[0.05] rounded w-2/3" />
  </div>
);

export const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const { resellerStats, loading } = useData();

  const currentLevel = resellerStats?.currentLevel || user?.level || 'basic';
  const levelInfo = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG.basic;
  const salesCount = resellerStats?.salesCount || user?.sales_count || 0;

  // Find next level
  const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);
  const nextLevelKey = currentLevelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[currentLevelIndex + 1] : null;
  const nextLevel = nextLevelKey ? LEVEL_CONFIG[nextLevelKey] : null;

  const progressToNextLevel = nextLevel
    ? Math.min(Math.round((salesCount / nextLevel.minSales) * 100), 100)
    : 100;

  const unlockedAchievements = ACHIEVEMENTS.filter(a => {
    const value = a.checkKey === 'salesCount' ? salesCount
      : a.checkKey === 'monthlyEarnings' ? (resellerStats?.monthlyEarnings || 0)
      : 0;
    return value >= a.threshold;
  }).length;

  // Streak calculation based on recent orders
  const streak = salesCount > 0 ? Math.min(salesCount, 30) : 0;

  const benefits = LEVEL_BENEFITS[currentLevel] || LEVEL_BENEFITS.basic;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Nivel y Recompensas</h1>
          <p className="text-gray-400">Progresa y desbloquea logros exclusivos</p>
        </motion.div>

        {/* Current Level Card */}
        {loading ? (
          <GlassCard><Skeleton /></GlassCard>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${levelInfo.bgColor} border border-white/[0.1]`}>
                    <div className={levelInfo.color}>{levelInfo.icon}</div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{levelInfo.name}</h2>
                    <p className={`text-sm font-medium ${levelInfo.color}`}>Nivel Actual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-nexus-gold">{salesCount}</p>
                  <p className="text-gray-400 text-sm">Ventas Totales</p>
                </div>
              </div>

              {/* Progress to next level */}
              {nextLevel && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-300">
                      Progreso hacia <span className={nextLevel.color}>{nextLevel.name}</span>
                    </p>
                    <p className="text-sm font-semibold text-nexus-gold">{progressToNextLevel}%</p>
                  </div>
                  <div className="w-full h-3 bg-white/[0.1] rounded-full overflow-hidden border border-white/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNextLevel}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-nexus-gold to-nexus-gold-light"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {nextLevel.minSales - salesCount > 0
                      ? `${nextLevel.minSales - salesCount} ventas mas para alcanzar ${nextLevel.name}`
                      : `${nextLevel.name} alcanzado!`
                    }
                  </p>
                </div>
              )}

              {!nextLevel && (
                <div className="p-4 bg-nexus-gold/10 border border-nexus-gold/20 rounded-lg">
                  <p className="text-sm font-medium text-nexus-gold">Has alcanzado el nivel maximo!</p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="XP Acumulado"
              value={resellerStats?.xp || user?.xp || 0}
              icon={<Zap className="w-6 h-6 text-nexus-accent" />}
            />
          </motion.div>

          <motion.div variants={item}>
            <StatCard
              label="Racha Actual"
              value={streak}
              icon={<Flame className="w-6 h-6 text-orange-400" />}
              subtext="Actividad reciente"
            />
          </motion.div>

          <motion.div variants={item}>
            <StatCard
              label="Logros Desbloqueados"
              value={unlockedAchievements}
              icon={<Trophy className="w-6 h-6 text-nexus-gold" />}
              subtext={`de ${ACHIEVEMENTS.length}`}
            />
          </motion.div>
        </motion.div>

        {/* Level Thresholds */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-nexus-gold" />
              Umbrales de Nivel
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LEVEL_ORDER.map((key) => {
                const config = LEVEL_CONFIG[key];
                const isCurrent = key === currentLevel;
                const isAchieved = salesCount >= config.minSales;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      isCurrent
                        ? 'border-nexus-gold bg-nexus-gold/10 shadow-glow'
                        : isAchieved
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-white/[0.1] bg-white/[0.02] opacity-60'
                    }`}
                  >
                    <div className={`mx-auto mb-3 ${isCurrent ? config.color : isAchieved ? 'text-green-400' : 'text-gray-500'}`}>
                      {config.icon}
                    </div>
                    <p className="font-semibold text-white text-sm">{config.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{config.minSales}+ ventas</p>
                    {isCurrent && (
                      <span className="inline-block mt-2 text-xs font-semibold text-nexus-gold px-2 py-0.5 bg-nexus-gold/20 rounded">Actual</span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-bold text-white mb-4">Logros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement, index) => {
              const value = achievement.checkKey === 'salesCount' ? salesCount
                : achievement.checkKey === 'monthlyEarnings' ? (resellerStats?.monthlyEarnings || 0)
                : 0;
              const unlocked = value >= achievement.threshold;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`
                    p-6 rounded-xl border-2 transition-all
                    ${unlocked
                      ? 'bg-white/[0.05] border-nexus-gold/30 shadow-glow'
                      : 'bg-white/[0.02] border-white/[0.1] opacity-60'
                    }
                  `}
                >
                  <div className={`mb-3 ${unlocked ? 'text-nexus-gold' : 'text-gray-500'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{achievement.name}</h3>
                  <p className={`text-sm ${unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  {unlocked ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-nexus-gold font-semibold">
                      <Award className="w-3 h-3" />
                      Desbloqueado
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-nexus-gold/50 rounded-full"
                          style={{ width: `${Math.min((value / achievement.threshold) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{value}/{achievement.threshold}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-nexus-gold" />
              Beneficios de tu Nivel
            </h3>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                  <div className="w-8 h-8 rounded-lg bg-nexus-gold/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-nexus-gold font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{benefit.title}</p>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
