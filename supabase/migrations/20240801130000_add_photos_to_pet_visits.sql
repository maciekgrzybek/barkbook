-- Add photos column to pet_visits table to store photo paths from Supabase Storage
ALTER TABLE pet_visits 
ADD COLUMN photos JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN pet_visits.photos IS 'Array of photo objects with structure: [{"path": "storage/path", "filename": "original_name.jpg"}]';

-- Create index for better performance when querying visits with photos
CREATE INDEX idx_pet_visits_has_photos ON pet_visits 
USING gin (photos) WHERE jsonb_array_length(photos) > 0; 