# NEXUS - Arquitectura y Estructura del Código

## 📋 Índice
1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes Principales](#componentes-principales)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Gestión de Estado](#gestión-de-estado)
7. [Independencia de Módulos](#independencia-de-módulos)
8. [Preparación para Supabase](#preparación-para-supabase)

---

## 🎯 Visión General

NEXUS es una aplicación **modular y escalable** construida con:
- **React + TypeScript** para UI type-safe
- **Context API** para estado global
- **localStorage** para persistencia
- **Vite** para build optimizado
- **TailwindCSS** para estilos

**Principio Clave**: Cada módulo es **independiente** y puede ser reemplazado sin afectar otros.

---

## 📁 Estructura de Carpetas

```
src/
├── components/          # Componentes UI reutilizables
│   └── ui/
│       ├── Button.tsx       (Botón universal - 4 variantes)
│       ├── Input.tsx        (Input con validación)
│       ├── GlassCard.tsx    (Tarjeta glassmorphic)
│       ├── StatCard.tsx     (Tarjeta estadística)
│       └── index.ts         (Exports centralizados)
│
├── context/             # Estado global
│   ├── AuthContext.tsx      (Usuario + login/logout)
│   └── DataContext.tsx      (Pedidos + costos + estadísticas)
│
├── pages/              # Vistas principales (13 páginas)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ResellerdashboardPage.tsx
│   ├── ResellerOrdersPage.tsx
│   ├── NewOrderPage.tsx
│   ├── EarningsPage.tsx
│   ├── RewardsPage.tsx
│   ├── ResellerAnalyticsPage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── AdminOrdersPage.tsx
│   ├── AdminCostsPage.tsx
│   ├── AdminResellersPage.tsx
│   └── AdminAnalyticsPage.tsx
│
├── layouts/            # Layouts compartidos
│   ├── MainLayout.tsx      (Wrapper con sidebar + navbar)
│   ├── Navbar.tsx          (Barra superior)
│   └── Sidebar.tsx         (Menú lateral)
│
├── hooks/              # Lógica reutilizable
│   └── useNavigation.ts     (Router custom sin React Router)
│
├── services/           # Lógica de negocio
│   ├── auth.ts            (Mock - TODO: Supabase Auth)
│   ├── orders.ts          (Mock - TODO: Supabase Orders)
│   └── analytics.ts       (Mock - TODO: Supabase Analytics)
│
├── lib/                # Librerías y configuración
│   └── supabase.ts        (Cliente Supabase - pendiente)
│
├── data/               # Datos simulados
│   └── mockData.ts        (Genera datos realistas)
│
├── types/              # TypeScript interfaces
│   └── index.ts           (Tipos globales)
│
├── App.tsx             # Router principal
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

---

## 🔄 Flujo de Datos

### 1. **Inicialización de la App**

```
main.tsx
   ↓
App.tsx (RouterPrincipal)
   ├─→ AuthProvider (Estado de usuario)
   │   └─→ DataProvider (Estado de datos)
   │       └─→ AppContent (Lógica de rutas)
```

### 2. **Flujo de Autenticación**

```
LoginPage/RegisterPage
   ↓
useAuth() [AuthContext]
   ├─→ login() / register()
   │   └─→ localStorage.setItem('nexus_auth')
   ↓
setLocation('/dashboard') [useNavigation]
   ↓
App verifica isAuthenticated
   ├─→ true  → Renderiza dashboard
   └─→ false → Renderiza login
```

### 3. **Flujo de Datos de Pedidos**

```
NewOrderPage (Formulario)
   ↓
useData() [DataContext]
   ├─→ addOrder()
   │   ├─→ Crea pedido con ID único
   │   ├─→ localStorage.setItem('nexus_orders')
   │   └─→ addNotification()
   ↓
ResellerOrdersPage (Lee datos)
   ├─→ useData().orders (from localStorage)
   └─→ Renderiza lista filtrada
```

### 4. **Flujo de Costos**

```
AdminCostsPage (Editor)
   ↓
useData().updateCosts()
   ├─→ Actualiza costs en DataContext
   ├─→ Calcula ganancias automáticamente
   └─→ Notifica al usuario
```

---

## 🧩 Componentes Principales

### **1. AuthContext.tsx** - Gestión de Usuario

```typescript
// Proporciona
export interface AuthState {
  user: User | null;              // Usuario actual
  isAuthenticated: boolean;        // Flag de sesión
  login(email, password): void;    // Iniciar sesión
  register(...): void;             // Crear cuenta
  logout(): void;                  // Cerrar sesión
}

// Uso en componentes
const { user, login, logout } = useAuth();
```

**Responsabilidad**: Solo autenticación y datos del usuario
**Independencia**: ✓ No depende de DataContext
**Persistencia**: localStorage → `nexus_auth`

### **2. DataContext.tsx** - Estado de Negocio

```typescript
// Proporciona
export interface DataContextType {
  orders: Order[];                      // Todos los pedidos
  costs: CostStructure;                 // Estructura de costos
  stats: Map<string, ResellerStats>;   // Estadísticas por revendedor
  metrics: DailyMetrics[];              // Datos históricos
  notifications: Notification[];        // Alertas
  
  // Funciones
  addOrder(order): void;
  updateOrderStatus(id, status): void;
  updateCosts(costs): void;
  getResellerStats(id): ResellerStats;
  addNotification(notif): void;
}

// Uso en componentes
const { orders, addOrder, updateCosts } = useData();
```

**Responsabilidad**: Todo sobre pedidos, costos y estadísticas
**Independencia**: ✓ No depende de AuthContext (solo usa userId)
**Persistencia**: localStorage → `nexus_orders`

### **3. Componentes UI (Button, Input, GlassCard, StatCard)**

```typescript
// Button.tsx - 4 variantes
<Button 
  variant="primary|secondary|danger|outline"
  size="sm|md|lg"
  loading={true}
  icon={<Icon />}
>
  Texto
</Button>

// Input.tsx - Con validación
<Input
  label="Email"
  type="email"
  icon={<Mail />}
  error="Email inválido"
  onChange={(e) => setState(e.target.value)}
/>

// GlassCard.tsx - Efecto glassmorphic
<GlassCard hover={true} onClick={() => {}}>
  Contenido con blur y transparencia
</GlassCard>

// StatCard.tsx - Tarjeta estadística
<StatCard
  label="Ganancias"
  value="$5,000"
  icon={<TrendingUp />}
  trend={{ value: 25, isPositive: true }}
/>
```

**Responsabilidad**: Solo presentación
**Independencia**: ✓ Completamente sin lógica
**Reutilización**: Usados en 13+ páginas

### **4. Layouts (MainLayout, Navbar, Sidebar)**

```typescript
// MainLayout.tsx - Estructura principal
<MainLayout>
  <h1>Contenido de página</h1>
</MainLayout>
// Incluye: Sidebar + Navbar + Animaciones

// Navbar.tsx - Barra superior
// Features:
// - Logo + Nombre app
// - Notificaciones con badge
// - Info usuario
// - Botón logout

// Sidebar.tsx - Menú lateral
// Features:
// - Menú dinámico por rol
// - Links activos resaltados
// - Colapsable en mobile
// - Animaciones suaves
```

**Responsabilidad**: Layout y navegación
**Independencia**: ✓ No usan datos de negocio
**Reutilización**: Todos los dashboards

---

## 🔐 Sistema de Autenticación

### **Flujo Completo de Login**

```
1. Usuario abre app
   ↓
2. App verifica localStorage['nexus_auth']
   ├─→ Existe   → setAuthenticated(true) → Ir a dashboard
   └─→ No existe → Mostrar login
   ↓
3. Usuario ingresa credenciales
   ↓
4. useAuth().login(email, password)
   ├─→ Mock delay 500ms
   ├─→ Crea usuario simulado con:
   │   - id: user_${timestamp}
   │   - email, firstName, lastName
   │   - role: 'admin' | 'reseller'
   │   - companyName
   └─→ localStorage.setItem('nexus_auth', JSON.stringify(user))
   ↓
5. App renderiza dashboard correcto
   ├─→ Admin → /admin/dashboard
   └─→ Reseller → /reseller/dashboard
```

### **Flujo de Registro (3 Pasos)**

```
Paso 1: Datos Personales
├─ Nombre *
├─ Apellido *
└─ Email * (validar @)

Paso 2: Seguridad
├─ Contraseña * (6+ chars)
└─ Confirmar * (debe coincidir)

Paso 3: Tipo de Cuenta
├─ Revendedor
│  └─ Nombre empresa *
└─ Administrador

Validación:
✓ Email válido (contiene @)
✓ Contraseña 6+ caracteres
✓ Contraseñas coinciden
✓ Campos requeridos

Al crear:
└─ register(email, password, firstName, lastName, role, companyName)
   ├─→ Crea usuario
   ├─→ Guarda en localStorage
   └─→ Redirige a dashboard
```

---

## 🗂️ Gestión de Estado

### **Niveles de Estado**

```
localStorage (Persistencia)
     ↑
     ├─ nexus_auth (Usuario actual)
     ├─ nexus_orders (Todos los pedidos)
     └─ (TODO: nexus_users, nexus_costs cuando sea Supabase)

Context API (Global)
     ↑
     ├─ AuthContext
     │  ├─ user: User | null
     │  ├─ isAuthenticated: boolean
     │  └─ login/register/logout()
     │
     └─ DataContext
        ├─ orders: Order[]
        ├─ costs: CostStructure
        ├─ stats: Map<string, ResellerStats>
        ├─ metrics: DailyMetrics[]
        ├─ notifications: Notification[]
        └─ add/update/get functions()

Component State (Local)
     ↑
     └─ useState() para UI ephemeral
        ├─ formData, expandedOrder
        ├─ filterStatus, selectedTab
        └─ loading, error messages
```

### **Flujo de Actualización**

```
Componente llama useData().updateOrderStatus(id, 'shipped')
   ↓
DataContext actualiza state local
   ├─→ modifica orders array
   └─→ localStorage.setItem('nexus_orders')
   ↓
React re-renderiza componentes suscritos
   └─→ ResellerOrdersPage se actualiza automáticamente
```

---

## 🔗 Independencia de Módulos

### **¿Por qué cada módulo es independiente?**

#### **1. Componentes UI**
```typescript
// Button.tsx NO importa nada de contextos
import React from 'react';
import { motion } from 'framer-motion';

// Resultado: Reutilizable en ANY app
<Button variant="primary">Click me</Button>
```

✓ **Ventaja**: Puedes cambiar Button.tsx sin afectar nada  
✓ **Ventaja**: Testeable en aislamiento  
✓ **Ventaja**: Portable a otro proyecto  

#### **2. Services (auth, orders, analytics)**
```typescript
// auth.ts - Completamente mockeado
// Interfaz limpia sin detalles de implementación

export const authService = {
  login: async (email, password) => { ... },
  register: async (email, password, userData) => { ... },
  logout: async () => { ... }
}

// Cuando conectes Supabase, SOLO cambias aquí
// El resto de la app NO cambia
```

✓ **Ventaja**: Reemplazable sin tocar componentes  
✓ **Ventaja**: Mock perfecto para testing  
✓ **Ventaja**: Migración fácil a Supabase  

#### **3. Contextos (AuthContext, DataContext)**
```typescript
// AuthContext proporciona solo autenticación
const { login, logout, user } = useAuth();

// DataContext proporciona solo datos de negocio
const { orders, addOrder } = useData();

// No comparten responsabilidades
// Independencia total
```

✓ **Ventaja**: Cada uno maneja una cosa  
✓ **Ventaja**: Fácil de testear por separado  
✓ **Ventaja**: Reemplaceable por Redux, Zustand, etc.  

#### **4. Páginas (components)**
```typescript
// ResellerDashboardPage.tsx SOLO usa hooks
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

// NO importa detalles de implementación
// Solo consume interfaces públicas

export const ResellerDashboardPage = () => {
  const { orders } = useData(); // Obtiene datos
  // renderiza...
}
```

✓ **Ventaja**: Cambios internos en DataContext no rompen página  
✓ **Ventaja**: Fácil de testear (mock los contextos)  

---

## 📦 Dependencias Descargadas

```json
{
  "dependencies": {
    "react": "18.3.1",              // UI library
    "react-dom": "18.3.1",          // React DOM renderer
    "@supabase/supabase-js": "2.57.4", // Cliente Supabase (preparado)
    "framer-motion": "11.0.3",       // Animaciones
    "recharts": "2.10.3",            // Gráficas
    "lucide-react": "0.344.0"        // Icons
  },
  "devDependencies": {
    "vite": "5.4.2",                // Build tool
    "typescript": "5.5.3",          // Type safety
    "tailwindcss": "3.4.1",         // Styling
    "@vitejs/plugin-react": "4.3.1", // React + Vite
    "autoprefixer": "10.4.18",      // CSS vendor prefixes
    "postcss": "8.4.35"             // CSS transformation
  }
}
```

### **Para Qué Sirve Cada Una**

| Librería | Función | Peso | Alternativa |
|----------|---------|------|------------|
| **React** | Framework UI | ~42KB | Vue, Svelte |
| **Vite** | Build tool | - | Webpack, Parcel |
| **TypeScript** | Type checking | - | Flow, JSDoc |
| **TailwindCSS** | Estilos | ~14KB | Bootstrap, Material UI |
| **Framer Motion** | Animaciones | ~65KB | React Spring, Animate.css |
| **Recharts** | Gráficas | ~100KB | Chart.js, D3.js |
| **Lucide React** | Icons | ~200 icons | Font Awesome, Material Icons |
| **Supabase** | Database/Auth | ~70KB | Firebase, PgSQL |

---

## 🔄 Preparación para Supabase

### **Arquitectura Lista para Migración**

**Fase 1: Actual (Mock)**
```
localStorage
     ↑
DataContext + AuthContext (Mock data)
     ↑
Componentes
```

**Fase 2: Después de Supabase (1 línea de cambio)**
```
Supabase Database
     ↑
Services (auth.ts, orders.ts, analytics.ts)
     ↑
DataContext + AuthContext (consume services)
     ↑
Componentes (SIN CAMBIOS)
```

### **Ubicaciones de TODOs**

```
src/services/
├── auth.ts          # TODO: Usar supabase.auth
├── orders.ts        # TODO: Usar supabase.from('orders')
└── analytics.ts     # TODO: Usar supabase.rpc()

src/lib/
└── supabase.ts      # TODO: import createClient()
```

### **Cambios Requeridos (Estimado: 2-3 horas)**

```typescript
// ANTES (Mock)
export const authService = {
  login: async (email, password) => {
    await wait(500);
    return { success: true };
  }
}

// DESPUÉS (Supabase)
import { supabase } from '../lib/supabase';

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, user: data.user };
  }
}

