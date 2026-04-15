require('dotenv').config();
const { pool } = require('./src/config/db');

async function seed() {
  try {
    const [batches] = await pool.query('SELECT * FROM inventory_batches LIMIT 50');
    if (batches.length === 0) {
      console.log('No inventory batches found.');
      process.exit();
    }

    const [prescriptions] = await pool.query('SELECT id FROM prescription_items LIMIT 50');
    let p_items = prescriptions.length > 0 ? prescriptions : [{id: null}];

    for (let i = 0; i < 150; i++) {
        const batch = batches[Math.floor(Math.random() * batches.length)];
        const p_item = p_items[Math.floor(Math.random() * p_items.length)];
        const qty = Math.floor(Math.random() * 15) + 5; // 5 to 20 items
        const sell_price = Number(batch.sell_price) || 150;
        const billed_amount = qty * sell_price;
        
        // Spread data naturally over the last 60 days
        const daysAgo = Math.floor(Math.random() * 60);
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        try {
            await pool.query(
                `INSERT INTO dispense_items (prescription_item_id, batch_id, qty_dispensed, dispensed_by, dispensed_at)
                VALUES (?, ?, ?, ?, ?)`,
                [p_item.id, batch.id, qty, 1, date] 
            );
        } catch (e) {
            console.log('Insert Error:', e.message);
        }
    }
    console.log('Successfully seeded dispense items!');
  } catch (err) {
    console.error('Fatal Error:', err.message);
  } finally {
    process.exit();
  }
}
seed();
