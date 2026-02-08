-- Fix the foreign key constraint in doctor_slots table
-- The doctor_id should reference users.id (not doctors.id)

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE doctor_slots DROP FOREIGN KEY doctor_slots_ibfk_1;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE doctor_slots
ADD CONSTRAINT doctor_slots_ibfk_1 FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE;

-- Verify the fix
SHOW CREATE TABLE doctor_slots;