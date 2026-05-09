# NEXUS - Sistema de Gestión de Revendedores y Producción

## Descripción General

NEXUS es una plataforma web premium futurista para gestión integral de revendedores, producción de pedidos, seguimiento de ganancias y control administrativo. Sistema ERP moderno con interfaz elegante, gráficas avanzadas y automatización de cálculos.

## Características Principales

### 🔐 Autenticación Completa
- **Login**: Email + Contraseña con validación
- **Registro**: Formulario multi-paso (3 pasos)
  - Paso 1: Datos personales
  - Paso 2: Seguridad (contraseña)
  - Paso 3: Tipo de cuenta + empresa
- **Roles**: Revendedor y Administrador
- **Dashboard diferenciado** por rol
- **Sesión persistente** en localStorage
- **Validaciones**: Email, contraseña, confirmar contraseña
- **Demo buttons** para prueba rápida

### 👤 Panel Revendedor
- **Dashboard**: Estadísticas en tiempo real, pedidos activos, ganancias, progreso de metas
- **Crear Pedidos**: Formulario multi-paso con cálculo automático de ganancias
- **Mis Pedidos**: Historial completo con timeline de estados
- **Ganancias**: Análisis de ingresos por día, semana, mes con gráficas
- **Nivel y Recompensas**: Sistema de progresión, logros desbloqueables
- **Analíticas**: KPIs personalizados, tendencias, recomendaciones

### 👑 Panel Administrativo
- **Dashboard Admin**: Resumen general, top revendedores, KPIs principales
- **Gestión de Pedidos**: Cambio de estados, timeline, detalles completos
- **Gestión de Revendedores**: Tabla con información completa, ranking
- **Gestión de Costos**: Editor inteligente de estructura de costos
- **Analíticas Avanzadas**: Productos populares, estados, ingresos vs costos mensuales

### 💰 Sistema Inteligente de Costos
- Costos configurables por el administrador:
  - Material, tinta, papel, electricidad, mano de obra
  - Empaque, envío base, mantenimiento, comisión plataforma
- Cálculo automático de ganancias en cada pedido
- Distribución: 40% revendedor, 30% NEXUS, resto costos

### 🏆 Sistema de Niveles
- **Nivel 1 - Básico**: 1+ venta
- **Nivel 2 - Pro**: 15+ ventas
- **Nivel 3 - Micro Marca**: 50+ ventas
- **Nivel 4 - Distribuidor**: 100+ ventas
- Badges, barras de progreso, recompensas desbloqueables

### 📊 Gráficas y Analíticas
- Recharts integrado para visualizaciones
- Gráficas de línea, barras, pie charts
- Dashboard responsivo con datos en tiempo real
- Proyecciones mensuales y análisis históricos

### 🔔 Sistema de Notificaciones
- Toast notifications en tiempo real
- Alertas por eventos: pedidos, niveles, metas
- Bandeja de notificaciones en navbar

### 🚚 Gestión de Pedidos
- Estados completos: Pending → Confirmed → Production → Finished → Shipped → Delivered
- Timeline visual de eventos
- Empresas de envío: Uno Express, Ferguson
- Métodos de pago: Yappy, Transferencia

### 📁 Subida de Archivos
- Drag and drop para diseños
- Soporta: PNG, JPG, SVG, PDF
- Mock local (preparado para Supabase)

## Tecnologías Utilizadas

- **Frontend**: React 18.3 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4 + Autoprefixer
- **Gráficas**: Recharts 2.10
- **Animaciones**: Framer Motion 11
- **Icons**: Lucide React 0.344
- **Estado**: Context API + localStorage
- **Database**: Preparado para Supabase (mock actualmente)

## Estructura del Proyecto

```
src/
├── components/
│   └── ui/                 # Componentes reutilizables
│       ├── GlassCard.tsx
│       ├── StatCard.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── index.ts
├── context/
│   ├── AuthContext.tsx     # Autenticación global
│   └── DataContext.tsx     # Estado de datos
├── pages/
│   ├── LoginPage.tsx
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
├── layouts/
│   ├── MainLayout.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── hooks/
│   └── useNavigation.ts    # Routing personalizado
├── services/
│   ├── auth.ts             # TODO: Conectar Supabase Auth
│   ├── orders.ts           # TODO: Conectar API pedidos
│   └── analytics.ts        # TODO: Conectar analíticas
├── lib/
│   └── supabase.ts         # TODO: Cliente Supabase
├── data/
│   └── mockData.ts         # Datos mock
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx                 # Router principal
├── main.tsx
└── index.css
```

