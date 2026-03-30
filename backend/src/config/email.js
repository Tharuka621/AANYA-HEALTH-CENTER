const nodemailer = require("nodemailer");

function assertEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env: ${name}`);
}

assertEnv("EMAIL_HOST");
assertEnv("EMAIL_PORT");
assertEnv("EMAIL_USER");
assertEnv("EMAIL_PASSWORD");
assertEnv("EMAIL_FROM");

const emailPort = Number(process.env.EMAIL_PORT);
const emailSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : emailPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: emailPort,
  secure: emailSecure,
  auth: {
    user: process.env.EMAIL_USER,       // Brevo login: a0cc3c001@smtp-brevo.com
    pass: process.env.EMAIL_PASSWORD,   // xsmtpsib-...
  },
  // Keep startup resilient when SMTP is temporarily unreachable.
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  tls: {
    servername: process.env.EMAIL_HOST,
  },
});

const verifyOnStartup = process.env.EMAIL_VERIFY_ON_STARTUP === "true";

if (verifyOnStartup) {
  transporter.verify()
    .then(() => {
      console.log("✅ Email transporter ready to send emails");
      console.log(`📧 Using: ${process.env.EMAIL_HOST} with ${process.env.EMAIL_USER}`);
      console.log(`📧 From will be: ${process.env.EMAIL_FROM}`);
    })
    .catch((err) => {
      console.warn("⚠️ Email transporter verify failed:", err.message);
      console.warn("   Tip: check firewall/ISP blocks on SMTP port and provider TLS settings.");
    });
} else {
  console.log("📧 Email transporter verification skipped at startup (set EMAIL_VERIFY_ON_STARTUP=true to enable)");
}

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,   // ✅ real sender (verified in Brevo)
    to: email,
    subject: "Password Reset OTP - AANYA Health",
    html: `<div style="font-family:Arial;padding:16px">
            <h2>AANYA Health</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing:4px">${otp}</h1>
            <p>Valid for 10 minutes.</p>
          </div>`,
    text: `Your AANYA Health OTP is ${otp}. Valid for 10 minutes.`,
  };

  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`📧 OTP Code: ${otp}`);
    console.log(`📧 From: ${process.env.EMAIL_FROM}`);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent successfully!");
    console.log("   To:", email);
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
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
            <h1>Welcome to AANYA Health!</h1>
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
  };

  try {
    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`📧 Verification Code: ${otp}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Verification email sent successfully!");
    return info;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

module.exports = { sendOTPEmail, sendVerificationEmail };
