require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./src/config/db');

async function seedPharmacist() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('pharmacist', salt);

        await pool.query(
            `UPDATE users SET password_hash = ?, is_active = 1 WHERE email = 'pharmacist@aanya.com'`,
            [hash]
        );
        console.log('Pharmacist user seeded successfully.');
    } catch (err) {
        console.error('Error seeding pharmacist:', err);
    } finally {
        process.exit();
    }
}

seedPharmacist();
