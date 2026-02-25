-- Patient Vitals Table
-- Stores vital signs taken by receptionist during check-in

CREATE TABLE IF NOT EXISTS patient_vitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    temperature DECIMAL(4,1), -- in Celsius
    systolic_bp INT,
    diastolic_bp INT,
    pulse INT,
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    sugar_level DECIMAL(5,2), -- in mg/dL
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX idx_vitals_appointment ON patient_vitals (appointment_id);
CREATE INDEX idx_vitals_patient ON patient_vitals (patient_id);
