const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Only create transporter when needed, not during initialization
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
      }
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
    return this.transporter;
  }

  async sendTemporaryPassword(email, fullName, temporaryPassword) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Course4Me - סיסמה זמנית',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">Course4Me</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">שחזור סיסמה</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 22px;">שלום ${fullName},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              קיבלנו בקשה לשחזור סיסמה עבור החשבון שלך במערכת Course4Me.
            </p>
            
            <div style="background: #059669; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">הסיסמה הזמנית שלך:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${temporaryPassword}</p>
            </div>
            
            <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 25px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>חשוב:</strong> הסיסמה הזמנית תפוג תוך 24 שעות. לאחר התחברות, תתבקש לשנות את הסיסמה שלך.
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              להתחברות למערכת, השתמש בכתובת המייל שלך ובסיסמה הזמנית שלעיל.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',')[0] : 'http://localhost:3001'}/login" 
                 style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                התחבר למערכת
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">אם לא ביקשת שחזור סיסמה, אנא התעלם מהודעה זו.</p>
            <p style="margin: 10px 0 0 0;">© 2025 Course4Me. כל הזכויות שמורות.</p>
          </div>
        </div>
      `
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Test email connection
  async testConnection() {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new EmailService();
