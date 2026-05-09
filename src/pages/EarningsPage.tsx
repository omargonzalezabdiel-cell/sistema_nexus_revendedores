import React from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { StatCard, GlassCard } from '../components/ui';
import { DollarSign, TrendingUp, Calendar, PieChart as PieChartIcon, Clock } from 'lucide-react';
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#d4af37', '#00d4ff', '#c0c0c0', '#e8c547', '#00b3a6', '#ff6b6b', '#845ef7'];

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-white/[0.05] rounded w-3/4 mb-2" />
    <div className="h-8 bg-white/[0.05] rounded w-1/2 mb-2" />
    <div className="h-3 bg-white/[0.05] rounded w-2/3" />
  </div>
);

export const EarningsPage: React.FC = () => {
  const { orders, resellerStats, loading } = useData();

  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
  const totalEarnings = resellerStats?.totalEarnings || nonCancelledOrders.reduce((sum, o) => sum + Number(o.reseller_profit), 0);
  const monthlyEarnings = resellerStats?.monthlyEarnings || 0;
  const avgPerOrder = nonCancelledOrders.length > 0
    ? totalEarnings / nonCancelledOrders.length
    : 0;
  const pendingPayments = orders
    .filter(o => ['pending', 'confirmed', 'production'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.reseller_profit), 0);

  // Daily earnings for chart
  const dailyEarnings = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const earnings = nonCancelledOrders
      .filter(o => o.created_at.split('T')[0] === dateStr)
      .reduce((sum, o) => sum + Number(o.reseller_profit), 0);
    return {
      date: date.toLocaleDateString('es-PA', { month: 'short', day: 'numeric' }),
      earnings,
    };
  });

  // Product breakdown
  const earningsByProduct = Array.from(
    nonCancelledOrders.reduce((map, order) => {
      const key = order.product_type || order.product_name || 'Otro';
      const existing = map.get(key) || { name: key, value: 0, count: 0 };
      existing.value += Number(order.reseller_profit);
      existing.count += 1;
      return map.set(key, existing);
    }, new Map<string, { name: string; value: number; count: number }>())
  ).map(([_, data]) => data);

  // Earnings history table
  const earningsHistory = nonCancelledOrders
    .map(o => ({
      id: o.order_number,
      customer: o.customer_name,
      product: o.product_name,
      date: o.created_at,
      earnings: Number(o.reseller_profit),
      status: o.status,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-gray-400',
    confirmed: 'text-blue-400',
    production: 'text-yellow-400',
    shipped: 'text-cyan-400',
    delivered: 'text-green-400',
    cancelled: 'text-red-400',
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Mis Ganancias</h1>
          <p className="text-gray-400">Resumen financiero y analisis de ingresos</p>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <GlassCard key={i}><Skeleton /></GlassCard>
            ))}
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={item}>
              <StatCard
                label="Ganancias Totales"
                value={`$${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign className="w-6 h-6 text-nexus-gold" />}
                subtext={`${nonCancelledOrders.length} pedidos completados`}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Ganancias Este Mes"
                value={`$${monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<Calendar className="w-6 h-6 text-nexus-accent" />}
                subtext={new Date().toLocaleDateString('es-PA', { month: 'long', year: 'numeric' })}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Promedio por Pedido"
                value={`$${Math.round(avgPerOrder).toLocaleString()}`}
                icon={<TrendingUp className="w-6 h-6 text-green-400" />}
                subtext="Ingreso promedio"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Pagos Pendientes"
                value={`$${pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<Clock className="w-6 h-6 text-orange-400" />}
                subtext="En proceso"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Earnings Line Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-nexus-gold" />
                Ganancias Mensuales
              </h3>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-full h-[250px] bg-white/[0.03] rounded" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 8, 18, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ganancias']}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#d4af37"
                      dot={false}
                      strokeWidth={2}
                      name="Ganancias"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>

          {/* Product Breakdown Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-nexus-accent" />
                Por Producto
              </h3>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-full h-[250px] bg-white/[0.03] rounded" />
                </div>
              ) : earningsByProduct.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie data={earningsByProduct} cx="50%" cy="50%" innerRadius={40} outerRadius={100} dataKey="value">
                      {earningsByProduct.map((_e, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 8, 18, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ganancias']}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">Sin datos</div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Earnings History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-nexus-gold" />
              Historial de Ganancias
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} />)}
              </div>
            ) : earningsHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Pedido</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium">Cliente</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium hidden md:table-cell">Producto</th>
                      <th className="text-left py-3 px-3 text-gray-400 font-medium hidden lg:table-cell">Fecha</th>
                      <th className="text-right py-3 px-3 text-gray-400 font-medium">Ganancia</th>
                      <th className="text-center py-3 px-3 text-gray-400 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-3 text-white font-mono text-xs">{entry.id}</td>
                        <td className="py-3 px-3 text-gray-300">{entry.customer}</td>
                        <td className="py-3 px-3 text-gray-300 hidden md:table-cell truncate max-w-[150px]">{entry.product}</td>
                        <td className="py-3 px-3 text-gray-400 hidden lg:table-cell">
                          {new Date(entry.date).toLocaleDateString('es-PA', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-3 text-right text-nexus-gold font-semibold">${entry.earnings.toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs font-semibold ${STATUS_COLORS[entry.status] || 'text-gray-400'}`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Sin historial de ganancias</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
