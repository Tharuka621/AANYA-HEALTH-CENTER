# Appointment Booking Flow Diagram

## Complete End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT BOOKING WITH PAYMENT                       │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   DOCTOR SIDE       │         │   PATIENT SIDE      │
└─────────────────────┘         └─────────────────────┘
         │                               │
         │ 1. Login as Doctor            │
         ├──────────────────►            │
         │                               │
         │ 2. Create Availability Slot   │
         │    - Select Date              │
         │    - Set Time Range           │
         │    - Set Max Appointments     │
         ├──────────────────►            │
         │                               │
         │ POST /api/appointments/       │
         │      doctor/slots             │
         ├──────────────────►            │
         │                     ┌─────────┴─────────┐
         │                     │  MySQL Database   │
         │                     │  doctor_slots     │
         │                     │  INSERT INTO      │
         │                     └─────────┬─────────┘
         │ ◄──────────────────────────────┤
         │ Slot Created Successfully      │
         │                               │
         │                               │ 3. Login as Patient
         │                               ├──────────────────►
         │                               │
         │                               │ 4. Navigate to Booking
         │                               │
         │                               │ 5. Select Date
         │                               ├──────────────────►
         │                               │
         │                               │ GET /api/appointments/
         │                               │     slots/available?date=X
         │                     ┌─────────┴─────────┐
         │                     │  MySQL Database   │
         │                     │  SELECT FROM      │
         │                     │  doctor_slots     │
         │                     │  JOIN users       │
         │                     └─────────┬─────────┘
         │                               ◄─────────┤
         │                               │ Available Slots []
         │                               │
         │                               │ 6. Select Slot
         │                               │    Click "Book Now"
         │                               │
         │                               │ 7. Confirm Details Dialog
         │                               │    - Doctor Name
         │                               │    - Date & Time
         │                               │    - Enter Reason (optional)
         │                               │
         │                               │ 8. Click "Confirm Booking"
         │                               │
         │                               │ GET /api/appointments/fee
         │                     ┌─────────┴─────────┐
         │                     │  MySQL Database   │
         │                     │  SELECT FROM      │
         │                     │  appointment_fees │
         │                     │  WHERE active=1   │
         │                     └─────────┬─────────┘
         │                               ◄─────────┤
         │                               │ {amount: 2500}
         │                               │
         │                               │ 9. Payment Dialog Opens
         │                               │    Shows: Rs. 2,500.00
         │                               │
         │                               │ 10. Enter Card Details
         │                               │     - Card Number (16 digits)
         │                               │     - Cardholder Name
         │                               │     - Expiry Date (MM/YY)
         │                               │     - CVV (3 digits)
         │                               │
         │                               │ 11. Click "Process Payment"
         │                               │
         │                               │ POST /api/appointments/
         │                               │      book-with-payment
         │                               │ Body: {
         │                               │   slot_id, doctor_id,
         │                               │   reason, payment_method,
         │                               │   payment_ref, amount
         │                               │ }
         │                     ┌─────────┴─────────┐
         │                     │  START TRANSACTION│
         │                     └─────────┬─────────┘
         │                               │
         │                     ┌─────────▼─────────┐
         │                     │  Check Slot       │
         │                     │  Availability     │
         │                     └─────────┬─────────┘
         │                               │
         │                     ┌─────────▼─────────┐
         │                     │  Check Duplicate  │
         │                     │  Booking          │
         │                     └─────────┬─────────┘
         │                               │
         │                     ┌─────────▼─────────┐
         │                     │  INSERT INTO      │
         │                     │  appointments     │
         │                     │  (APT123456789)   │
         │                     └─────────┬─────────┘
         │                               │
         │                     ┌─────────▼─────────┐
         │                     │  INSERT INTO      │
         │                     │  appointments_    │
         │                     │  payments         │
         │                     └─────────┬─────────┘
         │                               │
         │                     ┌─────────▼─────────┐
         │                     │  COMMIT           │
         │                     │  TRANSACTION      │
         │                     └─────────┬─────────┘
         │                               ◄─────────┤
         │                               │ Success Response:
         │                               │ {
         │                               │   appointmentId,
         │                               │   appointmentNumber,
         │                               │   paymentStatus: "completed"
         │                               │ }
         │                               │
         │                               │ 12. Show Success Message
         │                               │     "Appointment APT123 booked!"
         │                               │
         │                               │ 13. Update UI
         │                               │     - Available slots: 3→2
         │                               │     - Clear form
         │                               │     - Close dialogs
         │                               │
         │ 14. Check Appointments        │
         │     (Doctor Dashboard)        │
         ├──────────────────►            │
         │                               │
         │ GET /api/appointments/        │
         │     doctor/appointments       │
         ├──────────────────►            │
         │                     ┌─────────┴─────────┐
         │                     │  SELECT FROM      │
         │                     │  appointments     │
         │                     │  WHERE doctor_id  │
         │                     └─────────┬─────────┘
         │ ◄──────────────────────────────┤
         │ See new appointment            │
         │                               │
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                            │
└──────────────────────────────────────────────────────────────┘

