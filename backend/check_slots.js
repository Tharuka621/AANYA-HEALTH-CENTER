require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  
  try {
    console.log('Checking doctor_slots table...');
    
    const [tables] = await conn.query('SHOW TABLES LIKE "doctor_slots"');
    console.log('Tables found:', tables.length);
    
    if (tables.length > 0) {
      const [desc] = await conn.query('DESCRIBE doctor_slots');
      console.log('\ndoctor_slots structure:');
      desc.forEach(col => console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`));
      
      const [count] = await conn.query('SELECT COUNT(*) as cnt FROM doctor_slots');
      console.log('\nRow count:', count[0].cnt);
      
      if (count[0].cnt > 0) {
        const [sample] = await conn.query('SELECT * FROM doctor_slots LIMIT 1');
        console.log('\nSample row:', JSON.stringify(sample[0], null, 2));
      }
    } else {
      console.log('ERROR: doctor_slots table does not exist!');
    }
  } catch(e) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack);
  } finally {
    await conn.end();
    process.exit(0);
  }
})();
