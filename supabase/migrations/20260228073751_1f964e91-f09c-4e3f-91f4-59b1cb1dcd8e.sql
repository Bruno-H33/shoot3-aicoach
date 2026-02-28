-- 1. Fix access_codes: remove public SELECT, keep service_role only
DROP POLICY IF EXISTS "Anyone can read access codes" ON public.access_codes;

-- 2. Make analysis-frames bucket private
UPDATE storage.buckets SET public = false WHERE id = 'analysis-frames';

-- 3. Drop the public SELECT policy on storage objects for analysis-frames
DROP POLICY IF EXISTS "Frames are publicly accessible" ON storage.objects;

-- 4. Create owner-only read policy for frames
CREATE POLICY "Users can read their own frames"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'analysis-frames' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Ensure upload policy scoped to owner
DROP POLICY IF EXISTS "Users can upload their own frames" ON storage.objects;
CREATE POLICY "Users can upload their own frames"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'analysis-frames' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Allow users to delete their own frames
DROP POLICY IF EXISTS "Users can delete their own frames" ON storage.objects;
CREATE POLICY "Users can delete their own frames"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'analysis-frames' AND
  auth.uid()::text = (storage.foldername(name))[1]
);