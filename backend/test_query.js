require('dotenv').config();
const { pool } = require('./src/config/db');

(async () => {
  try {
    console.log('Testing getAvailableSlots query...');
    const date = '2026-02-10';
    
    const query = `
      SELECT 
        ds.id,
        ds.doctor_id,
        ds.slot_date,
        ds.start_time,
        ds.end_time,
        ds.max_appointments,
        ds.is_active,
        u.full_name as doctor_name,
        u.email as doctor_email,
        COALESCE(COUNT(a.id), 0) as booked_count,
        (ds.max_appointments - COALESCE(COUNT(a.id), 0)) as available_slots
      FROM doctor_slots ds
      INNER JOIN users u ON ds.doctor_id = u.id
      LEFT JOIN appointments a ON ds.id = a.slot_id AND a.status != 'cancelled'
      WHERE ds.slot_date = ? AND ds.is_active = 1
      GROUP BY ds.id
      HAVING available_slots > 0
      ORDER BY ds.start_time ASC
    `;
    
    console.log('Executing query for date:', date);
    const [slots] = await pool.query(query, [date]);
    console.log('Found slots:', slots.length);
    console.log('Slots:', JSON.stringify(slots, null, 2));
    
    process.exit(0);
  } catch(e) {
    console.error('❌ Error:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
})();
