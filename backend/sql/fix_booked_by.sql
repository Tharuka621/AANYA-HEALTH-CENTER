USE health_center_db;

-- Fix booked_by column to VARCHAR to accept 'PATIENT' or 'RECEPTION'
ALTER TABLE appointments
MODIFY COLUMN booked_by VARCHAR(20) DEFAULT 'PATIENT';

-- Verify the change
DESCRIBE appointments;

SELECT 'booked_by column fixed to VARCHAR(20)!' as Result;