require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'aanya_health',
      port: process.env.DB_PORT || 3307
    });

    console.log('Testing database connection...');
    
    // Check if doctor_slots table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'doctor_slots'");
    console.log('\n1. Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const [structure] = await pool.query('DESCRIBE doctor_slots');
      console.log('\n2. Table structure:');
      structure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // Check row count
      const [count] = await pool.query('SELECT COUNT(*) as count FROM doctor_slots');
      console.log('\n3. Rows in table:', count[0].count);
      
      // Check if any doctors exist
      const [doctors] = await pool.query("SELECT id, full_name, email FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'DOCTOR')");
      console.log('\n4. Doctors in system:', doctors.length);
      if (doctors.length > 0) {
        console.log('   Doctor IDs:', doctors.map(d => `${d.id} (${d.full_name})`).join(', '));
      }
    } else {
      console.log('\n❌ ERROR: doctor_slots table does NOT exist!');
      console.log('   Please run: mysql -u root -p aanya_health < backend/sql/doctor_availability.sql');
    }
    
    await pool.end();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabase();
