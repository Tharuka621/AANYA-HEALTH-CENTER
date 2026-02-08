# Doctor Availability Management - Setup Guide

## Overview
This implementation enables doctors to manage their availability schedules and allows patients to book appointments based on available time slots.

## Flow Description

### Doctor Flow:
1. Doctor logs into the system
2. Navigates to "Availability Manager" in their dashboard
3. Can add new time slots by clicking "Add Time Slot"
4. For each slot, doctor specifies:
   - Date
   - Start time
   - End time
   - Maximum number of appointments
   - Active status
5. Doctor can edit, delete, or toggle activation status of existing slots
6. Slots with active appointments cannot be deleted

### Patient Flow:
1. Patient logs into the system
2. Navigates to appointment booking
3. Selects a date
4. System displays all available time slots for that date
5. Each slot shows:
   - Doctor name
   - Time range
   - Number of available slots
6. Patient selects a slot and provides reason for visit (optional)
7. Patient completes payment process
8. System books the appointment and provides appointment number
9. Available slot count decreases automatically

## Database Setup

### Step 1: Run the SQL Schema
Execute the following SQL file to create the necessary tables:

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Run the doctor availability schema
source backend/sql/doctor_availability.sql
```

Or manually run:
```sql
-- Create the doctor_slots table
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
    UNIQUE KEY unique_doctor_slot (doctor_id, slot_date, start_time, end_time)
);

-- Add slot_id to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS slot_id INT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booked_by INT;
ALTER TABLE appointments ADD CONSTRAINT fk_appointments_slot 
    FOREIGN KEY (slot_id) REFERENCES doctor_slots (id) ON DELETE SET NULL;
```

### Step 2: Insert Test Data (Optional)
```sql
-- Get doctor user ID (assuming doctor@aanya.com is a doctor)
SELECT id FROM users WHERE email = 'doctor@aanya.com';

-- Insert sample availability slots (replace doctor_id with actual ID)
INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, max_appointments, is_active)
VALUES 
    (2, '2026-02-10', '09:00:00', '12:00:00', 12, 1),
    (2, '2026-02-10', '14:00:00', '17:00:00', 10, 1),
    (2, '2026-02-11', '09:00:00', '13:00:00', 15, 1),
    (2, '2026-02-11', '14:00:00', '16:00:00', 8, 1);
