-- =====================================================
-- DOCTOR AVAILABILITY SYSTEM - USEFUL SQL QUERIES
-- =====================================================

-- =====================================
-- TABLE STRUCTURE QUERIES
-- =====================================

-- 1. Check if doctor_slots table exists
SHOW TABLES LIKE 'doctor_slots';

-- 2. View doctor_slots table structure
DESCRIBE doctor_slots;

-- 3. View appointments table structure
DESCRIBE appointments;

-- 4. Check all indexes on doctor_slots
SHOW INDEXES FROM doctor_slots;

-- =====================================
-- DATA VIEWING QUERIES
-- =====================================

-- 5. View all availability slots with doctor info
SELECT
    ds.id,
    ds.doctor_id,
    u.full_name as doctor_name,
    u.email as doctor_email,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active,
    ds.created_at
FROM doctor_slots ds
    INNER JOIN users u ON ds.doctor_id = u.id
ORDER BY ds.slot_date DESC, ds.start_time ASC;

-- 6. View slots with booking statistics
SELECT
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active,
    u.full_name as doctor_name,
    COUNT(
        CASE
            WHEN a.status != 'cancelled' THEN 1
        END
    ) as booked_count,
    (
        ds.max_appointments - COUNT(
            CASE
                WHEN a.status != 'cancelled' THEN 1
            END
        )
    ) as available_slots
FROM
    doctor_slots ds
    INNER JOIN users u ON ds.doctor_id = u.id
    LEFT JOIN appointments a ON ds.id = a.slot_id
GROUP BY
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active,
    u.full_name
ORDER BY ds.slot_date DESC, ds.start_time ASC;

-- 7. View available slots for a specific date
SELECT
    ds.id,
    ds.doctor_id,
    u.full_name as doctor_name,
    u.email as doctor_email,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    COUNT(
        CASE
            WHEN a.status != 'cancelled' THEN 1
        END
    ) as booked_count,
    (
        ds.max_appointments - COUNT(
            CASE
                WHEN a.status != 'cancelled' THEN 1
            END
        )
    ) as available_slots
FROM
    doctor_slots ds
    INNER JOIN users u ON ds.doctor_id = u.id
    LEFT JOIN appointments a ON ds.id = a.slot_id
WHERE
    ds.slot_date = '2026-02-10'
    AND ds.is_active = 1
GROUP BY
    ds.id,
    ds.doctor_id,
    u.full_name,
    u.email,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments
HAVING
    available_slots > 0
ORDER BY ds.start_time ASC;

-- 8. View all appointments with slot and user details
SELECT
    a.id,
    a.patient_id,
    p_user.full_name as patient_name,
    p_user.email as patient_email,
    a.doctor_id,
    d_user.full_name as doctor_name,
    d_user.email as doctor_email,
    a.slot_id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    a.reason,
    a.status,
    a.created_at
FROM
    appointments a
    INNER JOIN users p_user ON a.patient_id = p_user.id
    INNER JOIN users d_user ON a.doctor_id = d_user.id
    LEFT JOIN doctor_slots ds ON a.slot_id = ds.id
ORDER BY a.created_at DESC;

-- 9. View appointments for a specific slot
SELECT
    a.id,
    a.patient_id,
    u.full_name as patient_name,
    u.email as patient_email,
    a.reason,
    a.status,
    a.created_at
FROM appointments a
    INNER JOIN users u ON a.patient_id = u.id
WHERE
    a.slot_id = 1
ORDER BY a.created_at DESC;

-- =====================================
-- DOCTOR-SPECIFIC QUERIES
-- =====================================

-- 10. Get all slots for a specific doctor (by user_id)
SELECT
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active,
    COUNT(a.id) as total_appointments
FROM
    doctor_slots ds
    LEFT JOIN appointments a ON ds.id = a.slot_id
    AND a.status != 'cancelled'
WHERE
    ds.doctor_id = 2 -- Replace with actual doctor user_id
GROUP BY
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active
ORDER BY ds.slot_date DESC, ds.start_time ASC;

-- 11. Get doctor's upcoming slots
SELECT
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    ds.is_active,
    COUNT(a.id) as appointments_count
FROM
    doctor_slots ds
    LEFT JOIN appointments a ON ds.id = a.slot_id
    AND a.status != 'cancelled'
WHERE
    ds.doctor_id = 2 -- Replace with actual doctor user_id
    AND ds.slot_date >= CURDATE()
GROUP BY
    ds.id
ORDER BY ds.slot_date ASC, ds.start_time ASC;

-- 12. Get doctor's appointments for today
SELECT
    a.id,
    p_user.full_name as patient_name,
    p_user.email as patient_email,
    p_user.phone as patient_phone,
    ds.start_time,
    ds.end_time,
    a.reason,
    a.status
