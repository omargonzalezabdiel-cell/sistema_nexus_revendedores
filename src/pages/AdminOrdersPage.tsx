import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Button, Input } from '../components/ui';
import {
  ChevronDown, ChevronUp, Truck,
  X, Search, ArrowUpDown, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderRow } from '../services/orders';

const ORDER_STATUSES = ['pending', 'confirmed', 'production', 'finished', 'shipped', 'delivered', 'cancelled'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  production: 'Produccion',
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

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-300',
  normal: 'bg-gray-500/20 text-gray-300',
  high: 'bg-orange-500/20 text-orange-300',
  urgent: 'bg-red-500/20 text-red-300',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const Skeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/[0.1] p-6 space-y-4">
    <div className="h-5 bg-white/[0.06] rounded w-1/3" />
    <div className="h-4 bg-white/[0.06] rounded w-2/3" />
    <div className="h-4 bg-white/[0.06] rounded w-1/2" />
  </div>
);

export const AdminOrdersPage: React.FC = () => {
  const { orders, loading, updateOrderStatus, updateOrder } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filterStatus !== 'all') {
      result = result.filter((o) => o.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.product_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, filterStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
    setUpdating(null);
  };

  const handlePriorityChange = async (orderId: string, priority: string) => {
    setUpdating(orderId);
    try {
      await updateOrder(orderId, { priority } as Partial<OrderRow>);
    } catch (err) {
      console.error('Error updating priority:', err);
    }
    setUpdating(null);
  };

  const handleTrackingSubmit = async (orderId: string) => {
    const code = trackingInput[orderId]?.trim();
    if (!code) return;
    setUpdating(orderId);
    try {
      await updateOrder(orderId, { tracking_code: code } as Partial<OrderRow>);
      setTrackingInput((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err) {
      console.error('Error updating tracking:', err);
    }
    setUpdating(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Seguro que deseas cancelar este pedido?')) return;
    await handleStatusChange(orderId, 'cancelled');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="h-10 bg-white/[0.03] rounded w-80 animate-pulse" />
          <div className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Gestion de Pedidos</h1>
          <p className="text-gray-400">
            {filteredOrders.length} pedidos
            {filterStatus !== 'all' && ` - ${STATUS_LABELS[filterStatus]}`}
          </p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por numero, cliente o producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  filterStatus === 'all'
                    ? 'bg-nexus-gold text-black shadow-lg shadow-nexus-gold/20'
                    : 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1]'
                }`}
              >
                Todos ({statusCounts.all})
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    filterStatus === status
                      ? 'bg-nexus-gold text-black shadow-lg shadow-nexus-gold/20'
                      : 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.1]'
                  }`}
                >
                  {STATUS_LABELS[status]} ({statusCounts[status] || 0})
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                layout
              >
                <GlassCard hover={false}>
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-nexus-gold">
                            {order.order_number}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-500/20 text-gray-300'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                          {order.priority && order.priority !== 'normal' && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[order.priority] || ''}`}>
                              {PRIORITY_LABELS[order.priority] || order.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {order.customer_name} &middot; {order.product_name} &middot; {order.quantity} unid.
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-lg font-bold text-white">${Number(order.total_price).toLocaleString()}</p>
                          <div className="flex gap-2 justify-end text-xs font-semibold mt-1">
                            <span className="px-2 py-0.5 rounded bg-nexus-gold/20 text-nexus-gold">
                              NEXUS: ${Number(order.nexus_profit).toLocaleString()}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-nexus-accent/20 text-nexus-accent">
                              Rev: ${Number(order.reseller_profit).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/[0.05] space-y-5">
                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Cliente', value: order.customer_name },
                              { label: 'Provincia', value: order.province },
                              { label: 'Telefono', value: order.phone },
                              { label: 'Envio', value: order.shipping_company },
                              { label: 'Producto', value: order.product_name },
                              { label: 'Tipo', value: order.product_type },
                              { label: 'Talla/Color', value: `${order.size || '-'} / ${order.color || '-'}` },
                              { label: 'Metodo Pago', value: order.payment_method },
                              { label: 'Costo Produccion', value: `$${Number(order.production_cost).toLocaleString()}` },
                              { label: 'Costo Envio', value: `$${Number(order.shipping_cost).toLocaleString()}` },
                              { label: 'Comision', value: `$${Number(order.platform_commission).toLocaleString()}` },
                              { label: 'Fecha Creacion', value: new Date(order.created_at).toLocaleDateString() },
                            ].map((field) => (
                              <div key={field.label}>
                                <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                                <p className="font-medium text-white text-sm">{field.value || '-'}</p>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                              <p className="text-xs text-gray-500 mb-1">Notas</p>
                              <p className="text-sm text-gray-300">{order.notes}</p>
                            </div>
                          )}

                          {/* Tracking Code */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <p className="text-xs text-gray-400 mb-3 font-semibold flex items-center gap-2">
                              <Truck className="w-4 h-4 text-nexus-accent" />
                              Codigo de Seguimiento
                            </p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ingrese codigo de seguimiento..."
                                value={trackingInput[order.id] || order.tracking_code || ''}
                                onChange={(e) =>
                                  setTrackingInput((prev) => ({ ...prev, [order.id]: e.target.value }))
                                }
                              />
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTrackingSubmit(order.id)}
                                loading={updating === order.id}
                              >
                                Guardar
                              </Button>
                            </div>
                          </div>

                          {/* Status Change */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <p className="text-xs text-gray-400 mb-3 font-semibold">Cambiar Estado</p>
                            <div className="flex flex-wrap gap-2">
                              {ORDER_STATUSES.map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(order.id, status)}
                                  disabled={updating === order.id}
                                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                                    order.status === status
                                      ? 'bg-nexus-gold text-black border-nexus-gold'
                                      : `${STATUS_COLORS[status]} hover:scale-105`
                                  } ${updating === order.id ? 'opacity-50' : ''}`}
                                >
                                  {STATUS_LABELS[status]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Priority Change */}
                          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                            <p className="text-xs text-gray-400 mb-3 font-semibold flex items-center gap-2">
                              <ArrowUpDown className="w-4 h-4" />
                              Prioridad
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {['low', 'normal', 'high', 'urgent'].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => handlePriorityChange(order.id, p)}
                                  disabled={updating === order.id}
                                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    order.priority === p
                                      ? 'bg-nexus-gold text-black'
                                      : `${PRIORITY_COLORS[p]} hover:scale-105`
                                  }`}
                                >
                                  {PRIORITY_LABELS[p]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cancel Button */}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <div className="pt-2">
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<X className="w-4 h-4" />}
                                onClick={() => handleCancelOrder(order.id)}
                                loading={updating === order.id}
                              >
                                Cancelar Pedido
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard>
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No se encontraron pedidos</p>
                    <p className="text-sm mt-1">Ajusta los filtros o la busqueda</p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
};
