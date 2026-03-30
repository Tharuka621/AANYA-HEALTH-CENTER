require('dotenv').config();
const { pool } = require("./src/config/db");
const fs = require("fs");

async function checkSchema() {
    try {
        const [tables] = await pool.query("SHOW TABLES LIKE '%lab%'");
        const schema = {};
        for (let row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            schema[tableName] = columns;
        }
        fs.writeFileSync("lab_schema.json", JSON.stringify(schema, null, 2));
        console.log("Schema dumped to lab_schema.json");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkSchema();