## Acceso a la Plataforma

### Opción 1: Usar Credenciales Demo
**Revendedor**
- Email: `reseller@nexus.com`
- Password: `demo123`
- Rol: Revendedor
- Panel: `/reseller/dashboard`

**Administrador**
- Email: `admin@nexus.com`
- Password: `demo123`
- Rol: Admin
- Panel: `/admin/dashboard`

### Opción 2: Crear Nueva Cuenta
- Ir a `/register` 
- Completar formulario en 3 pasos:
  1. Información personal (nombre, apellido, email)
  2. Seguridad (contraseña, confirmación)
  3. Tipo de cuenta (Revendedor o Administrador)
- Se requiere nombre de empresa para revendedores
- Validación completa de formulario incluida

## Uso

### Desarrollo
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

### Type Check
```bash
npm run typecheck
```

## Preparación para Supabase

El código está 100% preparado para conectar Supabase. Las áreas de integración:

### 1. Autenticación (`src/services/auth.ts`)
```typescript
// TODO: Conectar Supabase
// import { supabase } from '../lib/supabase';
// await supabase.auth.signInWithPassword({ email, password })
```

### 2. Base de Datos
Tablas necesarias:
- `users` - Datos de usuario
- `orders` - Pedidos completos
- `costs` - Estructura de costos
- `reseller_stats` - Estadísticas revendedor
- `notifications` - Notificaciones

### 3. Seguridad
- Row Level Security (RLS) por usuario
- Policies para acceso basado en rol
- JWT authentication

### 4. API Calls
Todos los servicios en `src/services/` tienen comentarios `// TODO: Conectar Supabase`

## Diseño Visual

### Paleta de Colores
- **Negro Profundo**: `#0a0e27` (background)
- **Oro Elegante**: `#d4af37` (primario)
- **Plateado**: `#c0c0c0` (secundario)
- **Cian**: `#00d4ff` (accento)

### Efectos
- Glassmorphism en tarjetas
- Neon glow suave en elementos
- Blur backgrounds en layers
- Animaciones Framer Motion
- Hover states elaborados

## Mock Data

Incluye datos simulados para:
- 2+ pedidos completos por revendedor
- Timeline de eventos para cada pedido
- Estadísticas mensuales
- Estructura de costos predefinida
- Notificaciones ejemplo
- 30 días de métricas

## Rutas Disponibles

### Revendedor
- `/reseller/dashboard` - Panel principal
- `/reseller/orders` - Mis pedidos
- `/reseller/new-order` - Crear pedido
- `/reseller/earnings` - Ganancias
- `/reseller/rewards` - Niveles y recompensas
- `/reseller/analytics` - Mis analíticas

### Administrador
- `/admin/dashboard` - Panel principal
- `/admin/orders` - Gestión de pedidos
- `/admin/costs` - Gestión de costos
- `/admin/resellers` - Gestión de revendedores
- `/admin/analytics` - Analíticas avanzadas
- `/admin/production` - Control de producción
- `/admin/settings` - Configuración

## Performance

- Build optimizado: 756KB (213KB gzip)
- Lazy loading de componentes
- Recharts optimizado para grandes datasets
- localStorage para cache local

## Responsive Design

- Mobile first
- Breakpoints: sm, md, lg
- Sidebar colapsable en móvil
- Grid adaptativo
- Touch-friendly buttons

## Próximos Pasos

1. Conectar Supabase Database
2. Implementar RLS Policies
3. Migrar a Supabase Auth
4. Integrar APIs reales
5. Edge Functions para cálculos
6. Webhooks para notificaciones
7. Storage para archivos

## Notas Importantes

- Los datos se guardan en localStorage (no persisten entre navegadores)
- La autenticación es mock (credenciales no validadas)
- Los archivos subidos no se almacenan (mock)
- Los cálculos son simulados pero realistas
- Todas las gráficas son interactivas

## Soporte para Supabase

Todos los TODOs están marcados en:
- `src/services/*.ts`
- `src/lib/supabase.ts`
- Comentarios en componentes que interactúan con datos

Cambios mínimos necesarios para activar conexión real.
