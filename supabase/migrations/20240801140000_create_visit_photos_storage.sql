-- Create storage bucket for visit photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', false);

-- Enable RLS for the bucket
CREATE POLICY "Allow salon owners to upload visit photos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'visit-photos' 
    AND auth.uid() IN (
        SELECT user_id FROM salons 
        WHERE id = (storage.foldername(name))[1]::uuid
    )
);

-- Allow salon owners to view their visit photos
CREATE POLICY "Allow salon owners to view visit photos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'visit-photos' 
    AND auth.uid() IN (
        SELECT user_id FROM salons 
        WHERE id = (storage.foldername(name))[1]::uuid
    )
);

-- Allow salon owners to delete their visit photos
CREATE POLICY "Allow salon owners to delete visit photos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'visit-photos' 
    AND auth.uid() IN (
        SELECT user_id FROM salons 
        WHERE id = (storage.foldername(name))[1]::uuid
    )
);

-- Set up file size limits (max 10MB per photo)
-- File naming convention: {salon_id}/{pet_id}/{visit_id}/{timestamp}_{original_filename}
-- This allows for easy organization and access control 