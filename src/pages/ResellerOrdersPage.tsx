import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MainLayout } from '../layouts/MainLayout';
import { GlassCard, Button } from '../components/ui';
import {
  ChevronDown, MapPin, Phone, Hash,
  Palette, Ruler, Package, Truck, DollarSign,
  CreditCard, MessageSquare, CalendarDays, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  pending: 'bg-gray-500/20 text-gray-300',
  confirmed: 'bg-blue-500/20 text-blue-300',
  production: 'bg-yellow-500/20 text-yellow-300',
  finished: 'bg-purple-500/20 text-purple-300',
  shipped: 'bg-cyan-500/20 text-cyan-300',
  delivered: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

const FILTER_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'production', label: 'Produccion' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregado' },
];

const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-white/[0.05] rounded w-1/3" />
    <div className="h-16 bg-white/[0.05] rounded" />
    <div className="h-16 bg-white/[0.05] rounded" />
    <div className="h-16 bg-white/[0.05] rounded" />
  </div>
);

export const ResellerOrdersPage: React.FC = () => {
  const { orders, loading } = useData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const handleWhatsApp = (order: typeof orders[0]) => {
    const message = encodeURIComponent(
      `Hola, envio comprobante del pedido #${order.order_number}\n\nCliente: ${order.customer_name}\nProducto: ${order.product_name}\nCantidad: ${order.quantity}\nTotal: $${Number(order.total_price).toFixed(2)}\nMetodo de pago: ${order.payment_method === 'yappy' ? 'Yappy' : 'Transferencia Bancaria'}`
    );
    window.open(`https://wa.me/50764987682?text=${message}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-400">Total: {orders.length} pedidos</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'bg-nexus-gold text-black'
                    : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] hover:text-white'
                }`}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-2 text-xs opacity-70">
                    ({orders.filter(o => o.status === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <GlassCard><Skeleton /></GlassCard>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <GlassCard>
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-white text-sm font-mono">{order.order_number}</p>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1.5">{order.customer_name} &middot; {order.product_name}</p>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-lg font-bold text-nexus-gold">${Number(order.total_price).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{order.quantity} unid.</p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('es-PA', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/[0.05] space-y-5">
                          {/* Customer Info */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Nombre</p>
                                  <p className="text-sm font-medium text-white">{order.customer_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Provincia</p>
                                  <p className="text-sm font-medium text-white">{order.province}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Telefono</p>
                                  <p className="text-sm font-medium text-white">{order.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Direccion</p>
                                  <p className="text-sm font-medium text-white truncate">{order.address}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Producto</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Producto</p>
                                  <p className="text-sm font-medium text-white">{order.product_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Color / Talla</p>
                                  <p className="text-sm font-medium text-white">{order.color} / {order.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Cantidad</p>
                                  <p className="text-sm font-medium text-white">{order.quantity}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Tipo</p>
                                  <p className="text-sm font-medium text-white">{order.product_type}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Shipping & Payment */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Envio y Pago</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Empresa</p>
                                  <p className="text-sm font-medium text-white capitalize">{order.shipping_company.replace('-', ' ')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Costo Envio</p>
                                  <p className="text-sm font-medium text-white">${Number(order.shipping_cost).toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-xs text-gray-400">Metodo Pago</p>
                                  <p className="text-sm font-medium text-white capitalize">{order.payment_method}</p>
                                </div>
                              </div>
                              {order.tracking_code && (
                                <div className="flex items-center gap-2">
                                  <Hash className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <p className="text-xs text-gray-400">Tracking</p>
                                    <p className="text-sm font-medium text-nexus-accent font-mono">{order.tracking_code}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price Breakdown */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Desglose</h4>
                            <div className="bg-white/[0.02] rounded-lg border border-white/[0.05] p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Costo Produccion</span>
                                <span className="text-white">${Number(order.production_cost).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Costo Envio</span>
                                <span className="text-white">${Number(order.shipping_cost).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-nexus-gold">Tu Ganancia</span>
                                <span className="text-nexus-gold font-semibold">${Number(order.reseller_profit).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-nexus-accent">Ganancia NEXUS</span>
                                <span className="text-nexus-accent">${Number(order.nexus_profit).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Comision Plataforma</span>
                                <span className="text-white">${Number(order.platform_commission).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm border-t border-white/[0.05] pt-2 mt-2">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-nexus-gold font-bold text-lg">${Number(order.total_price).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                              <p className="text-xs text-gray-400 mb-1">Notas</p>
                              <p className="text-sm text-gray-300">{order.notes}</p>
                            </div>
                          )}

                          {/* Dates */}
                          <div className="flex items-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              Creado: {new Date(order.created_at).toLocaleString('es-PA')}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              Actualizado: {new Date(order.updated_at).toLocaleString('es-PA')}
                            </div>
                            {order.delivery_date && (
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                Entrega: {new Date(order.delivery_date).toLocaleDateString('es-PA')}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<MessageSquare className="w-4 h-4" />}
                              onClick={() => handleWhatsApp(order)}
                            >
                              WhatsApp Comprobante
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                {activeFilter === 'all' ? 'No tienes pedidos aun' : `No hay pedidos ${STATUS_LABELS[activeFilter]?.toLowerCase() || activeFilter}s`}
              </h3>
              <p className="text-gray-500 text-sm">Crea un nuevo pedido para comenzar</p>
            </div>
          </GlassCard>
        )}
      </div>
    </MainLayout>
  );
};
