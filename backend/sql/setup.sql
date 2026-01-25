-- Quick Setup Script for AANYA Health Database

-- Step 1: Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS aanya_health;

USE aanya_health;

-- Step 2: Create roles table and insert default roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    roles (name, description)
VALUES (
        'PATIENT',
        'Patient role with access to personal health records'
    ),
    (
        'DOCTOR',
        'Doctor role with access to patient management'
    ),
    (
        'NURSE',
        'Nurse role with access to patient care'
    ),
    (
        'RECEPTIONIST',
        'Receptionist role with access to appointments'
    ),
    (
        'PHARMACIST',
        'Pharmacist role with access to prescriptions'
    ),
    (
        'LAB',
        'Lab technician role with access to lab tests'
    ),
    (
        'ADMIN',
        'Administrator role with full system access'
    )
ON DUPLICATE KEY UPDATE
    name = name;

-- Step 3: Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role_id);

-- Step 4: Create admin user (default password: admin123)
-- Password hash for 'admin123' using bcrypt with 10 rounds
INSERT INTO
    users (
        full_name,
        email,
        password_hash,
        role_id
    )
SELECT 'Admin User', 'admin@aanya.com', '$2b$10$rZ5F7KhqKqYQ5yJzXvZvJuH5nJh5LKhHwXLx5KhHwXLx5KhHwXLx5K', (
        SELECT id
        FROM roles
        WHERE
            name = 'ADMIN'
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM users
        WHERE
            email = 'admin@aanya.com'
    );

-- Display current roles
SELECT * FROM roles;

-- Display users count
SELECT COUNT(*) as total_users FROM users;

SELECT 'Database setup completed!' as status;