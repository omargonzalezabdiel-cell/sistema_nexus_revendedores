# NEXUS - Guía Completa de Dependencias

## 📦 Tabla de Contenidos

1. [Overview](#overview)
2. [Dependencias Principales](#dependencias-principales)
3. [Dependencias de Desarrollo](#dependencias-de-desarrollo)
4. [Cómo Se Usan](#cómo-se-usan)
5. [Flujo de Dependencias](#flujo-de-dependencias)
6. [Por Qué Cada Una](#por-qué-cada-una)

---

## 🎯 Overview

```json
{
  "dependencies": 7,     // Librerías en producción
  "devDependencies": 12, // Librerías solo en desarrollo
  "total": 19,          // Librerías totales
  "bundleSize": "214KB gzip" // Tamaño final optimizado
}
```

**Filosofía**: Mínimas dependencias, máxima funcionalidad.

---

## 📚 Dependencias Principales

### **1. React 18.3.1** - Framework UI

**¿Qué es?**
```typescript
import React from 'react';

// Permite escribir componentes como funciones
export const MyComponent = () => {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Dónde se usa**:
- Todos los archivos `.tsx`
- Hooks: `useState`, `useEffect`, `useContext`
- JSX sintaxis

**Peso**: ~42 KB  
**Alternativas**: Vue, Svelte, Angular

**Ejemplo en NEXUS**:
```typescript
// src/pages/LoginPage.tsx
import React, { useState } from 'react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <form onSubmit={handleSubmit}>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
};
```

---

### **2. React-DOM 18.3.1** - Renderizador Web

**¿Qué es?**
```typescript
import { createRoot } from 'react-dom/client';
import App from './App';

// Renderiza React en el DOM
createRoot(document.getElementById('root')!).render(<App />);
```

**Responsabilidad**: Conectar React con el navegador  
**Uso en NEXUS**: Solo en `src/main.tsx`

**Peso**: Incluido con React

---

### **3. Framer Motion 11.0.3** - Animaciones

**¿Qué es?**
Librería para animaciones declarativas en React.

```typescript
import { motion } from 'framer-motion';

export const Card = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}      // Estado inicial
    animate={{ opacity: 1, y: 0 }}        // Estado final
    transition={{ duration: 0.5 }}        // Duración
  >
    Contenido con animación
  </motion.div>
);
```

**Dónde se usa en NEXUS**:
- Apariciones de páginas
- Transiciones entre vistas
- Hover effects
- Expandir/contraer elementos

**Peso**: ~65 KB  
**Alternativas**: React Spring, Animate.css

**Ejemplo Real**:
```typescript
// src/pages/LoginPage.tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
  className="w-full max-w-md"
>
  {/* Card de login con animación de entrada */}
</motion.div>
```

**Casos de Uso**:
```
1. Entrada de página
   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

2. Hover animations
   <motion.button whileHover={{ scale: 1.1 }} />

3. Expandir/Contraer (acordeón)
   <motion.div
     animate={{ height: expanded ? "auto" : 0 }}
     transition={{ duration: 0.3 }}
   />

4. Listas con stagger
   <motion.div variants={container} initial="hidden" animate="show">
     {items.map(item => (
       <motion.div key={item.id} variants={itemVariants} />
     ))}
   </motion.div>
```

---

### **4. Recharts 2.10.3** - Gráficas

**¿Qué es?**
Librería de gráficas declarativas basada en React.

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export const Chart = () => (
  <LineChart data={[
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 150 },
  ]}>
    <XAxis dataKey="date" />
    <YAxis />
    <Line type="monotone" dataKey="value" stroke="#d4af37" />
  </LineChart>
);
```

**Dónde se usa en NEXUS**:
- `AdminDashboardPage.tsx` - Ingresos vs costos
- `EarningsPage.tsx` - Ganancias por día
- `ResellerAnalyticsPage.tsx` - Pedidos por estado
- `AdminAnalyticsPage.tsx` - Productos populares

**Peso**: ~100 KB  
**Alternativas**: Chart.js, D3.js, Apache ECharts

**Tipos de Gráficas Usadas**:
```typescript
1. LineChart - Tendencias en tiempo
   <LineChart data={metricsData}>
     <Line type="monotone" dataKey="earnings" />
   </LineChart>

2. BarChart - Comparación de categorías
   <BarChart data={statusData}>
     <Bar dataKey="count" fill="#d4af37" />
   </BarChart>

3. PieChart - Proporción de total
   <PieChart>
     <Pie data={productData} dataKey="value">
       {productData.map((entry, index) => (
         <Cell key={index} fill={COLORS[index]} />
       ))}
     </Pie>
   </PieChart>
```

---

### **5. Lucide React 0.344.0** - Icons

**¿Qué es?**
Librería de iconos SVG bonitos.

```typescript
import { ShoppingCart, TrendingUp, Bell, LogOut } from 'lucide-react';

export const MyComponent = () => (
  <div>
    <ShoppingCart className="w-6 h-6" />
    <TrendingUp className="w-6 h-6 text-nexus-gold" />
    <Bell className="w-5 h-5 text-gray-400" />
    <LogOut className="w-4 h-4" />
  </div>
);
```

**Dónde se usa en NEXUS**:
- Navbar: Bell (notificaciones), LogOut
- Sidebar: LayoutDashboard, ShoppingCart, TrendingUp, etc.
- Componentes: Mail, Lock, Check, AlertCircle, etc.
- Páginas: Award, Trophy, Star, Award, Flame, etc.

**Peso**: ~200 icons (comprimido)  
**Alternativas**: Font Awesome, Material Icons

**Icons Usados en NEXUS**:
```
Navegación:
- LayoutDashboard, ShoppingCart, BarChart3, Users
- Settings, Zap, Award, TrendingUp, FileText, LogOut

Acciones:
- Plus, Edit2, Trash2, Download, Eye, Send
- Check, CheckCircle, X, ChevronDown, ChevronRight

Indicadores:
- Bell, AlertCircle, TrendingUp, Calendar
- DollarSign, Star, Trophy, Flame, Zap

Información:
- Mail, Lock, User, Building2, ArrowRight, ArrowLeft
```

---

### **6. @supabase/supabase-js 2.57.4** - Backend

**¿Qué es?**
Cliente oficial de Supabase para JavaScript.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://project.supabase.co',
  'public-anon-key'
);

// Usar en servicios
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);
```

**Estado Actual en NEXUS**: **SIN USAR** (solo descargado)  
**Uso Futuro**: Conectar autenticación, base de datos

**Peso**: ~70 KB  
**Alternativas**: Firebase, MongoDB, Railway

**Para Qué Sirve**:
```
- auth.signUp()        → Registro de usuarios
- auth.signIn()        → Login
- from('tabla').insert() → Crear registros
- from('tabla').select() → Leer registros
- from('tabla').update() → Actualizar
- from('tabla').delete() → Eliminar
- rpc()                → Llamar funciones SQL
- realtime()           → Subscripciones en tiempo real
```

---

## 🛠️ Dependencias de Desarrollo

### **1. Vite 5.4.2** - Build Tool

**¿Qué es?**
Herramienta de construcción ultrarápida para aplicaciones web modernas.

**Ventajas sobre Webpack**:
- ⚡ 10-100x más rápido
- 🔥 Hot Module Replacement (HMR) instantáneo
- 📦 Build optimizado automático

**Configuración en NEXUS**:
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    minify: 'terser',
    sourcemap: false
  }
});
```

**Comandos**:
```bash
npm run dev     # Desarrollo con HMR
npm run build   # Producción optimizada
npm run preview # Preview del build
```

---

### **2. TypeScript 5.5.3** - Type Safety

**¿Qué es?**
Lenguaje que agrega tipos a JavaScript.

```typescript
// Sin TypeScript (JavaScript)
function addUser(user) {
  return user.name + user.email; // ¿Qué pasa si faltan propiedades?
}

// Con TypeScript
interface User {
  id: string;
  name: string;
  email: string;
}

function addUser(user: User): string {
  return user.name + user.email; // Seguro, tipos verificados
}
```

**En NEXUS**:
```typescript
// src/types/index.ts
export interface Order {
  id: string;
  resellerId: string;
  clientName: string;
  // ... 10+ propiedades más
  status: OrderStatus;
}

// Las páginas usan estos tipos
const { orders } = useData(); // orders: Order[]
```

**Beneficios**:
- ✅ Autocomplete en editor
- ✅ Errores en compile-time
- ✅ Documentación automática
- ✅ Refactoring seguro

---

### **3. TailwindCSS 3.4.1** - Estilos

**¿Qué es?**
Framework CSS utility-first.

```html
<!-- Sin Tailwind -->
<style>
  .button {
    background-color: #d4af37;
    color: black;
    padding: 12px 24px;
    border-radius: 8px;
    transition: all 0.2s;
  }
</style>
<button class="button">Click</button>

<!-- Con Tailwind -->
<button class="bg-nexus-gold text-black px-6 py-3 rounded-lg transition-all">
  Click
</button>
```

**Configuración en NEXUS**:
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nexus': {
          'dark': '#0a0e27',
          'gold': '#d4af37',
          'silver': '#c0c0c0',
          'accent': '#00d4ff',
        }
      }
    }
  }
};
```

**Clases Usadas en NEXUS**:
```
Colores: text-nexus-gold, bg-nexus-darker
Espaciado: px-6, py-3, mb-4, gap-3
Layout: flex, grid, grid-cols-4
Responsive: md:col-span-2, lg:flex-1
Efectos: rounded-lg, shadow-lg, opacity-50
```

---

### **4. @vitejs/plugin-react 4.3.1**

**¿Qué es?**
Plugin que conecta Vite con React.

```javascript
// vite.config.ts
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  // Permite:
  // - JSX syntax
  // - Fast Refresh (HMR)
  // - TypeScript support
}
```

---

### **5. Autoprefixer 10.4.18**

**¿Qué es?**
Agrega prefijos de navegador automáticamente.

```css
/* Entrada */
.flex {
  display: flex;
}

