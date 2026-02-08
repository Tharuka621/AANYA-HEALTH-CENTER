# Database Setup Instructions

## Prerequisites
- MySQL/MariaDB installed and running
- Database credentials configured in `.env` file

## Quick Setup

1. **Create the database and basic tables:**
   ```bash
   mysql -u root -p < backend/sql/setup.sql
   ```

2. **Or manually via MySQL CLI:**
   ```sql
   mysql -u root -p
   source backend/sql/setup.sql
   ```

3. **Verify setup:**
   ```sql
   USE aanya_health;
   SHOW TABLES;
   SELECT * FROM roles;
   SELECT * FROM users;
   ```

## Environment Configuration

Make sure your `.env` file in the backend folder contains:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aanya_health
DB_PORT=3307

JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

PORT=5000
```

## Default Admin Account

After running setup.sql, you'll have an admin account:
- **Email:** admin@aanya.com
- **Password:** admin123

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

## User Role Flow

1. **New User Signup:**
   - All users sign up with: Name, Email, Password
   - Automatically assigned `PATIENT` role

2. **Admin Role Management:**
   - Admin logs in → Goes to User Management
   - Sees all users in a table
   - Changes user role via dropdown
   - Available roles: PATIENT, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB, ADMIN

3. **Role-Based Access:**
   - Users login and are redirected to role-specific dashboards
   - `/dashboard/patient` - Patient Dashboard
   - `/dashboard/doctor` - Doctor Dashboard
   - `/dashboard/admin` - Admin Dashboard
   - etc.

## Troubleshooting

### "500 Internal Server Error" on /api/admin/users
This usually means:
1. Database not created or tables missing
2. Run `setup.sql` to create required tables
3. Check backend console for specific error messages

### "Failed to load users"
1. Ensure MySQL is running
2. Verify `.env` database credentials
3. Check that roles table exists and has data
4. Restart the backend server

### Admin Can't Login
1. Ensure setup.sql was executed successfully
2. Check that admin user exists: `SELECT * FROM users WHERE email='admin@aanya.com';`
3. Password is: admin123

## Full Schema

For complete database schema with all tables (appointments, prescriptions, etc.), run:
```bash
mysql -u root -p aanya_health < backend/sql/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (becomes PATIENT)
- `POST /api/auth/login` - Login

### Admin (Requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/status` - Toggle user active status

---

## Doctor Availability System 🆕

### Setup for Availability Feature

Run the doctor availability schema to enable appointment slot management:

```bash
mysql -u root -p aanya_health < backend/sql/doctor_availability.sql
```

This creates:
- `doctor_slots` table for managing doctor availability
- Adds `slot_id` and `booked_by` columns to `appointments` table
- Adds necessary indexes for performance

### Files Added

1. **`doctor_availability.sql`** - Database schema for availability slots
2. **`useful_queries.sql`** - 30+ helpful queries for testing and debugging

### Quick Test

```sql
-- Insert a test availability slot
INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, max_appointments, is_active)
VALUES (2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '12:00:00', 10, 1);

-- View available slots
SELECT ds.*, u.full_name as doctor_name,
       COUNT(a.id) as booked,
       (ds.max_appointments - COUNT(a.id)) as available
FROM doctor_slots ds
JOIN users u ON ds.doctor_id = u.id
LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
WHERE ds.is_active = 1
GROUP BY ds.id;
```

### API Endpoints for Availability

**Doctor Endpoints (Protected):**
- `GET /api/appointments/doctor/slots` - Get doctor's slots
- `POST /api/appointments/doctor/slots` - Create new slot
- `PUT /api/appointments/doctor/slots/:id` - Update slot
- `DELETE /api/appointments/doctor/slots/:id` - Delete slot

**Patient Endpoints:**
- `GET /api/appointments/slots/available?date=YYYY-MM-DD` - Get available slots
- `POST /api/appointments/book` - Book an appointment

### Documentation

For complete implementation guide, see:
- **[DOCTOR_AVAILABILITY_SETUP.md](../../DOCTOR_AVAILABILITY_SETUP.md)** - Complete setup and testing guide
- **[ARCHITECTURE_DIAGRAM.md](../../ARCHITECTURE_DIAGRAM.md)** - System architecture and flow diagrams
- **[useful_queries.sql](./useful_queries.sql)** - Collection of helpful SQL queries