Scenario 1: Slot Fully Booked
────────────────────────────────
Patient tries to book
    │
    ▼
Check: booked_count >= max_appointments?
    │
    ├── YES ──► Return 400 Error
    │           "Slot is fully booked"
    │           ROLLBACK transaction
    │
    └── NO ──► Continue booking


Scenario 2: Duplicate Booking
────────────────────────────────
Patient tries to book
    │
    ▼
Check: Already has appointment for this slot?
    │
    ├── YES ──► Return 400 Error
    │           "Already have appointment"
    │           ROLLBACK transaction
    │
    └── NO ──► Continue booking


Scenario 3: Invalid Card Details
────────────────────────────────
Patient enters card info
    │
    ▼
Validate on frontend
    │
    ├── Card number != 16 digits ──► Error: "Must be 16 digits"
    ├── Missing fields ──────────► Error: "Fill all fields"
    ├── CVV != 3 digits ─────────► Error: "CVV must be 3 digits"
    │
    └── Valid ──► Proceed to booking


Scenario 4: Database Error
────────────────────────────────
Transaction in progress
    │
    ▼
Error occurs (network, constraint, etc.)
    │
    ▼
ROLLBACK transaction
    │
    ▼
Release connection
    │
    ▼
Return 500 Error
"Server error" + error message


Scenario 5: Slot Inactive
────────────────────────────────
Patient tries to book
    │
    ▼
Check: is_active = 1?
    │
    ├── NO ──► Return 404 Error
    │          "Slot not found or inactive"
    │          ROLLBACK transaction
    │
    └── YES ──► Continue booking
```

## Database Transaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│              DATABASE TRANSACTION FLOW                        │
└──────────────────────────────────────────────────────────────┘

1. Get Connection from Pool
   connection = await pool.getConnection()
   │
   ▼
2. Begin Transaction
   await connection.beginTransaction()
   │
   ▼
3. Execute Query 1: Check Slot
   SELECT * FROM doctor_slots WHERE id = ? AND is_active = 1
   │
   ├── Not found ──► ROLLBACK ──► Release ──► Return 404
   │
   ▼
4. Execute Query 2: Check Duplicate
   SELECT * FROM appointments WHERE patient_id = ? AND slot_id = ?
   │
   ├── Found ──► ROLLBACK ──► Release ──► Return 400
   │
   ▼
5. Execute Query 3: Insert Appointment
   INSERT INTO appointments (...)
   │
   ├── Error ──► ROLLBACK ──► Release ──► Return 500
   │
   ▼
6. Execute Query 4: Insert Payment
   INSERT INTO appointments_payments (...)
   │
   ├── Error ──► ROLLBACK ──► Release ──► Return 500
   │
   ▼
7. Commit Transaction
   await connection.commit()
   │
   ▼
8. Release Connection
   connection.release()
   │
   ▼
9. Return Success
   Return 201 with appointment details
```

## Frontend State Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 FRONTEND STATE MANAGEMENT                     │
└──────────────────────────────────────────────────────────────┘

