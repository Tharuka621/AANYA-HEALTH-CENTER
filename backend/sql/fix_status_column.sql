-- Fix the status column in appointments table
-- The column is too small and causing "Data truncated" errors

USE health_center_db;

-- Check current column definition
DESCRIBE appointments;

-- Modify the status column to VARCHAR(50)
ALTER TABLE appointments
MODIFY COLUMN status VARCHAR(50) DEFAULT 'scheduled';

-- Verify the change
DESCRIBE appointments;

SELECT 'Status column fixed successfully!' as Result;