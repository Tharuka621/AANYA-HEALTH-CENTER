/**
 * Appointment Reminder Job
 * 
 * Runs every hour and sends an email reminder to patients whose appointment
 * is scheduled for tomorrow (within the next 24 hours) and haven't been reminded yet.
 * 
 * REQUIRED: Run the migration before starting:
 *   ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent TINYINT(1) NOT NULL DEFAULT 0;
 */

const { pool } = require('../config/db');
const { sendAppointmentReminderEmail } = require('../config/email');

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

async function sendAppointmentReminders() {
  console.log('🔔 Running appointment reminder job...');

  try {
    // Get appointments scheduled for tomorrow that haven't been reminded yet
    const [appointments] = await pool.query(
      `SELECT
        a.id,
        u.email        AS patient_email,
        u.full_name    AS patient_name,
        du.full_name   AS doctor_name,
        ds.slot_date,
        TIME_FORMAT(ds.start_time, '%H:%i') AS start_time
       FROM appointments a
       JOIN patients p       ON a.patient_id = p.id
       JOIN users u          ON p.user_id    = u.id
       JOIN users du         ON a.doctor_id  = du.id
       JOIN doctor_slots ds  ON a.slot_id    = ds.id
       WHERE a.status = 'scheduled'
         AND a.reminder_sent = 0
         AND ds.slot_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
    );

    if (appointments.length === 0) {
      console.log('🔔 No reminders to send.');
      return;
    }

    console.log(`🔔 Sending ${appointments.length} appointment reminder(s)...`);

    for (const apt of appointments) {
      try {
        // Format date as dd/MM/yyyy for the email
        const dateObj = new Date(apt.slot_date);
        const formattedDate = dateObj.toLocaleDateString('en-GB'); // dd/MM/yyyy

        await sendAppointmentReminderEmail(
          apt.patient_email,
          apt.patient_name,
          `Dr. ${apt.doctor_name}`,
          formattedDate,
          apt.start_time
        );

        // Mark as reminded
        await pool.query(
          'UPDATE appointments SET reminder_sent = 1 WHERE id = ?',
          [apt.id]
        );

        console.log(`✅ Reminder sent to ${apt.patient_email} for appointment on ${formattedDate}`);
      } catch (err) {
        console.error(`❌ Failed to send reminder for appointment ${apt.id}:`, err.message);
        // Continue processing others even if one fails
      }
    }
  } catch (err) {
    console.error('❌ Appointment reminder job error:', err);
  }
}

function startReminderJob() {
  console.log('🔔 Appointment reminder job scheduled (runs every hour)');

  // Run once immediately when server starts (catches any missed reminders)
  sendAppointmentReminders();

  // Then run every hour
  setInterval(sendAppointmentReminders, INTERVAL_MS);
}

module.exports = { startReminderJob };
