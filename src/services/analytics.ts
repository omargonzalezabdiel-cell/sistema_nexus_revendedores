import { supabase } from '../lib/supabase';

export interface ResellerStatsData {
  totalSales: number;
  totalEarnings: number;
  monthlyEarnings: number;
  currentLevel: string;
  xp: number;
  salesCount: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export interface DailyMetric {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_nexus_profit: number;
  total_reseller_profit: number;
}

export const analyticsService = {
  async getResellerStats(resellerId: string): Promise<ResellerStatsData> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, reseller_profit, status, created_at')
      .eq('reseller_id', resellerId);

    if (error) throw new Error(error.message);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const allOrders = orders || [];
    const totalSales = allOrders.filter(o => o.status !== 'cancelled').length;
    const totalEarnings = allOrders.reduce((sum, o) => sum + Number(o.reseller_profit), 0);
    const monthlyOrders = allOrders.filter(o => o.created_at >= monthStart && o.status !== 'cancelled');
    const monthlyEarnings = monthlyOrders.reduce((sum, o) => sum + Number(o.reseller_profit), 0);

    const { data: user } = await supabase
      .from('users')
      .select('level, xp, sales_count')
      .eq('id', resellerId)
      .maybeSingle();

    const { data: levels } = await supabase
      .from('reseller_levels')
      .select('*')
      .eq('level', user?.level || 'basic')
      .maybeSingle();

    return {
      totalSales,
      totalEarnings,
      monthlyEarnings,
      currentLevel: user?.level || 'basic',
      xp: user?.xp || 0,
      salesCount: user?.sales_count || 0,
      monthlyGoal: Number(levels?.monthly_goal || 500),
      monthlyProgress: monthlyEarnings,
    };
  },

  async getAdminMetrics() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, nexus_profit, reseller_profit, production_cost, shipping_cost, status, created_at');

    if (error) throw new Error(error.message);

    const allOrders = orders || [];
    const activeOrders = allOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const totalNexusProfit = allOrders.reduce((sum, o) => sum + Number(o.nexus_profit), 0);
    const totalResellerProfit = allOrders.reduce((sum, o) => sum + Number(o.reseller_profit), 0);

    const { count: resellerCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reseller');

    return {
      totalRevenue,
      totalNexusProfit,
      totalResellerProfit,
      activeOrders: activeOrders.length,
      totalOrders: allOrders.length,
      resellerCount: resellerCount || 0,
    };
  },

  async getDailyMetrics(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as DailyMetric[];
  },

  async getRanking() {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, company_name, level, sales_count, xp')
      .eq('role', 'reseller')
      .eq('blocked', false)
      .order('sales_count', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return (data || []).map((r, i) => ({ ...r, rank: i + 1 }));
  },

  async getProductMetrics() {
    const { data, error } = await supabase
      .from('orders')
      .select('product_type, total_price, quantity')
      .neq('status', 'cancelled');

    if (error) throw new Error(error.message);

    const products: Record<string, { count: number; revenue: number }> = {};
    (data || []).forEach(o => {
      const type = o.product_type || 'Otro';
      if (!products[type]) products[type] = { count: 0, revenue: 0 };
      products[type].count += o.quantity;
      products[type].revenue += Number(o.total_price);
    });

    return Object.entries(products).map(([name, data]) => ({
      name,
      count: data.count,
      earnings: data.revenue,
    }));
  },
};
