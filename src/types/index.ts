// Autenticación
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'reseller';
  companyName?: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Pedidos
export type OrderStatus = 'pending' | 'confirmed' | 'production' | 'finished' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  resellerId: string;
  clientName: string;
  province: string;
  address: string;
  phone: string;
  shippingCompany: 'uno-express' | 'ferguson';
  product: string;
  quantity: number;
  size: string;
  color: string;
  specialNotes?: string;
  paymentMethod: 'yappy' | 'transfer';
  designFile?: string;
  status: OrderStatus;
  totalPrice: number;
  resellerEarnings: number;
  nexusEarnings: number;
  productionCost: number;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
}

// Costos
export interface CostStructure {
  id: string;
  material: number; // costo material
  ink: number;
  paper: number;
  electricity: number;
  labor: number;
  packaging: number;
  shipping: number;
  maintenance: number;
  platformCommission: number;
  updatedAt: string;
}

export interface PriceCalculation {
  productionCost: number;
  resellerEarnings: number;
  nexusEarnings: number;
  totalPrice: number;
  profitMargin: number;
}

// Niveles y Recompensas
export enum ResellerLevel {
  BASIC = 'basic',
  PRO = 'pro',
  MICRO_BRAND = 'micro_brand',
  DISTRIBUTOR = 'distributor',
}

export interface LevelThreshold {
  level: ResellerLevel;
  minSales: number;
  maxSales?: number;
  badge: string;
  rewards: string[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface ResellerStats {
  id: string;
  resellerId: string;
  totalSales: number;
  totalEarnings: number;
  monthlyEarnings: number;
  currentLevel: ResellerLevel;
  xp: number;
  streak: number;
  rewards: Reward[];
  monthlyGoal: number;
  monthlyProgress: number;
  lastUpdated: string;
}

// Dashboard Analytics
export interface DailyMetrics {
  date: string;
  orders: number;
  earnings: number;
  revenue: number;
}

export interface ProductMetrics {
  name: string;
  count: number;
  earnings: number;
}

export interface ResellerRanking {
  resellerId: string;
  resellerName: string;
  level: ResellerLevel;
  sales: number;
  earnings: number;
  rank: number;
}

// Notificaciones
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'reward' | 'system' | 'alert';
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  createdAt: string;
}
