-- Create storage bucket for analysis frames
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-frames', 'analysis-frames', true);

-- Allow authenticated users to upload their own frames
CREATE POLICY "Users can upload their own frames"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'analysis-frames' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to frames
CREATE POLICY "Frames are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'analysis-frames');

-- Allow users to delete their own frames
CREATE POLICY "Users can delete their own frames"
ON storage.objects FOR DELETE
USING (bucket_id = 'analysis-frames' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add frames_urls column to analyses table
ALTER TABLE public.analyses ADD COLUMN frames_urls text[] DEFAULT '{}';