FROM
    appointments a
    INNER JOIN users p_user ON a.patient_id = p_user.id
    INNER JOIN doctor_slots ds ON a.slot_id = ds.id
WHERE
    a.doctor_id = 2 -- Replace with actual doctor user_id
    AND ds.slot_date = CURDATE()
    AND a.status != 'cancelled'
ORDER BY ds.start_time ASC;

-- =====================================
-- PATIENT-SPECIFIC QUERIES
-- =====================================

-- 13. Get all appointments for a specific patient
SELECT
    a.id,
    CONCAT('APT', LPAD(a.id, 6, '0')) as appointment_number,
    d_user.full_name as doctor_name,
    d_user.email as doctor_email,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    a.reason,
    a.status,
    a.created_at
FROM
    appointments a
    INNER JOIN users d_user ON a.doctor_id = d_user.id
    LEFT JOIN doctor_slots ds ON a.slot_id = ds.id
WHERE
    a.patient_id = 3 -- Replace with actual patient user_id
ORDER BY ds.slot_date DESC, ds.start_time DESC;

-- 14. Get patient's upcoming appointments
SELECT
    a.id,
    CONCAT('APT', LPAD(a.id, 6, '0')) as appointment_number,
    d_user.full_name as doctor_name,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    a.reason,
    a.status
FROM
    appointments a
    INNER JOIN users d_user ON a.doctor_id = d_user.id
    INNER JOIN doctor_slots ds ON a.slot_id = ds.id
WHERE
    a.patient_id = 3 -- Replace with actual patient user_id
    AND ds.slot_date >= CURDATE()
    AND a.status != 'cancelled'
ORDER BY ds.slot_date ASC, ds.start_time ASC;

-- =====================================
-- ADMIN/REPORTING QUERIES
-- =====================================

-- 15. Get booking statistics by doctor
SELECT
    u.id,
    u.full_name as doctor_name,
    COUNT(DISTINCT ds.id) as total_slots_created,
    COUNT(
        DISTINCT CASE
            WHEN ds.is_active = 1 THEN ds.id
        END
    ) as active_slots,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'scheduled' THEN a.id
        END
    ) as scheduled_appointments,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'completed' THEN a.id
        END
    ) as completed_appointments,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'cancelled' THEN a.id
        END
    ) as cancelled_appointments
FROM
    users u
    LEFT JOIN doctor_slots ds ON u.id = ds.doctor_id
    LEFT JOIN appointments a ON ds.id = a.slot_id
WHERE
    u.role_id = (
        SELECT id
        FROM roles
        WHERE
            name = 'DOCTOR'
    )
GROUP BY
    u.id,
    u.full_name
ORDER BY total_appointments DESC;

-- 16. Get daily appointment count
SELECT
    ds.slot_date,
    COUNT(DISTINCT ds.id) as total_slots,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'scheduled' THEN a.id
        END
    ) as scheduled,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'completed' THEN a.id
        END
    ) as completed,
    COUNT(
        DISTINCT CASE
            WHEN a.status = 'cancelled' THEN a.id
        END
    ) as cancelled
FROM
    doctor_slots ds
    LEFT JOIN appointments a ON ds.id = a.slot_id
WHERE
    ds.slot_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY
    ds.slot_date
ORDER BY ds.slot_date DESC;

-- 17. Find fully booked slots
SELECT
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    u.full_name as doctor_name,
    ds.max_appointments,
    COUNT(a.id) as booked_count
FROM
    doctor_slots ds
    INNER JOIN users u ON ds.doctor_id = u.id
    LEFT JOIN appointments a ON ds.id = a.slot_id
    AND a.status != 'cancelled'
WHERE
    ds.is_active = 1
GROUP BY
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    u.full_name,
    ds.max_appointments
HAVING
    booked_count >= ds.max_appointments
ORDER BY ds.slot_date ASC;

-- 18. Find slots with no appointments
SELECT ds.id, ds.slot_date, ds.start_time, ds.end_time, u.full_name as doctor_name, ds.max_appointments, ds.is_active
FROM
    doctor_slots ds
    INNER JOIN users u ON ds.doctor_id = u.id
    LEFT JOIN appointments a ON ds.id = a.slot_id
    AND a.status != 'cancelled'
WHERE
    a.id IS NULL
ORDER BY ds.slot_date DESC;

-- =====================================
-- MAINTENANCE QUERIES
-- =====================================

-- 19. Delete past inactive slots with no appointments
DELETE ds
FROM
    doctor_slots ds
    LEFT JOIN appointments a ON ds.id = a.slot_id
WHERE
    ds.slot_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
    AND ds.is_active = 0
    AND a.id IS NULL;

-- 20. Archive old completed appointments (if you have an archive table)
-- INSERT INTO appointments_archive
-- SELECT * FROM appointments
-- WHERE status = 'completed'
--   AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- 21. Update appointment status to 'no_show' for past scheduled appointments
UPDATE appointments a
INNER JOIN doctor_slots ds ON a.slot_id = ds.id
SET
    a.status = 'no_show'
