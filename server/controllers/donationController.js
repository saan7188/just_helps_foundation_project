const nodemailer = require('nodemailer');

// Setup Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
    console.error(err);
    res.status(500).send('Email failed');
  }
};