// El resto de la app NO cambia
```

---

## 🎯 Resumen Arquitectónico

### **Principios Implementados**

| Principio | Implementación |
|-----------|---|
| **Separation of Concerns** | Componentes UI, Contextos, Services separados |
| **Single Responsibility** | Cada archivo hace UNA cosa |
| **DRY (Don't Repeat Yourself)** | Componentes reutilizables, sin duplicación |
| **SOLID** | Interfaces limpias, bajo acoplamiento |
| **Composición** | Uso de Context, hooks, no herencia |

### **Ventajas de Esta Arquitectura**

✅ **Mantenibilidad**: Código limpio y organizado  
✅ **Escalabilidad**: Fácil agregar nuevas páginas  
✅ **Testabilidad**: Componentes y lógica aislados  
✅ **Reutilización**: Máxima reutilización de código  
✅ **Migración**: Súper fácil cambiar de mock a Supabase  
✅ **Reemplazabilidad**: Cambios internos sin romper el resto  
✅ **Independencia**: Cada módulo es independiente  

### **Flujos Típicos**

```
Usuario Nuevo
  → RegisterPage
  → useAuth().register()
  → localStorage.setItem()
  → Redirige a Dashboard

Crear Pedido
  → NewOrderPage
  → Formulario 3 pasos
  → useData().addOrder()
  → localStorage.setItem()
  → Notificación
  → ResellerOrdersPage se actualiza