WHERE
    a.status = 'scheduled'
    AND ds.slot_date < CURDATE();

-- =====================================
-- VALIDATION QUERIES
-- =====================================

-- 22. Check for duplicate slots (same doctor, date, time)
SELECT
    doctor_id,
    slot_date,
    start_time,
    end_time,
    COUNT(*) as duplicate_count
FROM doctor_slots
GROUP BY
    doctor_id,
    slot_date,
    start_time,
    end_time
HAVING
    COUNT(*) > 1;

-- 23. Check for overlapping time slots for same doctor on same date
SELECT
    ds1.id as slot1_id,
    ds2.id as slot2_id,
    ds1.doctor_id,
    u.full_name as doctor_name,
    ds1.slot_date,
    ds1.start_time as slot1_start,
    ds1.end_time as slot1_end,
    ds2.start_time as slot2_start,
    ds2.end_time as slot2_end
FROM
    doctor_slots ds1
    INNER JOIN doctor_slots ds2 ON ds1.doctor_id = ds2.doctor_id
    AND ds1.slot_date = ds2.slot_date
    AND ds1.id < ds2.id
    INNER JOIN users u ON ds1.doctor_id = u.id
WHERE (
        ds1.start_time < ds2.end_time
        AND ds1.end_time > ds2.start_time
    );

-- 24. Check appointments without valid slots
SELECT a.id, a.patient_id, a.doctor_id, a.slot_id, a.status
FROM
    appointments a
    LEFT JOIN doctor_slots ds ON a.slot_id = ds.id
WHERE
    ds.id IS NULL;

-- 25. Verify foreign key relationships
SELECT
    COUNT(*) as total_slots,
    COUNT(DISTINCT doctor_id) as unique_doctors,
    COUNT(
        CASE
            WHEN is_active = 1 THEN 1
        END
    ) as active_slots,
    COUNT(
        CASE
            WHEN is_active = 0 THEN 1
        END
    ) as inactive_slots
FROM doctor_slots;

-- =====================================
-- PERFORMANCE OPTIMIZATION QUERIES
-- =====================================

-- 26. Analyze table for optimization
ANALYZE TABLE doctor_slots;

ANALYZE TABLE appointments;

-- 27. Check table size and row count
SELECT
    table_name,
    table_rows,
    ROUND(
        (
            (data_length + index_length) / 1024 / 1024
        ),
        2
    ) as size_mb
FROM information_schema.tables
WHERE
    table_schema = DATABASE()
    AND table_name IN (
        'doctor_slots',
        'appointments'
    )
ORDER BY size_mb DESC;

-- 28. Show query execution plan (use before actual queries)
-- EXPLAIN SELECT ... (add your query here)

-- =====================================
-- TESTING DATA INSERTION
-- =====================================

-- 29. Insert test slots for multiple doctors
-- First, get doctor user IDs
SELECT id, full_name, email
FROM users
WHERE
    role_id = (
        SELECT id
        FROM roles
        WHERE
            name = 'DOCTOR'
    );

-- Then insert test slots (replace doctor_id with actual values)
INSERT INTO
    doctor_slots (
        doctor_id,
        slot_date,
        start_time,
        end_time,
        max_appointments,
        is_active
    )
VALUES (
        2,
        DATE_ADD(CURDATE(), INTERVAL 1 DAY),
        '09:00:00',
        '12:00:00',
        12,
        1
    ),
    (
        2,
        DATE_ADD(CURDATE(), INTERVAL 1 DAY),
        '14:00:00',
        '17:00:00',
        10,
        1
    ),
    (
        2,
        DATE_ADD(CURDATE(), INTERVAL 2 DAY),
        '09:00:00',
        '13:00:00',
        15,
        1
    ),
    (
        2,
        DATE_ADD(CURDATE(), INTERVAL 2 DAY),
        '14:00:00',
        '16:00:00',
        8,
        1
    );

-- 30. Insert test appointment (replace IDs with actual values)
-- First find a valid slot_id and patient_id
INSERT INTO
    appointments (
        patient_id,
        doctor_id,
        slot_id,
        reason,
        status,
        booked_by
    )
SELECT (
        SELECT id
        FROM users
        WHERE
            role_id = (
                SELECT id
                FROM roles
                WHERE
                    name = 'PATIENT'
            )
        LIMIT 1
    ), ds.doctor_id, ds.id, 'Test appointment', 'scheduled', (
        SELECT id
        FROM users
        WHERE
            role_id = (
                SELECT id
                FROM roles
                WHERE
                    name = 'PATIENT'
            )
        LIMIT 1
    )
FROM doctor_slots ds
WHERE
    ds.slot_date >= CURDATE()
    AND ds.is_active = 1
LIMIT 1;