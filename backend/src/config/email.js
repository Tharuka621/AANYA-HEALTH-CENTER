const { Resend } = require("resend");

function assertEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env: ${name}`);
}

assertEnv("RESEND_API_KEY");
assertEnv("EMAIL_FROM");

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("✅ Resend email service initialized");
console.log(`📧 Sending from: ${process.env.EMAIL_FROM}`);

/**
 * Sends an OTP email for password reset
 */
const sendOTPEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending OTP email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset OTP - AANYA Health",
      html: `<div style="font-family:Arial, sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;max-width:600px;margin:0 auto">
              <h2 style="color:#1976d2">AANYA Health</h2>
              <p>Your OTP for password reset is:</p>
              <h1 style="letter-spacing:6px;color:#1976d2;background:#f0f7ff;padding:20px;text-align:center;border-radius:5px">${otp}</h1>
              <p style="color:#666">This code is valid for 10 minutes.</p>
              <hr style="border:0;border-top:1px solid #eee;margin:20px 0" />
              <p style="font-size:12px;color:#999;text-align:center">If you didn't request this, please ignore this email.</p>
            </div>`,
      text: `Your AANYA Health OTP is ${otp}. Valid for 10 minutes.`,
    });

    if (error) {
      console.error("❌ Resend error sending OTP email:", error.message);
      throw new Error(error.message || "Failed to send OTP email");
    }

    console.log("✅ OTP email sent successfully!", data.id);
    return data;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Sends a verification email for new signups
 */
const sendVerificationEmail = async (email, otp) => {
  try {
    console.log(`📧 Sending verification email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email - AANYA Health",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .otp-box { background-color: #f0f7ff; border: 2px dashed #1976d2; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 5px; }
            .footer { margin-top: 20px; padding: 15px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0">Welcome to AANYA Health!</h1>
            </div>
            <div class="content">
              <p>Thank you for signing up with AANYA Health.</p>
              <p>Please verify your email address to activate your account:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">This code is valid for 10 minutes</p>
              </div>
              
              <p>Enter this code on the verification page to complete your registration.</p>
              <p>Best regards,<br>AANYA Health Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AANYA Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to AANYA Health! Your email verification code is: ${otp}. Valid for 10 minutes.`,
    });

    if (error) {
      console.error("❌ Resend error sending verification email:", error);
      throw new Error(error.message);
    }

    console.log("✅ Verification email sent successfully!", data.id);
    return data;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Sends a notification when a lab report is ready
 */
const sendLabReportReadyEmail = async (email, patientName, testName) => {
  try {
    console.log(`📧 Sending lab report ready email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Lab Report Ready - ${testName} | AANYA Health`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .highlight-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; padding: 15px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0">🧪 Lab Report Ready</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>Your lab test result is now available on the AANYA Health patient portal.</p>
              <div class="highlight-box">
                <strong>Test:</strong> ${testName}<br/>
                <strong>Status:</strong> ✅ Completed
              </div>
              <p>Please log in to your patient portal to view and download your report.</p>
              <p>If you have any questions about your results, please consult your doctor.</p>
              <p>Best regards,<br/>AANYA Health Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AANYA Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${patientName}, your lab test result for "${testName}" is now ready. Please log in to the AANYA Health portal to view your report.`,
    });

    if (error) {
      console.error("❌ Resend error sending lab report email:", error);
      return;
    }

    console.log(`✅ Lab report notification sent successfully!`, data.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending lab report email:', error);
  }
};

/**
 * Sends an appointment reminder email
 */
const sendAppointmentReminderEmail = async (email, patientName, doctorName, appointmentDate, appointmentTime) => {
  try {
    console.log(`📧 Sending appointment reminder to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Appointment Reminder Tomorrow - AANYA Health`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-box { background-color: #e3f2fd; border-left: 4px solid #1976d2; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; padding: 15px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0">📅 Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>This is a friendly reminder that you have a medical appointment <strong>tomorrow</strong>.</p>
              <div class="info-box">
                <strong>👨‍⚕️ Doctor:</strong> ${doctorName}<br/>
                <strong>📅 Date:</strong> ${appointmentDate}<br/>
                <strong>🕐 Time:</strong> ${appointmentTime}
              </div>
              <p>Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact us in advance.</p>
              <p>Best regards,<br/>AANYA Health Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AANYA Health. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${patientName}, your appointment with ${doctorName} is tomorrow (${appointmentDate}) at ${appointmentTime}. Please arrive 10 minutes early.`,
    });

    if (error) {
      console.error("❌ Resend error sending appointment reminder email:", error);
      return;
    }

    console.log(`✅ Appointment reminder sent successfully!`, data.id);
    return data;
  } catch (error) {
    console.error('❌ Error sending appointment reminder email:', error);
  }
};

module.exports = {
  sendOTPEmail,
  sendVerificationEmail,
  sendLabReportReadyEmail,
  sendAppointmentReminderEmail
};
