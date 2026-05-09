/*
  # NEXUS Platform Core Schema

  1. New Tables
    - `users` - Extended user profiles with roles, levels, XP, company info
    - `orders` - Full order management with pricing breakdown, tracking, priority
    - `order_timeline` - Status change history for each order
    - `uploaded_files` - File metadata for designs, references, proofs
    - `costs` - System-wide cost configuration (material, ink, labor, etc.)
    - `reseller_levels` - Level thresholds and rewards configuration
    - `rewards` - Unlockable rewards and achievements
    - `user_rewards` - Per-user reward unlock tracking
    - `notifications` - User notifications (order updates, rewards, system alerts)
    - `announcements` - Admin-published promotions and news
    - `shipping_companies` - Configurable shipping providers
    - `settings` - System-wide key-value configuration
    - `analytics_daily` - Daily aggregated metrics for dashboards

  2. Security
    - RLS enabled on ALL tables
    - Resellers can only see their own data (orders, files, notifications, rewards)
    - Admins can see all data
    - Super admins have full access
    - Public registration only creates reseller role
    - Only super_admin can create admin users

  3. Important Notes
    - Uses auth.uid() for user identity
    - users.auth_id references auth.users.id via FK
    - Order numbers auto-generated as NX-XXXXXX format
    - Level system: 1 sale=basic, 15=pro, 50=micro_brand, 100=distributor
    - Costs table has single row for system-wide defaults
*/

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'reseller' CHECK (role IN ('reseller', 'admin', 'super_admin')),
  level text NOT NULL DEFAULT 'basic' CHECK (level IN ('basic', 'pro', 'micro_brand', 'distributor')),
  xp integer NOT NULL DEFAULT 0,
  sales_count integer NOT NULL DEFAULT 0,
  company_name text DEFAULT '',
  address text DEFAULT '',
  province text DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id AND role = (SELECT role FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Super admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'super_admin')
    OR (auth.uid() = auth_id AND role = 'reseller')
  );

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Super admin can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  reseller_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  province text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  product_name text NOT NULL,
  product_type text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0),
  size text DEFAULT '',
  color text DEFAULT '',
  notes text DEFAULT '',
  payment_method text NOT NULL DEFAULT 'yappy' CHECK (payment_method IN ('yappy', 'transfer')),
  shipping_company text NOT NULL DEFAULT 'uno-express' CHECK (shipping_company IN ('uno-express', 'ferguson')),
  shipping_cost numeric NOT NULL DEFAULT 0,
  production_cost numeric NOT NULL DEFAULT 0,
  reseller_profit numeric NOT NULL DEFAULT 0,
  nexus_profit numeric NOT NULL DEFAULT 0,
  platform_commission numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'production', 'finished', 'shipped', 'delivered', 'cancelled')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tracking_code text DEFAULT '',
  delivery_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resellers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    reseller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Resellers can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    reseller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Resellers can update own orders limited"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    reseller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    reseller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- ORDER TIMELINE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read timeline for accessible orders"
  ON order_timeline FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE reseller_id = (SELECT id FROM users WHERE auth_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can insert timeline events"
  ON order_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- UPLOADED FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  category text NOT NULL DEFAULT 'design' CHECK (category IN ('design', 'reference', 'proof')),
  filename text NOT NULL,
  storage_path text NOT NULL,
  content_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own uploaded files"
  ON uploaded_files FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can upload files for own orders"
  ON uploaded_files FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can delete files"
  ON uploaded_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- COSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_cost numeric NOT NULL DEFAULT 5.00,
  ink_cost numeric NOT NULL DEFAULT 2.00,
  paper_cost numeric NOT NULL DEFAULT 1.00,
  electricity_cost numeric NOT NULL DEFAULT 0.50,
  labor_cost numeric NOT NULL DEFAULT 4.00,
  packaging_cost numeric NOT NULL DEFAULT 1.50,
  shipping_cost numeric NOT NULL DEFAULT 8.50,
  maintenance_cost numeric NOT NULL DEFAULT 1.00,
  platform_commission numeric NOT NULL DEFAULT 0.05,
  reseller_margin numeric NOT NULL DEFAULT 0.40,
  nexus_margin numeric NOT NULL DEFAULT 0.30,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read costs"
  ON costs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update costs"
  ON costs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Super admin can insert costs"
  ON costs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================
-- RESELLER LEVELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reseller_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL UNIQUE CHECK (level IN ('basic', 'pro', 'micro_brand', 'distributor')),
  min_sales integer NOT NULL,
  max_sales integer,
  badge text NOT NULL DEFAULT '',
  benefits text[] NOT NULL DEFAULT '{}',
  monthly_goal numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reseller_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read levels"
  ON reseller_levels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage levels"
  ON reseller_levels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update levels"
  ON reseller_levels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'award',
  required_level text DEFAULT 'basic' CHECK (required_level IN ('basic', 'pro', 'micro_brand', 'distributor')),
  required_xp integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage rewards"
  ON rewards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update rewards"
  ON rewards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete rewards"
  ON rewards FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- USER REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_id)
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rewards"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "System can insert user rewards"
  ON user_rewards FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'warning', 'info', 'order_update', 'reward', 'level_up')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can create notifications for any user"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('promotion', 'news', 'update', 'alert')),
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can read all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- SHIPPING COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  base_cost numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read shipping companies"
  ON shipping_companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage shipping companies"
  ON shipping_companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update shipping companies"
  ON shipping_companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  description text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- ANALYTICS DAILY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_orders integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_nexus_profit numeric NOT NULL DEFAULT 0,
  total_reseller_profit numeric NOT NULL DEFAULT 0,
  total_production_cost numeric NOT NULL DEFAULT 0,
  total_shipping_cost numeric NOT NULL DEFAULT 0,
  new_resellers integer NOT NULL DEFAULT 0,
  active_resellers integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date)
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage analytics"
  ON analytics_daily FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update analytics"
  ON analytics_daily FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_reseller_id ON orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_order_id ON uploaded_files(order_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date DESC);
