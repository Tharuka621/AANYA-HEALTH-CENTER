require('dotenv').config();
const { pool } = require('./src/config/db');

async function seed() {
  try {
    console.log('--- Seeding Lab Tests ---');
    
    // Attempt to clear existing data
    try {
        // Disable foreign key checks to allow clearing tables with references
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = ['lab_results', 'lab_order_items', 'lab_orders', 'patient_lab_tests', 'lab_tests'];
        for (const table of tables) {
            try {
                await pool.query(`DELETE FROM ${table}`);
                console.log(`Cleared table: ${table}`);
            } catch (e) {
                // Ignore if table doesn't exist
                if (e.code !== 'ER_NO_SUCH_TABLE') {
                    console.warn(`Warning while clearing ${table}:`, e.message);
                }
            }
        }
        
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Finished clearing existing data.');
    } catch (e) {
        console.warn('Fatal error during cleanup:', e.message);
    }

    const tests = [
      ['Blood Sugar (Fasting)', 1500, 'Fasting glucose test', 'Blood Test'],
      ['Complete Blood Count (CBC)', 1500, 'Full blood count analysis', 'Blood Test'],
      ['Lipid Profile', 2000, 'Cholesterol and triglycerides', 'Blood Test'],
      ['Liver Function Test (LFT)', 2500, 'Liver health panel', 'Blood Test'],
      ['Thyroid Function Test (TFT)', 3000, 'TSH, T3, T4 levels', 'Blood Test'],
      ['Urine Analysis', 600, 'Complete urine examination', 'Urine Test']
    ];

    for (const [name, price, desc, type] of tests) {
      await pool.query(
        'INSERT INTO lab_tests (name, price, description, type) VALUES (?, ?, ?, ?)',
        [name, price, desc, type]
      );
      console.log(`Added: ${name}`);
    }

    console.log('Successfully seeded lab tests!');
  } catch (err) {
    console.error('Fatal Error:', err.message);
  } finally {
    process.exit();
  }
}

seed();
