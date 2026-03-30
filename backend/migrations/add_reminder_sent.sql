-- Run this once in your MySQL database before restarting the backend
ALTER TABLE appointments ADD COLUMN reminder_sent TINYINT(1) NOT NULL DEFAULT 0;