/* Salida después de Autoprefixer */
.flex {
  display: -webkit-box;
  display: -moz-box;
  display: -webkit-flex;
  display: -moz-flex;
  display: flex;
}
```

**En NEXUS**: Se usa con PostCSS y TailwindCSS

---

### **6. PostCSS 8.4.35**

**¿Qué es?**
Herramienta para transformar CSS.

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},    // Procesa Tailwind
    autoprefixer: {},   // Agrega prefijos
  }
};
```

---

### **7. ESLint 9.9.1** - Linter

**¿Qué es?**
Herramienta que detecta errores en código.

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'no-unused-vars': 'warn'
    }
  }
];
```

**Comando**:
```bash
npm run lint
```

---

## 🔄 Cómo Se Usan

### **Flujo de Importaciones en NEXUS**

```
index.html
  ↓
main.tsx (import { createRoot })
  ├─→ react / react-dom
  ├─→ App.tsx
  │   ├─→ Context (AuthContext, DataContext)
  │   ├─→ Pages
  │   │   ├─→ components/ui (Button, Input, GlassCard)
  │   │   │   ├─→ framer-motion (motion.div)
  │   │   │   └─→ tailwindcss (className)
  │   │   ├─→ layouts (MainLayout, Navbar, Sidebar)
  │   │   │   ├─→ lucide-react (Icons)
  │   │   │   └─→ tailwindcss
  │   │   ├─→ recharts (Gráficas)
  │   │   └─→ @supabase (Futuro)
  │   └─→ hooks/useNavigation
  └─→ index.css
      └─→ tailwindcss (compilado)
