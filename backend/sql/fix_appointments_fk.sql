USE health_center_db;

-- Check current foreign key constraints on appointments table
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'health_center_db'
    AND TABLE_NAME = 'appointments'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Drop the incorrect foreign key that references patients table
ALTER TABLE appointments DROP FOREIGN KEY appointments_ibfk_1;

-- Add correct foreign key that references users table
ALTER TABLE appointments
ADD CONSTRAINT appointments_ibfk_1 FOREIGN KEY (patient_id) REFERENCES users (id) ON DELETE CASCADE;

-- Also fix doctor_id if needed
ALTER TABLE appointments
DROP FOREIGN KEY IF EXISTS appointments_ibfk_2;

ALTER TABLE appointments
ADD CONSTRAINT appointments_ibfk_2 FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE;

-- Verify the changes
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'health_center_db'
    AND TABLE_NAME = 'appointments'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT 'Foreign keys fixed! patient_id and doctor_id now reference users.id' as Result;