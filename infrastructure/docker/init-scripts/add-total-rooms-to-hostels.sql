-- Add total_rooms column to hostels table
-- This script fixes the migration issue where existing hostels have NULL values

-- Step 1: Add column as nullable
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS total_rooms INTEGER;

-- Step 2: Set default value for existing rows (assume 100 rooms if not specified)
UPDATE hostels SET total_rooms = 100 WHERE total_rooms IS NULL;

-- Step 3: Make it NOT NULL with a default
ALTER TABLE hostels ALTER COLUMN total_rooms SET NOT NULL;
ALTER TABLE hostels ALTER COLUMN total_rooms SET DEFAULT 0;
