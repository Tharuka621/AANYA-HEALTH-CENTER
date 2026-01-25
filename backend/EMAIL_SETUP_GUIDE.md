# Email Configuration Setup Guide

## Setting up Email for Password Reset

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification:**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security → 2-Step Verification
   - Enable it if not already enabled

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "AANYA Health"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env file:**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (the 16-character app password)
   ```

### Option 2: Outlook/Hotmail

1. **Update .env file:**
   ```
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-outlook-password
   ```

### Option 3: Custom SMTP Server

For other email providers, use custom SMTP settings:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```

Common SMTP settings:
- **Gmail:** smtp.gmail.com, Port 587
- **Outlook:** smtp-mail.outlook.com, Port 587
- **Yahoo:** smtp.mail.yahoo.com, Port 587
- **SendGrid:** smtp.sendgrid.net, Port 587

### Option 4: Brevo (Sendinblue) - Recommended for Production

Brevo offers 300 free emails per day, perfect for production:

1. **Create Brevo Account:**
   - Sign up at: https://www.brevo.com/
   - Verify your email address

2. **Get SMTP Credentials:**
   - Go to: Settings → SMTP & API
   - Find your SMTP credentials

3. **Update .env file:**
   ```
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-brevo-email@example.com
   EMAIL_PASSWORD=your-brevo-smtp-key
   ```

### Option 5: SendGrid (Alternative)

1. Create account at: https://sendgrid.com/
2. Create API Key
3. Update .env:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### Option 6: Mailgun

1. Create account at: https://www.mailgun.com/
2. Get SMTP credentials
3. Update .env:
   ```
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@your-domain.mailgun.org
   EMAIL_PASSWORD=your-mailgun-password
   ```

## Testing the Email Setup

1. Make sure the database table is created:
   ```sql
   mysql -u root -p aanya_health < backend/sql/otp_table.sql
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

3. Test the forgot password flow:
   - Go to the frontend: http://localhost:5173/forgot-password
   - Enter a registered email address
   - Check your email for the OTP
   - Enter the OTP and set a new password

## Troubleshooting

### Email not sending:
- Check if EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check backend console for error messages
- Verify your email account allows less secure apps or SMTP access

### OTP not received:
- Check spam/junk folder
- Verify the email address is registered in the database
- Check backend logs for email sending errors
- Make sure the OTP table exists in the database
