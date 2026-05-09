/*
  # Fix storage policies to avoid RLS recursion

  The "Admins can upload proofs" and "Admins can delete proofs" policies
  subquery the users table, which can cause recursion. Replace with
  the get_current_user_role() helper function.
*/

DROP POLICY IF EXISTS "Admins can upload proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete proofs" ON storage.objects;

CREATE POLICY "Admins can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proofs' 
    AND get_current_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'proofs'
    AND get_current_user_role() IN ('admin', 'super_admin')
  );
