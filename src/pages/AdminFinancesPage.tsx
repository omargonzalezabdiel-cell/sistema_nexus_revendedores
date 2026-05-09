import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard } from '../components/ui';
import {
  DollarSign, TrendingUp, PieChart as PieIcon,
  BarChart3, Percent
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analytics';

const COST_BREAKDOWN_COLORS = ['#d4af37', '#00d4ff', '#a855f7', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const chartTooltipStyle = {
  backgroundColor: 'rgba(10, 14, 39, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
};

export const AdminFinancesPage: React.FC = () => {
  const { orders, costs, loading } = useData();

  const [metrics, setMetrics] = useState<{
    totalRevenue: number;
    totalNexusProfit: number;
    totalResellerProfit: number;
    activeOrders: number;
    totalOrders: number;
    resellerCount: number;
  } | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<
    { date: string; total_revenue: number; total_nexus_profit: number; total_reseller_profit: number }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, d] = await Promise.all([
          analyticsService.getAdminMetrics(),
          analyticsService.getDailyMetrics(30),
        ]);
        setMetrics(m);
        setDailyMetrics(d);
      } catch (err) {
        console.error('Error loading finance data:', err);
      }
    };
    load();
  }, []);

  // Derived financial data
  const totalProductionCosts = orders.reduce((sum, o) => sum + Number(o.production_cost), 0);
  const totalShippingCosts = orders.reduce((sum, o) => sum + Number(o.shipping_cost), 0);
  const totalCommission = orders.reduce((sum, o) => sum + Number(o.platform_commission), 0);
  const totalRevenue = metrics?.totalRevenue || 0;
  const totalNexusProfit = metrics?.totalNexusProfit || 0;
  const totalResellerProfit = metrics?.totalResellerProfit || 0;
  const netMargin = totalRevenue > 0 ? ((totalNexusProfit / totalRevenue) * 100) : 0;

  // Cost breakdown for pie chart
  const costBreakdown = costs
    ? [
        { name: 'Material', value: Number(costs.material_cost) || 0 },
        { name: 'Tinta', value: Number(costs.ink_cost) || 0 },
        { name: 'Papel', value: Number(costs.paper_cost) || 0 },
        { name: 'Electricidad', value: Number(costs.electricity_cost) || 0 },
        { name: 'Mano de Obra', value: Number(costs.labor_cost) || 0 },
        { name: 'Empaque', value: Number(costs.packaging_cost) || 0 },
        { name: 'Envio', value: Number(costs.shipping_cost) || 0 },
        { name: 'Mantenimiento', value: Number(costs.maintenance_cost) || 0 },
      ].filter((c) => c.value > 0)
    : [];

  // Monthly chart data
  const chartData = dailyMetrics.map((d) => ({
    date: d.date.slice(5),
    revenue: Number(d.total_revenue),
    nexus: Number(d.total_nexus_profit),
    reseller: Number(d.total_reseller_profit),
  }));

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-3">
                <div className="h-4 bg-white/[0.06] rounded w-1/2" />
                <div className="h-8 bg-white/[0.06] rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="h-80 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Panel Financiero</h1>
          <p className="text-gray-400">Resumen de ingresos, costos y margenes</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={item}>
            <StatCard
              label="Ingresos Totales"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6 text-nexus-gold" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ganancia NEXUS"
              value={`$${totalNexusProfit.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6 text-nexus-accent" />}
              subtext={`Margen: ${netMargin.toFixed(1)}%`}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Ganancia Revendedores"
              value={`$${totalResellerProfit.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Comisiones"
              value={`$${totalCommission.toLocaleString()}`}
              icon={<Percent className="w-6 h-6 text-purple-400" />}
              subtext={`Costo Prod: $${totalProductionCosts.toLocaleString()}`}
            />
          </motion.div>
        </motion.div>

        {/* Financial Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Ingresos y Ganancias (30 dias)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#d4af37" dot={false} strokeWidth={2} name="Ingresos" />
                <Line type="monotone" dataKey="nexus" stroke="#00d4ff" dot={false} strokeWidth={2} name="Ganancia NEXUS" />
                <Line type="monotone" dataKey="reseller" stroke="#10b981" dot={false} strokeWidth={2} name="Ganancia Rev." />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Cost Breakdown + Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown Pie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-nexus-gold" />
                Desglose de Costos Unitarios
              </h3>
              {costBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {costBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COST_BREAKDOWN_COLORS[index % COST_BREAKDOWN_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <PieIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Sin datos de costos</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Financial Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-nexus-accent" />
                Resumen Financiero
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Ingresos Totales', value: totalRevenue, color: 'text-nexus-gold' },
                  { label: 'Costo Total Produccion', value: totalProductionCosts, color: 'text-red-400' },
                  { label: 'Costo Total Envios', value: totalShippingCosts, color: 'text-red-400' },
                  { label: 'Comisiones Plataforma', value: totalCommission, color: 'text-purple-400' },
                  { label: 'Ganancia Revendedores', value: totalResellerProfit, color: 'text-green-400' },
                  { label: 'Ganancia NEXUS', value: totalNexusProfit, color: 'text-nexus-accent' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                    <p className="text-gray-400">{row.label}</p>
                    <p className={`font-bold ${row.color}`}>${row.value.toLocaleString()}</p>
                  </div>
                ))}

                {/* Margins */}
                {costs && (
                  <div className="pt-4 mt-4 border-t border-white/[0.05] space-y-3">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Margenes Actuales</p>
                    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <p className="text-gray-400">Margen Revendedor</p>
                      <p className="font-bold text-nexus-gold">{(Number(costs.reseller_margin) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <p className="text-gray-400">Margen NEXUS</p>
                      <p className="font-bold text-nexus-accent">{(Number(costs.nexus_margin) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <p className="text-gray-400">Comision Plataforma</p>
                      <p className="font-bold text-purple-400">{(Number(costs.platform_commission) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};
