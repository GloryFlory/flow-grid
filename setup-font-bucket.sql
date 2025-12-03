-- Create custom-fonts bucket for font file storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-fonts', 'custom-fonts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access for custom-fonts"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-fonts');

-- Allow authenticated users to upload (for festival owners)
CREATE POLICY "Authenticated users can upload custom-fonts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-fonts');
