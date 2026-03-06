/**
 * Mock Email Service
 * Handles sending emails (currently mocked)
 */
class EmailService {
  async sendEmail(to, subject, message) {
    try {
      console.log(`[EmailService] 📧 Sending email to: ${to}`);
      console.log(`[EmailService] 📝 Subject: ${subject}`);
      console.log(`[EmailService] ✉️  Message: ${message}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`[EmailService] Email sent successfully to ${to}`);
      
      return { success: true, messageId: `mock-${Date.now()}` };
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();