```

## Backend Setup

### Step 1: Verify Routes
The appointment routes are already configured in:
`backend/src/routes/appointment.routes.js`

Routes include:
- `GET /api/appointments/slots/available` - Get available slots for a date (public)
- `GET /api/appointments/doctor/slots` - Get doctor's slots (doctor only)
- `POST /api/appointments/doctor/slots` - Create new slot (doctor only)
- `PUT /api/appointments/doctor/slots/:slotId` - Update slot (doctor only)
- `DELETE /api/appointments/doctor/slots/:slotId` - Delete slot (doctor only)
- `POST /api/appointments/book` - Book appointment (patient only)

### Step 2: Ensure Backend is Running
```bash
cd backend
npm install
npm start
```

Backend should be running on: http://localhost:5000

## Frontend Setup

### Step 1: Verify Components
The following components have been updated:
- `frontend/src/components/Doctor/AvailabilityManager.tsx` - Doctor availability management
- `frontend/src/components/Patient/AppointmentBooking.tsx` - Patient booking interface

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend should be running on: http://localhost:5173

## Testing the Complete Flow

### Test as Doctor:
1. **Login as doctor:**
   - Email: doctor@aanya.com
   - Password: doctor123

2. **Navigate to Doctor Dashboard**

3. **Add Availability Slots:**
   - Click "Add Time Slot" button
   - Fill in the form:
     - Date: Select future date (e.g., tomorrow)
     - Start Time: 09:00
     - End Time: 12:00
     - Max Appointments: 10
     - Active: Yes
   - Click "Create Slot"
   - Verify slot appears in the table

4. **Edit a Slot:**
   - Click edit icon on any slot
   - Modify details
   - Click "Update Slot"
   - Verify changes are reflected

5. **Toggle Slot Status:**
   - Click the switch button to activate/deactivate
   - Verify status updates

### Test as Patient:
1. **Login as patient:**
   - Email: patient@aanya.com
   - Password: patient123

2. **Navigate to Appointment Booking:**
   - From dashboard or sidebar

3. **Book an Appointment:**
   - Select the date you added slots for
   - View available slots
   - Click "Book" on desired slot
   - Enter reason for visit (optional)
   - Click "Confirm Booking"
   - Enter payment details:
     - Card Number: 1234 5678 9012 3456
     - Cardholder: Test Patient
     - Expiry: 12/26
     - CVV: 123
   - Click "Pay Rs. 2,500.00"
   - Verify success message and appointment number

4. **Verify Slot Count Decreased:**
   - Go back and select the same date
   - Verify available slots count is reduced by 1

### Test Edge Cases:

1. **Fully Booked Slot:**
   - Create a slot with max_appointments = 1
   - Book it as patient
   - Try to book again with another patient account
   - Should see "Slot is fully booked" error

2. **Delete Slot with Appointments:**
   - Login as doctor
   - Try to delete a slot that has active appointments
   - Should see error message preventing deletion

3. **Inactive Slots:**
   - Login as doctor
   - Deactivate a slot
   - Login as patient
   - Select same date
   - Verify inactive slot doesn't appear in available slots

4. **Past Dates:**
   - Login as patient
   - Try to select a past date
   - Date picker should prevent selection

## API Endpoints Details

### Get Available Slots
```
GET /api/appointments/slots/available?date=2026-02-10
Response: Array of available slots with doctor info
```

### Get Doctor Slots
```
GET /api/appointments/doctor/slots
Headers: Authorization: Bearer <token>
Response: Array of doctor's slots
```

### Create Slot
```
POST /api/appointments/doctor/slots
Headers: Authorization: Bearer <token>
Body: {
  "slot_date": "2026-02-10",
  "start_time": "09:00",
  "end_time": "12:00",
  "max_appointments": 10,
  "is_active": true
}
```

### Update Slot
```
PUT /api/appointments/doctor/slots/:slotId
Headers: Authorization: Bearer <token>
Body: Same as create
```

### Delete Slot
```
DELETE /api/appointments/doctor/slots/:slotId
Headers: Authorization: Bearer <token>
```

### Book Appointment
```
POST /api/appointments/book
Headers: Authorization: Bearer <token>
Body: {
  "slot_id": 1,
  "doctor_id": 2,
  "reason": "General consultation"
}
```

## Troubleshooting

### Issue: Slots not appearing for patients
**Solution:** 
- Verify slots are marked as `is_active = 1`
- Check slot date is not in the past
- Ensure `max_appointments` > `booked_count`

### Issue: Cannot delete slot
**Solution:**
- Check if slot has active appointments
- Cancel appointments first, then delete slot

### Issue: 401 Unauthorized error
**Solution:**
- Verify user is logged in
- Check token is valid
- Ensure user has correct role (doctor/patient)

### Issue: Database errors
**Solution:**
- Verify tables are created properly
- Check foreign key constraints
- Ensure user IDs exist in users table

## Database Queries for Verification

```sql
-- Check all slots
SELECT * FROM doctor_slots;

-- Check slots with booking count
SELECT 
    ds.id,
    ds.slot_date,
    ds.start_time,
    ds.end_time,
    ds.max_appointments,
    COUNT(a.id) as booked_count,
    (ds.max_appointments - COUNT(a.id)) as available_slots
FROM doctor_slots ds
LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
GROUP BY ds.id;

-- Check appointments for a specific slot
SELECT * FROM appointments WHERE slot_id = 1;

-- Check available slots for a date
SELECT 
    ds.*,
    u.full_name as doctor_name,
    COUNT(a.id) as booked_count
FROM doctor_slots ds
INNER JOIN users u ON ds.doctor_id = u.id
LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
WHERE ds.slot_date = '2026-02-10' AND ds.is_active = 1
GROUP BY ds.id
HAVING (ds.max_appointments - COUNT(a.id)) > 0;
```

## Success Criteria

✅ Doctors can create, edit, delete, and toggle availability slots  
✅ Patients can view available slots when selecting a date  
✅ Patients can successfully book appointments  
✅ Slot availability decreases when booked  
✅ Fully booked slots don't appear in available list  
✅ Inactive slots don't appear for patients  
✅ Slots with appointments cannot be deleted  
✅ Proper error handling and user feedback  

## Next Steps

1. Add email notifications when appointment is booked
2. Add SMS reminders for appointments
3. Implement recurring availability patterns (e.g., every Monday)
4. Add calendar view for doctors
5. Implement appointment rescheduling
6. Add appointment cancellation with refund logic
7. Generate appointment reports
