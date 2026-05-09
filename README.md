# NEXUS - Plataforma Premium de Gestión de Revendedores

![NEXUS](./public/mi_logo.png)

Una plataforma web moderna, futurista y profesional para gestión integral de revendedores, producción de pedidos, seguimiento de ganancias y control administrativo. Sistema ERP completo con interfaz elegante, gráficas avanzadas y automatización de cálculos.

## Características Destacadas

### 🔐 Autenticación Completa
- Sistema de **Login** seguro
- **Registro** con validaciones en 3 pasos
- Sesión persistente en localStorage
- Dos roles: Revendedor y Administrador
- Demo buttons para acceso rápido

### 👤 Panel Revendedor
- **Dashboard**: Estadísticas en tiempo real
- **Crear Pedidos**: Formulario inteligente de 3 pasos
- **Mi Historial**: Pedidos con timeline visual
- **Ganancias**: Análisis con gráficas interactivas
- **Niveles**: Sistema de progresión con 4 niveles
- **Analíticas**: KPIs personalizados

### 👑 Panel Administrativo
- **Dashboard Global**: Resumen de operaciones
- **Gestión Pedidos**: Control de estados en tiempo real
- **Gestión Revendedores**: Rankings y estadísticas
- **Gestión Costos**: Editor inteligente de estructura
- **Analíticas Avanzadas**: Gráficas y reportes

### 💰 Sistema Inteligente de Costos
- 9 parámetros ajustables
- Cálculo automático de ganancias
- Distribución: 40% revendedor, 30% NEXUS
- Proyecciones en tiempo real

### 📊 Visualización de Datos
- **Recharts**: Gráficas interactivas
- Line charts, bar charts, pie charts
- Dashboards responsivos
- Datos históricos y proyecciones

## Tecnologías

- **React** 18.3 + TypeScript 5.5
- **Vite** 5.4 (Build ultrarápido)
- **TailwindCSS** 3.4 (Estilos premium)
- **Framer Motion** 11 (Animaciones)
- **Recharts** 2.10 (Gráficas)
- **Lucide React** (Icons)
- **Context API** + localStorage

## Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
# Abre http://localhost:5173
```

### Build Producción
```bash
npm run build
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

## Credenciales Demo

### Opción 1: Demo Buttons
En la página de login, usa los botones "Admin Demo" o "Revendedor Demo" para acceso inmediato.

### Opción 2: Credenciales Manuales
**Revendedor**
- Email: `reseller@nexus.com`
- Password: `demo123`

**Administrador**
- Email: `admin@nexus.com`
- Password: `demo123`

### Opción 3: Crear Cuenta
1. Click en "Registrate aquí"
2. Completa el formulario de 3 pasos
3. ¡Tu cuenta está lista!

## Estructura del Proyecto

```
src/
├── components/
│   └── ui/                 # Componentes reutilizables
├── context/
│   ├── AuthContext.tsx     # Autenticación global
│   └── DataContext.tsx     # Estado de datos
├── pages/                  # 13 páginas principales
├── layouts/
│   ├── MainLayout.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── hooks/
│   └── useNavigation.ts    # Routing personalizado
├── services/
│   ├── auth.ts
│   ├── orders.ts
│   └── analytics.ts
├── lib/
│   └── supabase.ts         # Cliente Supabase (preparado)
├── data/
│   └── mockData.ts         # Datos simulados
├── types/
│   └── index.ts            # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## Páginas Implementadas

### Autenticación (2)
- 🔑 LoginPage
- ✍️ RegisterPage

### Revendedor (6)
- 📊 Dashboard
- 🛒 Crear Pedido
- 📦 Mis Pedidos
- 💰 Ganancias
- 🏆 Niveles
- 📈 Analíticas

### Administrador (7)
- 📊 Dashboard Admin
- 📋 Gestión Pedidos
- 👥 Gestión Revendedores
- 💵 Gestión Costos
- 📊 Analíticas Avanzadas
- ⚙️ Producción
- 🔧 Configuración

## Diseño Visual

### Paleta de Colores
- **Negro Profundo**: `#0a0e27`
- **Oro Elegante**: `#d4af37`
- **Cian Neon**: `#00d4ff`
- **Plateado**: `#c0c0c0`

### Efectos
- Glassmorphism en tarjetas
- Neon glow suave
- Blur backgrounds
- Animaciones Framer Motion
- Hover states elaborados
- Responsive design

## Características Sistema

### Sistema de Niveles
- Nivel 1: Básico (1+ venta)
- Nivel 2: Pro (15+ ventas)
- Nivel 3: Micro Marca (50+ ventas)
- Nivel 4: Distribuidor (100+ ventas)

### Estados de Pedidos
- Pending
- Confirmed
- Production
- Finished
- Shipped
- Delivered
- Cancelled

### Empresas de Envío
- Uno Express
- Ferguson

### Métodos de Pago
- Yappy
- Transferencia Bancaria

## Performance

- **Build Time**: ~9.85 segundos
- **Bundle Size**: 763.73 KB (214.37 KB gzip)
- **Optimizado**: Tree-shaking, lazy loading ready
- **Responsive**: Mobile, tablet, desktop

## Documentación

- **NEXUS_PLATFORM.md** - Documentación técnica completa
- **GUIA_RAPIDA.md** - Guía de uso rápido
- **Comentarios en código** - Explicaciones donde sea necesario

## Preparado para Supabase

El proyecto está 100% listo para integración con Supabase:
- ✓ Estructura escalable
- ✓ Services listos para conectar
- ✓ Types TypeScript completos
- ✓ Mock data para desarrollo
- ✓ RLS compatible

Cambios mínimos necesarios para activar conexión real (busca `// TODO: Conectar Supabase`).

## Validaciones Incluidas

- ✓ Validación de email
- ✓ Validación de contraseña
- ✓ Confirmación de contraseña
- ✓ Campos requeridos
- ✓ Formateo automático
- ✓ Mensajes de error claros

## Data Mock

Incluye datos simulados realistas:
- Pedidos de ejemplo con timeline completo
- Estadísticas mensuales de revendedor
- Estructura de costos predefinida
- 30 días de métricas
- Notificaciones de ejemplo

## Características Extra

- 🔔 Sistema de notificaciones
- 📈 Gráficas interactivas
- 🎨 Dark theme premium
- ⚡ Animaciones suaves
- 📱 Mobile optimizado
- 🔄 Estado global con Context API
- 💾 Persistencia en localStorage

## Próximos Pasos para Supabase

1. Crear tablas en Supabase
2. Configurar RLS policies
3. Conectar Supabase Auth
4. Reemplazar mock data con API real
5. Configurar webhooks
6. Optimizar queries

Ver archivos de servicios para instrucciones específicas.

## Navegadores Soportados

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Licencia

© 2026 NEXUS. Todos los derechos reservados.

## Soporte

Para documentación completa, consulta `NEXUS_PLATFORM.md` y `GUIA_RAPIDA.md`.
