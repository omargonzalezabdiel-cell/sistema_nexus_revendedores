import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, StatCard } from '../components/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, ThumbsUp, BarChart3, Lightbulb, Package } from 'lucide-react';
import { analyticsService } from '../services/analytics';

const COLORS = ['#d4af37', '#00d4ff', '#c0c0c0', '#e8c547', '#00b3a6', '#ff6b6b'];

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-white/[0.05] rounded w-3/4 mb-2" />
    <div className="h-8 bg-white/[0.05] rounded w-1/2 mb-2" />
    <div className="h-3 bg-white/[0.05] rounded w-2/3" />
  </div>
);

export const ResellerAnalyticsPage: React.FC = () => {
  const { orders, resellerStats, loading } = useData();
  const [productMetrics, setProductMetrics] = useState<{ name: string; count: number; earnings: number }[]>([]);

  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');
  const totalOrders = nonCancelledOrders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const conversionRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const avgOrderValue = totalOrders > 0
    ? nonCancelledOrders.reduce((sum, o) => sum + Number(o.total_price), 0) / totalOrders
    : 0;

  // Monthly earnings chart data
  const monthlyProgress = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = nonCancelledOrders.filter(o => o.created_at.split('T')[0] === dateStr);
    return {
      date: date.toLocaleDateString('es-PA', { month: 'short', day: 'numeric' }),
      earnings: dayOrders.reduce((sum, o) => sum + Number(o.reseller_profit), 0),
      orders: dayOrders.length,
    };
  });

  // Status breakdown
  const statusBreakdown = [
    { name: 'Pendiente', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Confirmado', value: orders.filter(o => o.status === 'confirmed').length },
    { name: 'Produccion', value: orders.filter(o => o.status === 'production').length },
    { name: 'Enviado', value: orders.filter(o => o.status === 'shipped').length },
    { name: 'Entregado', value: orders.filter(o => o.status === 'delivered').length },
  ].filter(s => s.value > 0);

  // Fetch product metrics
  useEffect(() => {
    const fetchProductMetrics = async () => {
      try {
        const data = await analyticsService.getProductMetrics();
        setProductMetrics(data);
      } catch (err) {
        console.error('Error fetching product metrics:', err);
      }
    };
    fetchProductMetrics();
  }, []);

  // Recommendations
  const recommendations = [
    {
      type: 'info' as const,
      title: conversionRate >= 80
        ? 'Tu tasa de conversion es excelente'
        : 'Oportunidad de mejorar conversion',
      description: conversionRate >= 80
        ? 'Continua asi para alcanzar el siguiente nivel'
        : 'Enfocate en cerrar mas pedidos para mejorar tu tasa de entrega',
    },
    {
      type: 'success' as const,
      title: salesCountAnalysis(),
      description: getSalesRecommendation(),
    },
    {
      type: 'warning' as const,
      title: 'Tiempo de entrega promedio',
      description: avgOrderValue > 100
        ? 'Tu valor promedio por pedido es alto. Manten la calidad del servicio.'
        : 'Considera ofrecer combos o pedidos mayores para incrementar el valor promedio.',
    },
  ];

  function salesCountAnalysis() {
    const sales = resellerStats?.salesCount || 0;
    if (sales >= 100) return 'Nivel Distribuidor alcanzado';
    if (sales >= 50) return `Necesitas ${100 - sales} ventas para Distribuidor`;
    if (sales >= 15) return `Necesitas ${50 - sales} ventas para Micro Marca`;
    return `Necesitas ${15 - sales} ventas para Nivel Pro`;
  }

  function getSalesRecommendation() {
    const sales = resellerStats?.salesCount || 0;
    if (sales >= 100) return 'Has alcanzado el nivel maximo. Maximiza tus ganancias con productos premium.';
    if (sales >= 50) return `Solo faltan ${100 - sales} ventas. Aumenta tu volumen para llegar a Distribuidor.`;
    if (sales >= 15) return `Estas cerca de Micro Marca. ${50 - sales} ventas mas y desbloqueas beneficios premium.`;
    return `Estas en nivel Basico. Completa ${15 - sales} ventas para alcanzar Pro y obtener mejores margenes.`;
  }

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
          <h1 className="text-4xl font-bold text-white mb-2">Mis Analiticas</h1>
          <p className="text-gray-400">Analisis detallado de tu rendimiento</p>
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
                label="Tasa de Conversion"
                value={`${conversionRate}%`}
                icon={<TrendingUp className="w-6 h-6 text-nexus-gold" />}
                trend={conversionRate >= 80 ? { value: 12, isPositive: true } : undefined}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Valor Prom. Pedido"
                value={`$${Math.round(avgOrderValue)}`}
                icon={<Zap className="w-6 h-6 text-nexus-accent" />}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Pedidos Totales"
                value={totalOrders}
                icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard
                label="Satisfaccion"
                value="98%"
                icon={<ThumbsUp className="w-6 h-6 text-green-400" />}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Earnings Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-nexus-gold" />
                Ganancias Ultimos 30 Dias
              </h3>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-pulse w-full h-[250px] bg-white/[0.03] rounded" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProgress}>
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
                      formatter={(value: number, name: string) => [
                        name === 'earnings' ? `$${value.toFixed(2)}` : value,
                        name === 'earnings' ? 'Ganancias' : 'Pedidos'
                      ]}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#d4af37" dot={false} strokeWidth={2} name="Ganancias" />
                    <Line type="monotone" dataKey="orders" stroke="#00d4ff" dot={false} strokeWidth={1} name="Pedidos" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </motion.div>

          {/* Product Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-nexus-accent" />
                Rendimiento por Producto
              </h3>
              {productMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 8, 18, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'earnings' ? `$${value.toFixed(2)}` : value,
                        name === 'earnings' ? 'Ganancias' : 'Cantidad'
                      ]}
                    />
                    <Bar dataKey="count" fill="#00d4ff" radius={[8, 8, 0, 0]} name="Cantidad" />
                    <Bar dataKey="earnings" fill="#d4af37" radius={[8, 8, 0, 0]} name="Ganancias" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  Sin datos de productos
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-nexus-gold" />
              Distribucion por Estado
            </h3>
            {statusBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusBreakdown.map((_, index) => (
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
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {statusBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-300 text-sm">{entry.name}</span>
                      </div>
                      <span className="text-white font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">Sin datos</div>
            )}
          </GlassCard>
        </motion.div>

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-nexus-gold" />
              Recomendaciones
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.type === 'info' ? 'bg-blue-500/10 border-blue-500/20' :
                    rec.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                    'bg-amber-500/10 border-amber-500/20'
                  }`}
                >
                  <p className={`text-sm font-medium ${
                    rec.type === 'info' ? 'text-blue-200' :
                    rec.type === 'success' ? 'text-green-200' :
                    'text-amber-200'
                  }`}>
                    {rec.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    rec.type === 'info' ? 'text-blue-300/70' :
                    rec.type === 'success' ? 'text-green-300/70' :
                    'text-amber-300/70'
                  }`}>
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