```

### **Ejemplo Completo: Crear una Página**

```typescript
// 1. Importar dependencias
import React, { useState } from 'react';           // React
import { motion } from 'framer-motion';           // Animaciones
import { LineChart, Line, XAxis, YAxis } from 'recharts'; // Gráficas
import { TrendingUp } from 'lucide-react';        // Icons
import { useAuth } from '../context/AuthContext'; // Auth Context
import { useData } from '../context/DataContext'; // Data Context
import { MainLayout } from '../layouts/MainLayout'; // Layout
import { StatCard } from '../components/ui';      // Componente UI

// 2. Escribir componente con tipos
interface MyPageProps {}

export const MyPage: React.FC<MyPageProps> = () => {
  // 3. Usar contextos
  const { user } = useAuth();
  const { orders, metrics } = useData();

  // 4. Estado local
  const [filter, setFilter] = useState('all');

  // 5. Renderizar con componentes
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* StatCard: componente reutilizable */}
        <StatCard
          label="Pedidos"
          value={orders.length}
          icon={<TrendingUp />}
        />

        {/* Recharts: gráfica interactiva */}
        <LineChart data={metrics}>
          <XAxis dataKey="date" />
          <YAxis />
          <Line dataKey="value" stroke="#d4af37" />
        </LineChart>
      </motion.div>
    </MainLayout>
  );
};
```

---

## 🌳 Flujo de Dependencias

```
Nivel 0: Browser APIs
  └─ document, window, fetch

