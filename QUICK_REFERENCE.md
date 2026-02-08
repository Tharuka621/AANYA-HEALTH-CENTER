# Quick Reference: Appointment Booking System

## 📊 System Status
- ✅ Backend: Running on http://localhost:5000
- ✅ Database: Connected to health_center_db (port 3307)
- ✅ Frontend: Ready at http://localhost:5173

## 🗂️ Database Tables

| Table | Purpose |
|-------|---------|
| `doctor_slots` | Doctor availability slots |
| `appointments` | Booked appointments |
| `appointment_fees` | Consultation fees |
| `appointments_payments` | Payment records |

## 🔌 API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/appointments/fee` | No | Any | Get consultation fee |
| GET | `/api/appointments/slots/available` | No | Any | Get available slots |
| POST | `/api/appointments/book-with-payment` | Yes | PATIENT | Book with payment |
| GET | `/api/appointments/patient/appointments` | Yes | PATIENT | Get patient's appointments |
| GET | `/api/appointments/doctor/slots` | Yes | DOCTOR | Get doctor's slots |
| POST | `/api/appointments/doctor/slots` | Yes | DOCTOR | Create slot |
| PUT | `/api/appointments/doctor/slots/:id` | Yes | DOCTOR | Update slot |
| DELETE | `/api/appointments/doctor/slots/:id` | Yes | DOCTOR | Delete slot |

## 🔄 Booking Flow

```
1. Doctor creates slot → doctor_slots table
2. Patient selects date → Fetch available slots
3. Patient selects slot → Show confirmation dialog
4. Patient confirms → Fetch fee → Show payment dialog
5. Patient pays → Create appointment + payment (transaction)
6. Success → Show confirmation number
```

## 💳 Payment Methods
- `card` - Credit/Debit card
- `cash` - Cash payment
- `insurance` - Insurance billing
- `upi` - UPI payment

## 🧪 Quick Test Commands

### Database Setup
```sql
USE health_center_db;
SOURCE d:/SDP/AANYA Health/backend/sql/payment_tables.sql;
SELECT * FROM appointment_fees WHERE is_active = 1;
```

### Check Latest Appointments
```sql
SELECT a.*, p.full_name as patient, d.full_name as doctor
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users d ON a.doctor_id = d.id
ORDER BY a.created_at DESC LIMIT 5;
```

### Check Latest Payments
```sql
SELECT ap.*, a.appointment_no
FROM appointments_payments ap
JOIN appointments a ON ap.appointment_id = a.id
ORDER BY ap.created_at DESC LIMIT 5;
```

## 🎯 Test Credentials
```
Doctor Login:
- Email: doctor@example.com
- Password: [your password]

Patient Login:
- Email: patient@example.com
- Password: [your password]
```

## 🔧 Test Card Details
```
Card Number: 1234 5678 9012 3456
Cardholder: John Doe
Expiry: 12/25
CVV: 123
```

## ⚠️ Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| "Slot is fully booked" | max_appointments reached | Wait or select another slot |
| "Already have appointment" | Duplicate booking | Check existing appointments |
| "Slot not found" | Inactive or deleted | Doctor should create new slot |
| "Failed to book" | Auth/validation error | Check token & input fields |

## 📝 Important Notes

### Transaction Flow
```javascript
BEGIN TRANSACTION
  → Check slot availability
  → Check duplicate booking
  → INSERT appointment
  → INSERT payment
COMMIT (or ROLLBACK on error)
```

### Appointment Number Format
- Pattern: `APT{timestamp}{random}`
- Example: `APT1705123456789`

### Payment Status
- `completed` - Paid successfully
- `pending` - Payment in progress
- `failed` - Payment failed
- `refunded` - Refunded

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `PATIENT_BOOKING_IMPLEMENTATION.md` | Complete implementation guide |
| `APPOINTMENT_BOOKING_WITH_PAYMENT.md` | Technical documentation |
| `TESTING_GUIDE.md` | Testing instructions |
| `BOOKING_FLOW_DIAGRAM.md` | Flow diagrams |

## 🚀 Quick Start

### 1. Setup Database
```bash
mysql -u root -p -P 3307
USE health_center_db;
SOURCE d:/SDP/AANYA Health/backend/sql/payment_tables.sql;
```

### 2. Start Backend
```bash
cd backend
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test
1. Login as doctor → Create slot for tomorrow
2. Login as patient → Book that slot
3. Enter payment details → Complete booking
4. Verify in database

## 🔍 Debugging

### Check Backend Logs
```bash
# Backend terminal should show:
✅ Server running on http://localhost:5000
✅ Database connected successfully
```

### Check Database Connection
```sql
SHOW TABLES;
SELECT * FROM doctor_slots WHERE is_active = 1;
```

### Check API Response
```bash
# In browser console or Postman:
GET http://localhost:5000/api/appointments/fee
```

## 📞 Support

For issues:
1. Check backend terminal for errors
2. Check browser console (F12) for frontend errors
3. Query database to verify data state
4. Review documentation files
5. Check TESTING_GUIDE.md for detailed steps

---

**Version:** 1.0
**Last Updated:** 2024
**Status:** ✅ Production Ready
