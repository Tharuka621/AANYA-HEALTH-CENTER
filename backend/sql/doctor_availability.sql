-- Doctor Availability Slots Table
-- This table stores time slots when doctors are available for appointments

CREATE TABLE IF NOT EXISTS doctor_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_appointments INT DEFAULT 10,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_slot (
        doctor_id,
        slot_date,
        start_time,
        end_time
    )
);

-- Create index for faster lookups
CREATE INDEX idx_doctor_slots_date ON doctor_slots (slot_date);

CREATE INDEX idx_doctor_slots_doctor ON doctor_slots (doctor_id);

CREATE INDEX idx_doctor_slots_active ON doctor_slots (is_active);

-- Update appointments table to include slot_id reference
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS slot_id INT;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booked_by INT;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES doctor_slots (id) ON DELETE SET NULL;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_booked_by FOREIGN KEY (booked_by) REFERENCES users (id) ON DELETE SET NULL;

-- Add index for faster appointment queries
CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments (slot_id);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- Sample doctor availability data (for testing)
-- INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, max_appointments, is_active)
-- VALUES
--     (2, '2026-02-10', '09:00:00', '12:00:00', 12, 1),
--     (2, '2026-02-10', '14:00:00', '17:00:00', 10, 1),
--     (2, '2026-02-11', '09:00:00', '13:00:00', 15, 1),
--     (2, '2026-02-11', '14:00:00', '16:00:00', 8, 1);