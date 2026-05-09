import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Button } from '../components/ui';
import {
  Factory, Package, Clock, CheckCircle2, Truck,
  AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  production: 'En Produccion',
  finished: 'Terminado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-red-500/20 text-red-300 border-red-500/30',
  confirmed: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  production: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  finished: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  shipped: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export const AdminProductionPage: React.FC = () => {
  const { orders, loading, updateOrderStatus } = useData();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filter production-relevant orders
  const productionOrders = useMemo(
    () => orders.filter((o) => ['confirmed', 'production', 'finished'].includes(o.status)),
    [orders]
  );

  // Workload overview
  const workload = useMemo(() => {
    const counts: Record<string, number> = {};
    ['pending', 'confirmed', 'production', 'finished', 'shipped', 'delivered', 'cancelled'].forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  const handleMarkFinished = async (orderId: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, 'finished', 'Pedido completado en produccion');
    } catch (err) {
      console.error('Error updating order:', err);
    }
    setUpdating(null);
  };

  const handleMarkShipped = async (orderId: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, 'shipped', 'Pedido enviado');
    } catch (err) {
      console.error('Error updating order:', err);
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Produccion</h1>
          <p className="text-gray-400">Seguimiento de pedidos en proceso de produccion</p>
        </motion.div>

        {/* Workload Overview */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { status: 'confirmed', label: 'Confirmados', icon: <Clock className="w-5 h-5 text-amber-400" /> },
            { status: 'production', label: 'En Produccion', icon: <Factory className="w-5 h-5 text-yellow-400" /> },
            { status: 'finished', label: 'Terminados', icon: <CheckCircle2 className="w-5 h-5 text-purple-400" /> },
            { status: 'shipped', label: 'Enviados', icon: <Truck className="w-5 h-5 text-cyan-400" /> },
            { status: 'delivered', label: 'Entregados', icon: <CheckCircle2 className="w-5 h-5 text-green-400" /> },
            { status: 'pending', label: 'Pendientes', icon: <AlertTriangle className="w-5 h-5 text-red-400" /> },
          ].map(({ status, label, icon }) => (
            <motion.div key={status} variants={item}>
              <GlassCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.1]">
                    {icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{workload[status] || 0}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Production Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-nexus-gold" />
              Pipeline de Produccion
            </h3>

            {/* Visual Pipeline */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-400">{workload.confirmed || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Confirmados</p>
                <div className="mt-3 h-1 bg-amber-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${orders.length ? ((workload.confirmed || 0) / orders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-yellow-400">{workload.production || 0}</p>
                <p className="text-sm text-gray-400 mt-1">En Produccion</p>
                <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${orders.length ? ((workload.production || 0) / orders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-400">{workload.finished || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Terminados</p>
                <div className="mt-3 h-1 bg-purple-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all"
                    style={{ width: `${orders.length ? ((workload.finished || 0) / orders.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Orders in Production */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Factory className="w-5 h-5 text-nexus-accent" />
              Pedidos en Proceso ({productionOrders.length})
            </h3>

            <div className="space-y-3">
              {productionOrders.length > 0 ? productionOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-nexus-gold">{order.order_number}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                          {order.priority && order.priority !== 'normal' && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                              {PRIORITY_LABELS[order.priority] || order.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {order.customer_name} &middot; {order.product_name} &middot; {order.quantity} unid.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Action buttons based on status */}
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {order.status === 'confirmed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMarkFinished(order.id)}
                              loading={updating === order.id}
                              icon={<Factory className="w-3 h-3" />}
                            >
                              A Produccion
                            </Button>
                          )}
                          {order.status === 'production' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkFinished(order.id)}
                              loading={updating === order.id}
                              icon={<CheckCircle2 className="w-3 h-3" />}
                            >
                              Terminado
                            </Button>
                          )}
                          {order.status === 'finished' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleMarkShipped(order.id)}
                              loading={updating === order.id}
                              icon={<Truck className="w-3 h-3" />}
                            >
                              Enviar
                            </Button>
                          )}
                        </div>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Producto</p>
                            <p className="text-white">{order.product_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tipo</p>
                            <p className="text-white">{order.product_type || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Talla / Color</p>
                            <p className="text-white">{order.size || '-'} / {order.color || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cantidad</p>
                            <p className="text-white font-semibold">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cliente</p>
                            <p className="text-white">{order.customer_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Telefono</p>
                            <p className="text-white">{order.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fecha Creacion</p>
                            <p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fecha Entrega Est.</p>
                            <p className="text-white">
                              {order.delivery_date
                                ? new Date(order.delivery_date).toLocaleDateString()
                                : 'Sin fecha'}
                            </p>
                          </div>
                          {order.notes && (
                            <div className="col-span-full">
                              <p className="text-xs text-gray-500 mb-1">Notas</p>
                              <p className="text-gray-300">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )) : (
                <div className="py-12 text-center text-gray-500">
                  <Factory className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay pedidos en produccion</p>
                  <p className="text-sm mt-1">Los pedidos confirmados aparecen aqui</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </MainLayout>
  );
};
