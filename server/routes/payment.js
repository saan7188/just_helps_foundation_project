const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Cause = require('../models/Cause'); // <--- CRITICAL IMPORT
const sendEmail = require('../utils/sendEmail');

// ==========================================
// 1. ADMIN ROUTE (Get All Donations)
// ==========================================
router.get('/all', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 });
    res.json(donations);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. DONATION ROUTE (Merged Logic)
// ==========================================
router.post('/donate', async (req, res) => {
  const { 
    donorName, donorEmail, amount, tip, totalPaid, 
    causeId, causeTitle, isAnonymous, dedication 
  } = req.body;

  // 💎 Generate Transaction ID
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const transactionId = `JH-80G-${year}-${randomNum}`;
  const donationDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  try {
    // --- A. VALIDATION ---
    if (!amount || !donorName || !donorEmail) {
      throw new Error("Missing required fields");
    }

    // --- B. SAVE DONATION TO DB ---
    const newDonation = new Donation({
      donorName, donorEmail, amount,
      tipAmount: tip || 0,
      totalPaid: totalPaid || amount,
      cause: String(causeId),
      causeTitle, isAnonymous, dedication,
      transactionId
    });

    await newDonation.save();

    // --- C. UPDATE CAMPAIGN PROGRESS (CRITICAL FIX 🚨) ---
    // This adds the donation amount to the Cause's 'raised' field
    if (causeId && causeId.length > 15) {
        await Cause.findByIdAndUpdate(causeId, { 
            $inc: { raised: Number(amount) } 
        });
        console.log(`✅ Updated Campaign: ${causeTitle} +₹${amount}`);
    }

    // --- D. PREPARE EMAIL RECEIPT ---
    const tipRow = tip > 0 
      ? `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666; font-size: 15px;">
           <span>Platform Tip:</span>
           <span>₹${tip}</span>
         </div>`
      : '';

    const successHtml = `
      <div style="background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px;">
        <div style="background-color: #ffffff; max-width: 480px; margin: 0 auto; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          
          <h1 style="color: #D97706; font-size: 26px; margin: 0 0 15px 0; font-weight: 700;">
            You made someone smile today. ❤️
          </h1>
          
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
            Dear <strong>${donorName.split(' ')[0]}</strong>, <br><br>
            Thank you. Because of you, there is a little less tension in the world today. You didn't just send money; you sent peace, relief, and hope.
          </p>

          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #d1d5db;">
              <p style="margin: 0 0 5px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: bold;">Campaign</p>
              <p style="margin: 0; color: #111; font-size: 16px; font-weight: 600;">${causeTitle}</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666; font-size: 15px;">
              <span>Donation Amount:</span>
              <span>₹${amount}</span>
            </div>
            ${tipRow}
            
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #111; font-size: 18px;">
              <span>Total Paid:</span>
              <span style="color: #059669;">₹${totalPaid || amount}</span>
            </div>

            <div style="margin-top: 20px; font-size: 13px; color: #9ca3af; font-family: monospace; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #eee;">
              <div>ID: ${transactionId}</div>
              <div>DATE: ${donationDate}</div>
            </div>
          </div>

          <div style="margin-top: 25px; border: 2px dashed #10B981; background-color: #ECFDF5; color: #047857; padding: 12px; text-align: center; font-weight: bold; border-radius: 8px; font-size: 13px;">
            ✅ 80G TAX EXEMPTION VALID
          </div>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
            <p style="margin: 0; font-style: italic; color: #666; font-size: 14px;">"The hands that help are holier than the lips that pray."</p>
            <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 12px; color: #D97706;">JUST HELPS FOUNDATION</p>
          </div>
        </div>
      </div>
    `;

    // --- E. SEND EMAIL & RESPOND ---
    sendEmail(donorEmail, `Receipt: You made a difference! (${transactionId})`, "Donation Successful", successHtml);
    res.json({ msg: 'Success', transactionId });

  } catch (err) {
    console.error("❌ Payment Error:", err.message);

    // --- F. FAILURE EMAIL ---
    if (donorEmail) {
      const failureHtml = `
        <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: sans-serif;">
          <div style="background-color: #ffffff; max-width: 450px; margin: 0 auto; border-radius: 12px; padding: 35px; border: 1px solid #e5e7eb;">
            <h1 style="color: #DC2626; font-size: 24px; margin-top: 0;">Transaction Failed ⚠️</h1>
            <p style="color: #4b5563;">Your attempt to donate <strong>₹${totalPaid || amount}</strong> was not completed.</p>
            <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; color: #991B1B; margin: 20px 0;">
              <strong>Cause:</strong> ${causeTitle}<br><strong>Status:</strong> Failed / Refund Initiated
            </div>
            <a href="http://localhost:5173" style="display: block; background: #DC2626; color: white; text-align: center; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: bold;">Try Again</a>
          </div>
        </div>
      `;
      sendEmail(donorEmail, `❌ Payment Failed`, "Transaction Failed", failureHtml);
    }
    
    res.status(500).json({ msg: "Payment Failed", error: err.message });
  }
});

module.exports = router;