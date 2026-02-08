## Doctor Availability System - Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────┐    ┌──────────────────────────────┐   │
│  │   Doctor Dashboard          │    │  Patient Dashboard           │   │
│  │  (/dashboard/doctor)        │    │  (/dashboard/patient)        │   │
│  └─────────────────────────────┘    └──────────────────────────────┘   │
│              │                                    │                      │
│              ▼                                    ▼                      │
│  ┌─────────────────────────────┐    ┌──────────────────────────────┐   │
│  │  AvailabilityManager.tsx    │    │  AppointmentBooking.tsx      │   │
│  │  • Add/Edit/Delete Slots    │    │  • View Available Slots      │   │
│  │  • Toggle Active Status     │    │  • Book Appointments         │   │
│  │  • View All Slots           │    │  • Payment Processing        │   │
│  └─────────────────────────────┘    └──────────────────────────────┘   │
│              │                                    │                      │
└──────────────┼────────────────────────────────────┼──────────────────────┘
               │                                    │
               │         API Calls via axios        │
               │                                    │
┌──────────────▼────────────────────────────────────▼──────────────────────┐
│                          BACKEND API LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │          Appointment Routes (/api/appointments/...)                 │ │
│  │                                                                     │ │
│  │  Doctor Routes (Protected):                                        │ │
│  │  • GET    /doctor/slots              - List doctor's slots        │ │
│  │  • POST   /doctor/slots              - Create new slot            │ │
│  │  • PUT    /doctor/slots/:id          - Update slot                │ │
│  │  • DELETE /doctor/slots/:id          - Delete slot                │ │
│  │                                                                     │ │
│  │  Patient Routes (Protected):                                       │ │
│  │  • POST   /book                      - Book appointment            │ │
│  │  • GET    /patient/appointments      - List appointments           │ │
│  │                                                                     │ │
│  │  Public Routes:                                                    │ │
│  │  • GET    /slots/available?date=...  - Get available slots        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│              │                                    │                      │
│              ▼                                    ▼                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │         Appointment Controller (appointment.controller.js)          │ │
│  │                                                                     │ │
│  │  • getAvailableSlots()      - Query available slots with booking   │ │
│  │  • getDoctorSlots()         - Get all slots for logged-in doctor  │ │
│  │  • createDoctorSlot()       - Insert new availability slot        │ │
│  │  • updateDoctorSlot()       - Update slot details                 │ │
│  │  • deleteDoctorSlot()       - Delete slot (with validation)       │ │
│  │  • bookAppointment()        - Create appointment booking          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│              │                                                            │
│              │         SQL Queries via MySQL Connection Pool            │
│              │                                                            │
└──────────────▼────────────────────────────────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER (MySQL)                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  doctor_slots                                                    │    │
│  │  ├─ id (PK)                                                      │    │
│  │  ├─ doctor_id (FK → users.id)                                   │    │
│  │  ├─ slot_date                                                    │    │
│  │  ├─ start_time                                                   │    │
│  │  ├─ end_time                                                     │    │
│  │  ├─ max_appointments                                             │    │
│  │  ├─ is_active                                                    │    │
│  │  ├─ created_at                                                   │    │
│  │  └─ updated_at                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                            │
│                              │ Referenced by                              │
│                              ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  appointments                                                    │    │
│  │  ├─ id (PK)                                                      │    │
│  │  ├─ patient_id (FK → users.id)                                  │    │
│  │  ├─ doctor_id (FK → users.id)                                   │    │
│  │  ├─ slot_id (FK → doctor_slots.id) ← NEW                        │    │
│  │  ├─ reason                                                       │    │
│  │  ├─ status (scheduled/completed/cancelled)                      │    │
│  │  ├─ booked_by (FK → users.id) ← NEW                             │    │
│  │  ├─ created_at                                                   │    │
│  │  └─ updated_at                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW SEQUENCE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  DOCTOR CREATES AVAILABILITY SLOT                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. Doctor → AvailabilityManager UI                                      │
│     • Clicks "Add Time Slot"                                             │
│     • Fills form: date, start_time, end_time, max_appointments          │
│                                                                           │
│  2. Frontend → Backend API                                               │
│     POST /api/appointments/doctor/slots                                  │
│     Body: { slot_date, start_time, end_time, max_appointments, ... }    │
│     Headers: Authorization: Bearer <doctor_token>                        │
│                                                                           │
│  3. Backend Controller                                                   │
│     • Validates JWT token → Extract doctor_id                           │
│     • Validates input data                                               │
│     • Check for duplicate slots                                          │
│                                                                           │
│  4. Database Operation                                                   │
│     INSERT INTO doctor_slots                                             │
│     (doctor_id, slot_date, start_time, end_time, max_appointments)      │
│     VALUES (2, '2026-02-10', '09:00', '12:00', 10)                      │
│                                                                           │
│  5. Response Flow                                                        │
│     Backend → Frontend: { message, slotId }                             │
│     Frontend: Shows success toast & refreshes slot list                  │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  PATIENT VIEWS & BOOKS APPOINTMENT                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. Patient → AppointmentBooking UI                                      │
│     • Selects date: 2026-02-10                                           │
│                                                                           │
│  2. Frontend → Backend API                                               │
│     GET /api/appointments/slots/available?date=2026-02-10               │
│     (No auth required - public endpoint)                                 │
│                                                                           │
│  3. Backend Controller                                                   │
│     • Executes complex query:                                            │
│       SELECT ds.*, u.full_name,                                          │
│              COUNT(a.id) as booked_count,                                │
│              (ds.max_appointments - COUNT(a.id)) as available_slots     │
│       FROM doctor_slots ds                                               │
│       JOIN users u ON ds.doctor_id = u.id                                │
│       LEFT JOIN appointments a ON ds.id = a.slot_id                      │
│       WHERE ds.slot_date = '2026-02-10' AND ds.is_active = 1            │
│       GROUP BY ds.id                                                     │
│       HAVING available_slots > 0                                         │
│                                                                           │
│  4. Response to Frontend                                                 │
│     Returns array of available slots with doctor info:                   │
│     [{ id, doctor_name, start_time, end_time, available_slots, ... }]   │
│                                                                           │
│  5. Patient Books Slot                                                   │
│     • Clicks on desired slot                                             │
│     • Confirms booking                                                   │
│     • Enters payment details                                             │
│                                                                           │
│  6. Frontend → Backend API                                               │
│     POST /api/appointments/book                                          │
│     Body: { slot_id: 1, doctor_id: 2, reason: "..." }                   │
│     Headers: Authorization: Bearer <patient_token>                       │
│                                                                           │
│  7. Backend Controller                                                   │
│     • Validates JWT token → Extract patient_id                          │
│     • Check slot availability (not fully booked)                         │
│     • Check no duplicate booking                                         │
│     • Insert appointment record                                          │
│                                                                           │
│  8. Database Operation                                                   │
│     INSERT INTO appointments                                             │
│     (patient_id, doctor_id, slot_id, reason, status)                    │
│     VALUES (3, 2, 1, 'General checkup', 'scheduled')                    │
│                                                                           │
│  9. Response Flow                                                        │
│     Backend → Frontend: { appointmentId, appointmentNumber }            │
│     Frontend: Shows success message with appointment number              │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          KEY FEATURES                                    │
└─────────────────────────────────────────────────────────────────────────┘

✓ Real-time availability tracking
✓ Prevents double booking
✓ Automatic slot count updates
✓ Role-based access control (RBAC)
✓ Prevents deletion of slots with appointments
✓ Active/Inactive slot status
✓ Unique constraint prevents duplicate slots
✓ Transaction safety with MySQL
✓ JWT authentication
✓ Error handling at all layers
