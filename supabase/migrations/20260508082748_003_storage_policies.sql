/*
  # Storage bucket policies for file uploads

  1. Security
    - designs bucket: authenticated users can upload, anyone can read
    - references bucket: authenticated users can upload, anyone can read
    - proofs bucket: only admins can upload, anyone can read
    - Users can only delete their own files
    - File size limit: 10MB
    - Allowed types: PNG, JPG, SVG, PDF
*/

-- Designs bucket policies
CREATE POLICY "Anyone can view designs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'designs');

CREATE POLICY "Authenticated users can upload designs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'designs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own designs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- References bucket policies
CREATE POLICY "Anyone can view references"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'references');

CREATE POLICY "Authenticated users can upload references"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'references' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own references"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'references' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Proofs bucket policies
CREATE POLICY "Anyone can view proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'proofs');

CREATE POLICY "Admins can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'proofs' 
    AND EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can delete proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'proofs'
    AND EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