Cambiar Estado Pedido
  → AdminOrdersPage
  → Click en nuevo estado
  → useData().updateOrderStatus()
  → localStorage actualiza
  → Timeline se agrega automáticamente
```

---

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXUS APP                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   App.tsx Router    │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
    ┌──────────────┐                        ┌──────────────┐
    │ AuthProvider │                        │ DataProvider │
    │ (Usuario)    │                        │ (Negocio)    │
    └──────────────┘                        └──────────────┘
        ↓                                           ↓
    ┌──────────────┐                        ┌──────────────┐
    │  useAuth()   │                        │  useData()   │
    └──────────────┘                        └──────────────┘
        ↓                                           ↓
    ┌────────────────────────────────────────────────────────┐
    │              Componentes / Páginas                      │
    │  (Consumidores de contextos, sin lógica de negocio)   │
    └────────────────────────────────────────────────────────┘
        ↓
    ┌────────────────────────────────────────────────────────┐
    │            localStorage Persistence                     │
    │  nexus_auth     | nexus_orders     | nexus_*           │
    └────────────────────────────────────────────────────────┘

FUTURA CONEXIÓN SUPABASE:
    Services (auth.ts, orders.ts) ← → Supabase API
    ↓
    Contextos (sin cambios)
    ↓
    Componentes (sin cambios)
```

---

## 🎓 Conclusión

**NEXUS está diseñada para ser**:
- **Modular**: Cada parte es independiente
- **Escalable**: Fácil agregar nuevas features
- **Mantenible**: Código limpio y organizado
- **Testeable**: Componentes aislados
- **Flexible**: Fácil migrar a diferentes tecnologías

**El código está 100% preparado para Supabase**. Solo necesitas descomentar algunos imports y reemplazar las funciones mock en `src/services/`.

