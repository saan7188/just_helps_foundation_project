const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let finalHtml;

    if (html) {
      finalHtml = html;
    } else {
      finalHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #D97706;">JustHelps Verification</h2>
          <p>You requested a verification code for your fundraiser account.</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #1F2937;">${text}</h1>
          <p>This code expires in 5 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
        </div>
      `;
    }

    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"JustHelps Foundation" <${fromAddress}>`,
      to,
      subject,
      text,
      html: finalHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
};

module.exports = sendEmail;
