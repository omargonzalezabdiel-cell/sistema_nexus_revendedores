/*
  # Fix RLS infinite recursion on users table + add avatar_url

  1. Problem
    Policies on `users` table queried `users` within their own policies, causing infinite recursion.

  2. Solution
    - Create a SECURITY DEFINER helper function `get_current_user_role()` that bypasses RLS
    - All policies use this function instead of subquerying the users table
    - Recreate ALL policies across all tables to eliminate recursion

  3. Additional Changes
    - Add avatar_url column to users table
*/

-- Helper function to avoid RLS recursion
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Super admin can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Super admin can delete users" ON users;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id AND role = 'reseller');

CREATE POLICY "Super admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() = 'super_admin');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Super admin can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (get_current_user_role() = 'super_admin');

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Resellers can read own orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Resellers can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update any order" ON orders;
DROP POLICY IF EXISTS "Resellers can update own orders limited" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

CREATE POLICY "Resellers can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    reseller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
    OR get_current_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Resellers can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    reseller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Resellers can update own pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    reseller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
    AND status = 'pending'
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- ORDER_TIMELINE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can read timeline for accessible orders" ON order_timeline;
DROP POLICY IF EXISTS "Admins can insert timeline events" ON order_timeline;

CREATE POLICY "Users can read timeline for accessible orders"
  ON order_timeline FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE reseller_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1))
    OR get_current_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can insert timeline events"
  ON order_timeline FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- UPLOADED_FILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can read own uploaded files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can upload files for own orders" ON uploaded_files;
DROP POLICY IF EXISTS "Admins can delete files" ON uploaded_files;

CREATE POLICY "Users can read own uploaded files"
  ON uploaded_files FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
    OR get_current_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Users can upload files for own orders"
  ON uploaded_files FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Admins can delete files"
  ON uploaded_files FOR DELETE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- COSTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admins can read costs" ON costs;
DROP POLICY IF EXISTS "Admins can update costs" ON costs;
DROP POLICY IF EXISTS "Super admin can insert costs" ON costs;

CREATE POLICY "Admins can read costs"
  ON costs FOR SELECT
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update costs"
  ON costs FOR UPDATE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Super admin can insert costs"
  ON costs FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() = 'super_admin');

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON notifications;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  );

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- ANNOUNCEMENTS POLICIES
-- ============================================
CREATE POLICY "Anyone can read active announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can read all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- ANALYTICS_DAILY POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admins can read analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Admins can manage analytics" ON analytics_daily;
DROP POLICY IF EXISTS "Admins can update analytics" ON analytics_daily;

CREATE POLICY "Admins can read analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert analytics"
  ON analytics_daily FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update analytics"
  ON analytics_daily FOR UPDATE
  TO authenticated
  USING (get_current_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- ADD avatar_url TO USERS TABLE
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text DEFAULT '';
  END IF;
END $$;
