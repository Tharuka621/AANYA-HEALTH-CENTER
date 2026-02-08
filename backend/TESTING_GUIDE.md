# Testing Guide: Appointment Booking with Payment

## Prerequisites
- Backend server running on http://localhost:5000
- Frontend running on http://localhost:5173
- MySQL database with payment tables created
- At least one doctor and one patient user in the system

## Step-by-Step Testing

### Phase 1: Setup Payment Tables

1. Open MySQL Workbench or command line:
```sql
USE health_center_db;

-- Create payment tables
SOURCE d:/SDP/AANYA Health/backend/sql/payment_tables.sql;

-- Verify tables created
SHOW TABLES LIKE '%payment%';

-- Check default fee
SELECT * FROM appointment_fees WHERE is_active = 1;
```

Expected Result: Default fee of Rs. 2500.00 should be present.

### Phase 2: Doctor Creates Availability Slots

1. **Login as Doctor**
   - Navigate to http://localhost:5173
   - Click "Login"
   - Enter doctor credentials
   - Email: doctor@example.com
   - Password: [doctor's password]

2. **Create Availability Slot**
   - Go to Dashboard → Doctor Dashboard
   - Find "Availability Manager" section
   - Click "Add Slot"
   - Fill in details:
     - Date: Select tomorrow's date or any future date
     - Start Time: 09:00 AM
     - End Time: 09:30 AM
     - Max Appointments: 3
   - Click "Save"

3. **Verify Slot Created**
   - Slot should appear in the list
   - Status should show "Active"
   - Should display "0/3 booked"

### Phase 3: Patient Books Appointment

1. **Logout and Login as Patient**
   - Logout from doctor account
   - Login with patient credentials
   - Email: patient@example.com
   - Password: [patient's password]

2. **Navigate to Appointment Booking**
   - Go to Dashboard → Patient Dashboard
   - Click "Book Appointment" or similar navigation

3. **Select Date**
   - Use date picker to select the date where doctor created slot
   - System should fetch and display available slots

4. **View Available Slots**
   - Should see card(s) showing:
     - Doctor name
     - Time slot (09:00 AM - 09:30 AM)
     - Available slots (3)
   - Click "Book Now" button

5. **Confirm Booking Details**
   - Dialog appears with:
     - Doctor name
     - Date (formatted: Monday, January 15, 2024)
     - Time (09:00 AM - 09:30 AM)
   - Optionally enter reason: "General checkup"
   - Click "Confirm Booking"

6. **Payment Process**
   - Payment dialog appears
   - Should show: "Consultation Fee: Rs. 2,500.00"
   - Fill in card details:
     - Card Number: 1234 5678 9012 3456 (auto-formats with spaces)
     - Cardholder Name: John Doe
     - Expiry Date: 12/25
     - CVV: 123
   - Click "Process Payment"

7. **Verify Success**
   - Success toast message appears
   - Shows appointment number (e.g., "APT1705123456789")
   - Payment dialog closes
   - Available slots updates (now shows "1/3 booked")

### Phase 4: Verify in Database

Open MySQL and run these queries:

```sql
-- Check appointments table
SELECT 
  a.id,
  a.appointment_no,
  a.status,
  a.reason,
  p.full_name as patient_name,
  d.full_name as doctor_name,
  ds.slot_date,
  ds.start_time
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users d ON a.doctor_id = d.id
JOIN doctor_slots ds ON a.slot_id = ds.id
ORDER BY a.created_at DESC
LIMIT 5;

-- Check payment record
SELECT 
  ap.id,
  ap.appointment_id,
  ap.amount,
  ap.method,
  ap.status,
  ap.payment_ref,
  ap.paid_at,
  a.appointment_no
FROM appointments_payments ap
JOIN appointments a ON ap.appointment_id = a.id
ORDER BY ap.created_at DESC
LIMIT 5;

-- Check slot utilization
SELECT 
  ds.id,
  ds.slot_date,
  ds.start_time,
  ds.max_appointments,
  COUNT(a.id) as booked_count,
  (ds.max_appointments - COUNT(a.id)) as available
FROM doctor_slots ds
LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
WHERE ds.is_active = 1
GROUP BY ds.id
ORDER BY ds.slot_date DESC;
```

**Expected Results:**
1. New appointment record in appointments table
2. Corresponding payment record in appointments_payments
3. Payment status = 'completed'
4. Appointment status = 'scheduled'
5. Slot booked_count increased by 1

### Phase 5: Test Edge Cases

#### Test 1: Try to book same slot again (should fail)
1. Login as same patient
2. Try to book the same slot again
3. Expected: Error message "You already have an appointment for this slot"

#### Test 2: Book until fully booked
1. Login as different patients
2. Book the same slot (max_appointments = 3)
3. After 3rd booking:
   - Slot should not appear in available slots list
4. Try to book as 4th patient
5. Expected: Error message "Slot is fully booked"

#### Test 3: Invalid card details
1. Start booking process
2. Enter invalid card number (less than 16 digits)
3. Click "Process Payment"
4. Expected: Error message "Card number must be 16 digits"

#### Test 4: Missing payment details
1. Start booking process
2. Leave CVV field empty
3. Click "Process Payment"
4. Expected: Error message "Please fill in all card details"

#### Test 5: Update appointment fee
```sql
-- Update fee in database
UPDATE appointment_fees SET is_active = 0 WHERE id = 1;
INSERT INTO appointment_fees (amount, is_active) VALUES (3000.00, 1);
```
1. Refresh patient booking page
2. Start booking process
3. Expected: Payment dialog shows "Rs. 3,000.00"

### Phase 6: Test API Endpoints Directly

Use Postman or curl:

#### 1. Get Appointment Fee
```bash
curl http://localhost:5000/api/appointments/fee
```
Expected: `{"amount":2500}`

#### 2. Get Available Slots
```bash
curl "http://localhost:5000/api/appointments/slots/available?date=2024-01-15"
```
Expected: Array of available slots

#### 3. Book with Payment (requires JWT token)
```bash
curl -X POST http://localhost:5000/api/appointments/book-with-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": 1,
    "doctor_id": 5,
    "reason": "Test booking",
    "payment_method": "card",
    "payment_ref": "PAY123456",
    "amount": 2500
  }'
```
Expected: Success response with appointmentId and appointmentNumber

## Common Issues & Solutions

### Issue 1: "Failed to fetch available slots"
**Solution:**
- Check backend is running on port 5000
- Verify doctor_slots table has active slots
- Check browser console for errors

### Issue 2: "Failed to book appointment"
**Solution:**
- Check JWT token is valid (not expired)
- Verify user role is 'PATIENT'
- Check database foreign key constraints

### Issue 3: Payment record not created
**Solution:**
- Verify appointments_payments table exists
- Check foreign key constraint on appointment_id
- Review backend logs for transaction errors

### Issue 4: Slot still shows as available after booking
**Solution:**
- Refresh the page
- Check appointments.status != 'cancelled' in query
- Verify the slot_id matches

## Performance Testing

### Test Concurrent Bookings
Simulate multiple patients booking same slot simultaneously:

1. Open 3 browser windows
2. Login as different patients in each
3. Navigate all to booking page
4. Select same slot in all windows
5. Click "Book Now" at approximately same time
6. Expected: Only first 3 should succeed, rest should see "Slot is fully booked"

This tests the transaction handling and concurrent booking prevention.

## Cleanup After Testing

```sql
-- Clear test data
DELETE FROM appointments_payments WHERE id > 0;
DELETE FROM appointments WHERE id > 0;
DELETE FROM doctor_slots WHERE id > 0;

-- Reset auto increment
ALTER TABLE appointments_payments AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE doctor_slots AUTO_INCREMENT = 1;
```

## Success Criteria

✅ Doctor can create availability slots
✅ Patient can view available slots for selected date
✅ Patient can see real-time availability count
✅ Patient can enter booking details
✅ System fetches current appointment fee
✅ Patient can enter payment details
✅ Form validates card details properly
✅ Booking creates both appointment and payment records
✅ Transaction rollback works on errors
✅ Cannot book same slot twice
✅ Cannot exceed max_appointments
✅ Available slots update immediately after booking
✅ Success message displays appointment number
✅ Backend logs show proper execution flow

## Test Results Template

Date: _______________
Tester: _______________

| Test Case | Expected | Actual | Pass/Fail | Notes |
|-----------|----------|--------|-----------|-------|
| Doctor creates slot | Slot appears in list | | | |
| Patient views slots | Slots displayed | | | |
| Payment fee fetched | Shows Rs. 2,500 | | | |
| Valid card booking | Success + appt number | | | |
| Duplicate booking | Error message | | | |
| Fully booked slot | Not in list | | | |
| Invalid card number | Validation error | | | |
| Missing card details | Validation error | | | |
| Database records | Both tables updated | | | |
| Concurrent bookings | Proper handling | | | |

## Conclusion

This comprehensive test ensures the complete appointment booking with payment flow works correctly across all scenarios, including edge cases and error conditions.
