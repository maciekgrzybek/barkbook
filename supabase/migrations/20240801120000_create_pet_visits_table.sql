-- Create pet_visits table to store visit history for each pet
CREATE TABLE pet_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for pet_visits table
ALTER TABLE pet_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pet_visits table
-- Allow salon owners to read their pet visits
CREATE POLICY "Allow salon owner read access" ON pet_visits
FOR SELECT USING (
    salon_id IN (
        SELECT id FROM salons WHERE user_id = auth.uid()
    )
);

-- Allow salon owners to insert pet visits for their pets
CREATE POLICY "Allow salon owner insert access" ON pet_visits
FOR INSERT WITH CHECK (
    salon_id IN (
        SELECT id FROM salons WHERE user_id = auth.uid()
    )
    AND pet_id IN (
        SELECT id FROM pets WHERE salon_id = pet_visits.salon_id
    )
);

-- Allow salon owners to update their pet visits
CREATE POLICY "Allow salon owner update access" ON pet_visits
FOR UPDATE USING (
    salon_id IN (
        SELECT id FROM salons WHERE user_id = auth.uid()
    )
) WITH CHECK (
    salon_id IN (
        SELECT id FROM salons WHERE user_id = auth.uid()
    )
);

-- Allow salon owners to delete their pet visits
CREATE POLICY "Allow salon owner delete access" ON pet_visits
FOR DELETE USING (
    salon_id IN (
        SELECT id FROM salons WHERE user_id = auth.uid()
    )
);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_pet_visits
BEFORE UPDATE ON pet_visits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance on common queries
CREATE INDEX idx_pet_visits_pet_id ON pet_visits(pet_id);
CREATE INDEX idx_pet_visits_salon_id ON pet_visits(salon_id);
CREATE INDEX idx_pet_visits_date ON pet_visits(visit_date DESC); 