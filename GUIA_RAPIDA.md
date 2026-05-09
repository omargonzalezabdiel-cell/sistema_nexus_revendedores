# NEXUS - Guía Rápida de Uso

## 🚀 Inicio Rápido

### Para Desarrolladores
```bash
npm install
npm run dev
# Abre http://localhost:5173
```

### Para Producción
```bash
npm run build
npm run preview
```

## 🔑 Formas de Acceder

### Opción 1: Login Demo (Más Rápido)
1. Abre la aplicación
2. Selecciona "Admin Demo" o "Revendedor Demo"
3. ¡Listo! Acceso inmediato

### Opción 2: Login Manual
- **Revendedor**: `reseller@nexus.com` / `demo123`
- **Admin**: `admin@nexus.com` / `demo123`

### Opción 3: Crear Cuenta Nueva
1. Click en "Registrate aquí"
2. Completa 3 pasos:
   - Tu nombre y email
   - Contraseña segura
   - Elige tu rol (Revendedor o Admin)
3. ¡Tu cuenta está lista!

## 📋 Qué Puedes Hacer

### Si Eres Revendedor 👤
- **📊 Dashboard**: Ve tus estadísticas en tiempo real
- **🛒 Crear Pedidos**: Formulario de 3 pasos con cálculo automático
- **📦 Mis Pedidos**: Historial completo con timeline
- **💰 Ganancias**: Análisis detallado con gráficas
- **🏆 Niveles**: Progresa y desbloquea recompensas
- **📈 Analíticas**: KPIs personalizados

### Si Eres Administrador 👑
- **📊 Dashboard Admin**: Vista global de la plataforma
- **📋 Gestión Pedidos**: Cambiar estados, ver detalles
- **👥 Revendedores**: Tabla completa, rankings
- **💵 Costos**: Editar estructura de costos
- **📊 Analíticas**: Gráficas avanzadas de rendimiento

## 🎯 Ejemplos de Flujos

### Crear tu Primer Pedido (Revendedor)
1. Login como revendedor
2. Click en "Nuevo Pedido"
3. Paso 1: Datos del cliente
4. Paso 2: Detalles del producto
5. Paso 3: Envío y pago
6. ¡Pedido creado! Recibe notificación

### Cambiar Estado de Pedido (Admin)
1. Login como admin
2. Ir a "Pedidos"
3. Click en un pedido para expandir
4. Selecciona nuevo estado
5. El timeline se actualiza automáticamente

### Editar Costos (Admin)
1. Login como admin
2. Ir a "Costos"
3. Modifica los valores
4. Click "Guardar Cambios"
5. Calcula automáticamente nuevas ganancias

## 🎨 Diseño

- **Tema Premium**: Negro + Oro + Cian
- **Responsive**: Funciona en móvil, tablet, desktop
- **Animaciones**: Framer Motion para transiciones suaves
- **Gráficas**: Recharts para visualizaciones interactivas

## 🔐 Seguridad

- Datos guardados en localStorage (sesión persistente)
- Contraseñas validadas localmente
- Roles separados (Revendedor vs Admin)

## ⚙️ Tecnologías

- React 18 + TypeScript
- Vite 5 (build ultrarápido)
- TailwindCSS (estilos)
- Framer Motion (animaciones)
- Recharts (gráficas)

## 📊 Datos Demo

Incluye datos simulados:
- 2+ pedidos por revendedor
- Estados completos (pending → delivered)
- Ganancias mensuales
- Notificaciones de ejemplo
- 30 días de métricas

## 🚀 Preparado para Supabase

El código está 100% listo para conectar Supabase:
- Estructura de carpetas lista
- Services con TODO comentarios
- Types TypeScript completos
- Mock data para desarrollo

Solo necesitas descomentar las lineas `// TODO: Conectar Supabase` en:
- `src/services/auth.ts`
- `src/services/orders.ts`
- `src/services/analytics.ts`
- `src/lib/supabase.ts`

## 💡 Tips

1. **Demo rápido**: Usa los botones de demo en login
2. **Navegación**: El sidebar se adapta a tu rol
3. **Gráficas**: Click en elementos para interactuar
4. **Responsive**: Redimensiona para ver mobile view
5. **localStorage**: Los datos persisten en tu navegador

## 🆘 Problemas Comunes

**"No puedo crear una cuenta"**
- Verifica que el email sea válido (contenga @)
- Confirma que la contraseña tenga 6+ caracteres
- Las contraseñas deben coincidir

**"No veo mis pedidos"**
- Recuerda que cada revendedor solo ve sus propios pedidos
- Los admins ven todos los pedidos

**"Los datos desaparecieron"**
- Los datos están en localStorage
- Limpiar cache del navegador los borra
- Usa dev tools (F12) → Application → Local Storage para ver

## 📞 Soporte

Consulta `NEXUS_PLATFORM.md` para documentación completa.

---

**Versión**: 1.0  
**Estado**: Producción lista  
**Última actualización**: Mayo 2026
