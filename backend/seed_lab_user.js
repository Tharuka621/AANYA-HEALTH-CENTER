require('dotenv').config();
const { pool } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seedLabUser() {
    try {
        const hash = await bcrypt.hash('Lab@123', 10);
        const [role] = await pool.query("SELECT id FROM roles WHERE name='LAB'");
        if (!role.length) throw new Error("LAB role not found");

        await pool.query(
            "INSERT INTO users (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name=full_name",
            ['Lab Technician', 'labtech@aanya.com', hash, role[0].id]
        );
        console.log("Lab user seeded: labtech@aanya.com / Lab@123");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
seedLabUser();
