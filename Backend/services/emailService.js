const nodemailer = require('nodemailer');
/* Email Service
 * Handles sending emails using Nodemailer and Gmail SMTP via environment variables
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
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