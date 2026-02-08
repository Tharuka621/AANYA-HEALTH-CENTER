-- Payment tables for appointment booking system

-- Table to store appointment fees
CREATE TABLE IF NOT EXISTS appointment_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table to store appointment payment records
CREATE TABLE IF NOT EXISTS appointments_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'card', 'cash', 'insurance', etc.
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed', 'refunded'
    payment_ref VARCHAR(100), -- Payment reference/transaction ID
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
    INDEX idx_appointment (appointment_id),
    INDEX idx_status (status),
    INDEX idx_paid_at (paid_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Insert default appointment fee
INSERT INTO
    appointment_fees (amount, is_active)
VALUES (2500.00, 1)
ON DUPLICATE KEY UPDATE
    amount = amount;

-- Show the tables
SHOW TABLES LIKE '%appointment%';

-- Describe payment tables
DESCRIBE appointment_fees;

DESCRIBE appointments_payments;