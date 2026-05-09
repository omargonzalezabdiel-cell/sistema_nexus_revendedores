import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { orderService, OrderRow } from '../services/orders';
import { costsService, CostRow } from '../services/costsService';
import { analyticsService, ResellerStatsData } from '../services/analytics';
import { notificationService, NotificationRow } from '../services/notificationService';
import { supabase } from '../lib/supabase';

interface DataContextType {
  orders: OrderRow[];
  costs: CostRow | null;
  resellerStats: ResellerStatsData | null;
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;

  fetchOrders: () => Promise<void>;
  addOrder: (orderData: any) => Promise<OrderRow>;
  updateOrderStatus: (orderId: string, status: string, description?: string) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<OrderRow>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  fetchCosts: () => Promise<void>;
  updateCosts: (updates: Partial<CostRow>) => Promise<void>;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  fetchResellerStats: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [costs, setCosts] = useState<CostRow | null>(null);
  const [resellerStats, setResellerStats] = useState<ResellerStatsData | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const filters = isAdmin ? {} : { reseller_id: user.id };
      const data = await orderService.getOrders(filters);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, [user, isAdmin]);

  const fetchCosts = useCallback(async () => {
    try {
      const data = await costsService.getCosts();
      setCosts(data);
    } catch (err) {
      console.error('Error fetching costs:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  const fetchResellerStats = useCallback(async () => {
    if (!user || isAdmin) return;
    try {
      const data = await analyticsService.getResellerStats(user.id);
      setResellerStats(data);
    } catch (err) {
      console.error('Error fetching reseller stats:', err);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchNotifications(),
        isAdmin ? fetchCosts() : fetchResellerStats(),
      ]);
      setLoading(false);
    };

    loadAll();
  }, [user, fetchOrders, fetchNotifications, fetchCosts, fetchResellerStats, isAdmin]);

  useEffect(() => {
    if (!user) return;

    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    const notifChannel = supabase
      .channel('notif-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user, fetchOrders, fetchNotifications]);

  const addOrder = async (orderData: any): Promise<OrderRow> => {
    const order = await orderService.createOrder(orderData);
    await fetchOrders();
    if (!isAdmin) await fetchResellerStats();
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: string, description?: string) => {
    await orderService.updateOrderStatus(orderId, status, description, user?.id);
    await fetchOrders();
  };

  const updateOrder = async (orderId: string, updates: Partial<OrderRow>) => {
    await orderService.updateOrder(orderId, updates);
    await fetchOrders();
  };

  const deleteOrder = async (orderId: string) => {
    await orderService.deleteOrder(orderId);
    await fetchOrders();
  };

  const updateCosts = async (updates: Partial<CostRow>) => {
    if (!user) return;
    await costsService.updateCosts(updates, user.id);
    await fetchCosts();
  };

  const markNotificationRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await fetchNotifications();
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    await fetchNotifications();
  };

  return (
    <DataContext.Provider value={{
      orders,
      costs,
      resellerStats,
      notifications,
      unreadCount,
      loading,
      fetchOrders,
      addOrder,
      updateOrderStatus,
      updateOrder,
      deleteOrder,
      fetchCosts,
      updateCosts,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      fetchResellerStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};
