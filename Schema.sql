
-- Create OEE Records Table
CREATE TABLE oee_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    shift INTEGER NOT NULL CHECK (shift IN (1, 2, 3)),
    
    -- Time data
    planned_production_time DECIMAL(10,2) NOT NULL,
    downtime DECIMAL(10,2) NOT NULL DEFAULT 0,
    operating_time DECIMAL(10,2) GENERATED ALWAYS AS (planned_production_time - downtime) STORED,
    
    -- Production data
    ideal_cycle_time DECIMAL(10,2) NOT NULL,
    total_output INTEGER NOT NULL,
    good_parts INTEGER NOT NULL,
    defective_parts INTEGER GENERATED ALWAYS AS (total_output - good_parts) STORED,
    
    -- OEE Components
    oee DECIMAL(5,2) NOT NULL,
    availability DECIMAL(5,2) NOT NULL,
    performance DECIMAL(5,2) NOT NULL,
    quality DECIMAL(5,2) NOT NULL,
    
    -- Loss breakdown
    breakdown_time DECIMAL(10,2) DEFAULT 0,
    setup_time DECIMAL(10,2) DEFAULT 0,
    minor_stops DECIMAL(10,2) DEFAULT 0,
    material_shortage DECIMAL(10,2) DEFAULT 0,
    startup_rejects INTEGER DEFAULT 0,
    production_rejects INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_record UNIQUE (date, machine_id, shift)
);

-- Create index for faster queries
CREATE INDEX idx_oee_date ON oee_records(date DESC);
CREATE INDEX idx_oee_machine ON oee_records(machine_id);
CREATE INDEX idx_oee_shift ON oee_records(shift);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oee_records_updated_at 
    BEFORE UPDATE ON oee_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO oee_records (date, machine_id, shift, planned_production_time, downtime, ideal_cycle_time, total_output, good_parts, oee, availability, performance, quality)
VALUES 
    ('2025-01-29', 'M001', 1, 480, 45, 30, 850, 825, 78.5, 90.6, 88.2, 97.1),
    ('2025-01-29', 'M002', 1, 480, 30, 25, 1050, 1020, 85.2, 93.8, 91.1, 97.1),
    ('2025-01-28', 'M001', 2, 480, 60, 30, 780, 750, 72.4, 87.5, 85.4, 96.2);