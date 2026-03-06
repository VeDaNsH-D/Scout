const nodemailer = require('nodemailer');
/* Email Service
 * Handles sending emails using Nodemailer and Gmail SMTP via environment variables
 */
class EmailService {
  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    const transportConfig = smtpHost
      ? {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        }
      : {
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        };

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendEmail(to, subject, message) {
    try {
      console.log(`[EmailService] 📧 Sending email to: ${to}`);
      console.log(`[EmailService] 📝 Subject: ${subject}`);
      
      const mailOptions = {
        from: process.env.SMTP_USER || 'no-reply@example.com',
        to: to,
        subject: subject,
        text: message
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully to ${to}, Message ID: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
      // We don't throw error to prevent crashing workflow execution just because email failed (e.g. invalid mock credentials)
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();