Initial State:
├── selectedDate: ''
├── availableSlots: []
├── selectedSlot: null
├── reason: ''
├── appointmentFee: 2500
├── cardDetails: { cardNumber, cardHolder, expiryDate, cvv }
├── openConfirmDialog: false
├── openPaymentDialog: false
├── processingPayment: false
└── bookingConfirmation: null

User selects date:
├── setSelectedDate(date)
├── fetchAvailableSlots()
│   └── GET /api/appointments/slots/available
└── setAvailableSlots(response.data)

User selects slot:
├── setSelectedSlot(slot)
└── setOpenConfirmDialog(true)

User confirms booking:
├── setOpenConfirmDialog(false)
├── fetchAppointmentFee()
│   └── GET /api/appointments/fee
├── setAppointmentFee(response.data.amount)
└── setOpenPaymentDialog(true)

User enters payment & submits:
├── setProcessingPayment(true)
├── Validate card details
├── POST /api/appointments/book-with-payment
├── setBookingConfirmation(response.data)
├── Update availableSlots (decrement available_slots)
├── setOpenPaymentDialog(false)
├── setProcessingPayment(false)
├── Reset: selectedSlot, reason, cardDetails
└── Show success toast

On Error:
├── setProcessingPayment(false)
└── Show error toast
```

## API Call Sequence

```
┌──────────────────────────────────────────────────────────────┐
│                    API CALL SEQUENCE                          │
└──────────────────────────────────────────────────────────────┘

1. [Frontend] User selects date
   ↓
2. [Frontend] useEffect triggers
   ↓
3. [Frontend → Backend] GET /api/appointments/slots/available?date=2024-01-15
   ↓
4. [Backend] Query doctor_slots with LEFT JOIN appointments
   ↓
5. [Backend] Calculate available_slots
   ↓
6. [Backend → Frontend] Return array of slots
   ↓
7. [Frontend] Display slots as cards
   ↓
8. [Frontend] User clicks "Book Now"
   ↓
9. [Frontend] Show confirm dialog
   ↓
10. [Frontend] User clicks "Confirm Booking"
    ↓
11. [Frontend → Backend] GET /api/appointments/fee
    ↓
12. [Backend] Query appointment_fees WHERE is_active = 1
    ↓
13. [Backend → Frontend] Return {amount: 2500}
    ↓
14. [Frontend] Show payment dialog with fee
    ↓
15. [Frontend] User enters card details
    ↓
16. [Frontend] User clicks "Process Payment"
    ↓
17. [Frontend] Validate card details
    ↓
18. [Frontend → Backend] POST /api/appointments/book-with-payment
    ↓
19. [Backend] Start transaction
    ↓
20. [Backend] Check slot availability
    ↓
21. [Backend] Check duplicate booking
    ↓
22. [Backend] Insert appointment
    ↓
23. [Backend] Insert payment
    ↓
24. [Backend] Commit transaction
    ↓
25. [Backend → Frontend] Return success response
    ↓
26. [Frontend] Show success message
    ↓
27. [Frontend] Update UI (decrement available slots)
    ↓
28. [Frontend] Reset form state
```

## Summary

**Key Points:**
1. ✅ Doctor creates slots → stored in doctor_slots table
2. ✅ Patient views slots → filtered by date and availability
3. ✅ Patient selects slot → opens confirmation dialog
4. ✅ Patient confirms → fetches fee → opens payment dialog
5. ✅ Patient pays → creates appointment + payment records in transaction
6. ✅ Success → shows confirmation + updates UI
7. ✅ Errors → rollback transaction + show error message

**Database Tables Involved:**
- doctor_slots (doctor availability)
- appointments (booking records)
- appointment_fees (consultation fees)
- appointments_payments (payment records)
- users (patient and doctor info)

**Security Measures:**
- JWT authentication required
- Role-based access control (PATIENT only)
- Server-side validation
- Database transactions for atomicity
- SQL injection prevention (parameterized queries)

**User Experience:**
- Real-time slot availability
- Clear step-by-step process
- Form validation with helpful errors
- Loading states during API calls
- Success confirmation with appointment number
- Automatic UI updates
