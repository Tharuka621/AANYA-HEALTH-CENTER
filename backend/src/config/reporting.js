const { pool } = require('./db');

async function ensureReportsSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_reports (
      report_id VARCHAR(40) NOT NULL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(40) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'published',
      created_by VARCHAR(120) NOT NULL,
      created_by_user_id BIGINT NULL,
      created_date VARCHAR(20) NOT NULL,
      last_modified VARCHAR(20) NULL,
      generated_at VARCHAR(30) NOT NULL,
      filters_json LONGTEXT NOT NULL,
      preview_json LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_type_created (type, created_at),
      INDEX idx_created_by_user (created_by_user_id),
      CONSTRAINT fk_saved_reports_user FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

module.exports = {
  ensureReportsSchema,
};
