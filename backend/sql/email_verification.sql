-- Add email verification column to users table
ALTER TABLE users
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE AFTER is_active;

-- Create table for email verification OTPs
CREATE TABLE IF NOT EXISTS email_verification_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);