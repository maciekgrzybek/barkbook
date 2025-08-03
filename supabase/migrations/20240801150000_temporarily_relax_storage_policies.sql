-- Temporarily relax storage policies for debugging
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow salon owners to upload visit photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow salon owners to view visit photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow salon owners to delete visit photos" ON storage.objects;

-- Create more permissive policies for debugging
CREATE POLICY "Allow authenticated users to upload visit photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'visit-photos' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view visit photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'visit-photos' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete visit photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'visit-photos' 
    AND auth.role() = 'authenticated'
); 