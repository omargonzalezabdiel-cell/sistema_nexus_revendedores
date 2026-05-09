import { supabase } from '../lib/supabase';

export interface OrderRow {
  id: string;
  order_number: string;
  reseller_id: string;
  customer_name: string;
  province: string;
  address: string;
  phone: string;
  product_name: string;
  product_type: string;
  quantity: number;
  size: string;
  color: string;
  notes: string;
  payment_method: string;
  shipping_company: string;
  shipping_cost: number;
  production_cost: number;
  reseller_profit: number;
  nexus_profit: number;
  platform_commission: number;
  total_price: number;
  status: string;
  priority: string;
  tracking_code: string;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineRow {
  id: string;
  order_id: string;
  status: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

function generateOrderNumber(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `NX-${num}`;
}

export const orderService = {
  async createOrder(orderData: Omit<OrderRow, 'id' | 'order_number' | 'created_at' | 'updated_at'>) {
    const orderNumber = generateOrderNumber();

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        ...orderData,
        order_number: orderNumber,
      }])
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Create initial timeline event
    if (order) {
      await supabase.from('order_timeline').insert([{
        order_id: order.id,
        status: 'pending',
        description: 'Pedido creado',
      }]);
    }

    return order as OrderRow;
  },

  async getOrders(filters?: { reseller_id?: string; status?: string }) {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (filters?.reseller_id) {
      query = query.eq('reseller_id', filters.reseller_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as OrderRow[];
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as OrderRow | null;
  },

  async updateOrderStatus(orderId: string, status: string, description?: string, userId?: string) {
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (updateError) throw new Error(updateError.message);

    if (order) {
      await supabase.from('order_timeline').insert([{
        order_id: orderId,
        status,
        description: description || `Estado cambiado a ${status}`,
        created_by: userId || null,
      }]);
    }

    return order as OrderRow;
  },

  async updateOrder(orderId: string, updates: Partial<OrderRow>) {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as OrderRow;
  },

  async getOrderTimeline(orderId: string) {
    const { data, error } = await supabase
      .from('order_timeline')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as TimelineRow[];
  },

  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw new Error(error.message);
  },
};
