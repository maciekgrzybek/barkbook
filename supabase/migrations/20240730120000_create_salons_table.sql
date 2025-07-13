CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    nip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for salons table
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual user read access" ON salons
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual user insert access" ON salons
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user update access" ON salons
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual user delete access" ON salons
FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on salons table
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON salons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 