Nivel 1: Librerías Base
  ├─ react (proporciona: useState, useContext, etc)
  ├─ react-dom (proporciona: createRoot)
  ├─ typescript (proporciona: tipos)
  └─ @supabase/supabase-js (proporciona: cliente)

Nivel 2: Herramientas de Construcción
  ├─ vite (usa @vitejs/plugin-react)
  ├─ tailwindcss (usa postcss, autoprefixer)
  └─ eslint (usa typescript-eslint)

Nivel 3: Librerías de Funcionalidad
  ├─ framer-motion (usa react, proporciona: animaciones)
  ├─ recharts (usa react, proporciona: gráficas)
  └─ lucide-react (proporciona: icons SVG)

Nivel 4: Código de NEXUS
  ├─ Contextos (usan react)
  ├─ Componentes UI (usan react, framer-motion, tailwindcss)
  ├─ Páginas (usan todo lo anterior)
  └─ Servicios (usan @supabase)
```

---

## 🎯 Por Qué Cada Una

| Dependencia | Razón | Costo | ¿Se Puede Remover? |
|---|---|---|---|
| **react** | Necesaria para UI | Core | No |
| **react-dom** | Renderizar en web | Core | No |
| **typescript** | Type safety | Dev only | Sí (usa JSDoc) |
| **tailwindcss** | Estilos rápidos | 14KB | Sí (usar CSS) |
| **framer-motion** | Animaciones premium | 65KB | Sí (CSS animations) |
| **recharts** | Gráficas | 100KB | Sí (Chart.js) |
| **lucide-react** | Icons bonitos | ~200 icons | Sí (HTML icons) |
| **vite** | Build rápido | Dev only | Sí (Webpack) |
| **@supabase** | Backend futuro | 70KB | Sí (Firebase) |
| **autoprefixer** | CSS compatibilidad | Dev only | No |
| **postcss** | CSS procesado | Dev only | No |
| **eslint** | Code quality | Dev only | Sí |

---

## 📊 Tamaño del Bundle

```
npm run build
  ↓
dist/assets/index-*.js          763.73 KB (217.37 KB gzip)
dist/assets/index-*.css          21.75 KB (4.74 KB gzip)
dist/index.html                   1.23 KB (0.54 KB gzip)

Total: ~785 KB (222 KB gzip) ← Excelente para una app completa
```

**Desglose aproximado**:
- React + React-DOM: ~42 KB
- Recharts: ~100 KB
- Framer Motion: ~65 KB
- TailwindCSS: ~14 KB
- Otros (icons, etc): ~40 KB
- Código de NEXUS: ~522 KB

---

## 🚀 Conclusión

**NEXUS usa solo 7 dependencias de producción**, todas ellas:
- ✅ Mantenidas activamente
- ✅ Ampliamente usadas
- ✅ Ligeras y optimizadas
- ✅ Fáciles de reemplazar

El resultado es una **app moderna, rápida y profesional** sin bloatware innecesario.

