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
