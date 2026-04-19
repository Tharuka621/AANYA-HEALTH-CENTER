require('dotenv').config();
const { pool } = require('./src/config/db');

async function verify() {
  try {
    const [rows] = await pool.query('SELECT * FROM lab_tests');
    console.log('--- Current Lab Tests in Database ---');
    console.table(rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      type: row.type
    })));
  } catch (err) {
    console.error('Verification Error:', err.message);
  } finally {
    process.exit();
  }
}

verify();
