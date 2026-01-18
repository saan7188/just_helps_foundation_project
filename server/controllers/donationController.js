const nodemailer = require('nodemailer');

// ✅ FIXED: Use Brevo on Port 2525 (Bypasses Render Firewall)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", 
  port: 2525,                   
  secure: false,                
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo Email
    pass: process.env.EMAIL_PASS, // Your Brevo SMTP Key
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.processDonation = async (req, res) => {
  const { donorName, donorEmail, amount, frequency, causeId } = req.body;

  try {
    // In a real app, you would save this to a "Donation" model here.
    
    // SEND EMAIL
    const mailOptions = {
      from: '"Just Helps Foundation" <no-reply@justhelps.org>',
      to: donorEmail,
      subject: `Receipt: Thank you for your ${frequency === 'monthly' ? 'Monthly Pledge' : 'Donation'}`,
      html: `
        <h2>Thank You, ${donorName}!</h2>
        <p>We have received your contribution of <strong>₹${amount}</strong>.</p>
        <p>Your kindness helps us provide food, shelter, and dignity to those in need.</p>
        <br/>
        <p><small>Just Helps Foundation | Tax Exempt Receipt</small></p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Donation processed and receipt sent' });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).send('Email failed to send');
  }
};
