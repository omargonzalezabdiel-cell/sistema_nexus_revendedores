import { Order, CostStructure, ResellerStats, DailyMetrics, Notification, ResellerLevel } from '../types';

export function generateMockData() {
  const now = new Date();

  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      resellerId: 'res_1',
      clientName: 'Juan García',
      province: 'San Salvador',
      address: '123 Calle Principal',
      phone: '+50376543210',
      shippingCompany: 'uno-express',
      product: 'Playera Premium',
      quantity: 50,
      size: 'Variado',
      color: 'Negro',
      specialNotes: 'Logo en pecho',
      paymentMethod: 'transfer',
      status: 'shipped',
      totalPrice: 1500,
      resellerEarnings: 600,
      nexusEarnings: 400,
      productionCost: 500,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: 'evt_1',
          status: 'pending',
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Pedido creado',
        },
        {
          id: 'evt_2',
          status: 'confirmed',
          timestamp: new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Pedido confirmado',
        },
        {
          id: 'evt_3',
          status: 'production',
          timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'En producción',
        },
        {
          id: 'evt_4',
          status: 'finished',
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Producción terminada',
        },
        {
          id: 'evt_5',
          status: 'shipped',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Enviado con Uno Express',
        },
      ],
    },
    {
      id: 'ORD-002',
      resellerId: 'res_1',
      clientName: 'María López',
      province: 'La Libertad',
      address: '456 Avenida Central',
      phone: '+50374123456',
      shippingCompany: 'ferguson',
      product: 'Gorra Premium',
      quantity: 100,
      size: 'Único',
      color: 'Azul',
      paymentMethod: 'yappy',
      status: 'production',
      totalPrice: 2000,
      resellerEarnings: 800,
      nexusEarnings: 500,
      productionCost: 700,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [
        {
          id: 'evt_6',
          status: 'pending',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Pedido creado',
        },
        {
          id: 'evt_7',
          status: 'confirmed',
          timestamp: new Date(now.getTime() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Pedido confirmado',
        },
        {
          id: 'evt_8',
          status: 'production',
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'En producción',
        },
      ],
    },
  ];

  const mockCosts: CostStructure = {
    id: 'costs_1',
    material: 5,
    ink: 2,
    paper: 1.5,
    electricity: 1,
    labor: 3,
    packaging: 1.5,
    shipping: 2,
    maintenance: 1,
    platformCommission: 3,
    updatedAt: new Date().toISOString(),
  };

  const mockResellerStats: ResellerStats[] = [
    {
      id: 'stat_1',
      resellerId: 'res_1',
      totalSales: 42,
      totalEarnings: 18500,
      monthlyEarnings: 5600,
      currentLevel: ResellerLevel.PRO,
      xp: 4200,
      streak: 8,
      rewards: [
        { id: 'r1', name: 'Primer Pedido', description: 'Completaste tu primer pedido', icon: 'award' },
        { id: 'r2', name: 'Pro Alcanzado', description: 'Completaste 15 ventas', icon: 'trophy' },
      ],
      monthlyGoal: 8000,
      monthlyProgress: 5600,
      lastUpdated: new Date().toISOString(),
    },
  ];

  const mockMetrics: DailyMetrics[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 15) + 2,
      earnings: Math.floor(Math.random() * 3000) + 500,
      revenue: Math.floor(Math.random() * 5000) + 1500,
    };
  });

  const mockNotifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'res_1',
      type: 'order',
      title: 'Pedido Confirmado',
      message: 'Tu pedido ORD-002 ha sido confirmado y pasó a producción',
      icon: 'check-circle',
      read: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_2',
      userId: 'res_1',
      type: 'reward',
      title: 'Nuevo Logro',
      message: 'Alcanzaste el nivel PRO con 15 ventas',
      icon: 'star',
      read: true,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    orders: mockOrders,
    costs: mockCosts,
    resellerStats: mockResellerStats,
    metrics: mockMetrics,
    notifications: mockNotifications,
  };
}
