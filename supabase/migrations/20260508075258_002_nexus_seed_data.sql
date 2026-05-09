/*
  # NEXUS Seed Data

  1. Initial Data
    - Default costs row
    - Reseller level thresholds (basic, pro, micro_brand, distributor)
    - Shipping companies (Uno Express, Ferguson)
    - System settings
    - Sample rewards

  2. Important Notes
    - Costs row must exist for order calculations
    - Levels define the progression system
    - Settings include WhatsApp number, platform name, etc.
*/

-- Default costs
INSERT INTO costs (id, material_cost, ink_cost, paper_cost, electricity_cost, labor_cost, packaging_cost, shipping_cost, maintenance_cost, platform_commission, reseller_margin, nexus_margin)
VALUES (
  gen_random_uuid(),
  5.00, 2.00, 1.00, 0.50, 4.00, 1.50, 8.50, 1.00,
  0.05, 0.40, 0.30
) ON CONFLICT DO NOTHING;

-- Reseller levels
INSERT INTO reseller_levels (level, min_sales, max_sales, badge, benefits, monthly_goal) VALUES
  ('basic', 1, 14, 'Principiante', ARRAY['Acceso a pedidos básicos', 'Soporte por WhatsApp'], 500),
  ('pro', 15, 49, 'Profesional', ARRAY['Descuento 5% en producción', 'Prioridad en pedidos', 'Soporte prioritario'], 1500),
  ('micro_brand', 50, 99, 'Micro Marca', ARRAY['Descuento 10% en producción', 'Acceso a diseños exclusivos', 'Dashboard avanzado', 'Badge premium'], 3000),
  ('distributor', 100, NULL, 'Distribuidor', ARRAY['Descuento 15% en producción', 'Acceso total a diseños', 'Comisiones aumentadas', 'Badge exclusivo', 'Manager dedicado'], 5000)
ON CONFLICT (level) DO NOTHING;

-- Shipping companies
INSERT INTO shipping_companies (name, slug, base_cost) VALUES
  ('Uno Express', 'uno-express', 8.50),
  ('Ferguson', 'ferguson', 12.00)
ON CONFLICT (slug) DO NOTHING;

-- System settings
INSERT INTO settings (key, value, description) VALUES
  ('whatsapp_number', '50764987682', 'WhatsApp number for comprobantes'),
  ('platform_name', 'NEXUS', 'Platform display name'),
  ('platform_currency', 'USD', 'Default currency'),
  ('unit_production_cost', '16.00', 'Base production cost per unit'),
  ('max_file_size_mb', '10', 'Maximum file upload size in MB')
ON CONFLICT (key) DO NOTHING;

-- Sample rewards
INSERT INTO rewards (name, description, icon, required_level, required_xp) VALUES
  ('Primera Venta', 'Completaste tu primera venta', 'trophy', 'basic', 0),
  ('Vendedor Constante', '5 ventas en un mes', 'flame', 'basic', 50),
  ('Pro en Ascenso', 'Alcanzaste el nivel Pro', 'trending-up', 'pro', 150),
  ('Micro Marca', 'Tu marca está creciendo', 'crown', 'micro_brand', 500),
  ('Distribuidor Elite', 'Eres un distribuidor oficial', 'gem', 'distributor', 1000),
  ('Racha de Fuego', '7 días consecutivos con ventas', 'zap', 'basic', 70),
  ('Cien Ventas', 'Alcanzaste 100 ventas totales', 'star', 'distributor', 1000)
ON CONFLICT DO NOTHING;
