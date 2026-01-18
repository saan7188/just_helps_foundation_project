exports.otpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center;">Verify Your Identity</h2>
        <p style="text-align: center; color: #666;">Use the code below to access the JustHelps Secure Terminal.</p>
        
        <div style="background: #1a1918; color: #ff5c4d; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px;">
          ${otp}
        </div>
        
        <p style="text-align: center; font-size: 12px; color: #999;">This code expires in 10 minutes.</p>
      </div>
    </div>
  `;
};

// A function that returns the HTML for the Receipt Email
exports.receiptTemplate = (amount, campaignTitle, transactionId, date) => {
  return `
    <div style="font-family: 'Courier New', monospace; background-color: #eee; padding: 40px;">
      <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-top: 5px solid #ff5c4d;">
        <h2 style="margin: 0; border-bottom: 2px dashed #000; padding-bottom: 10px;">OFFICIAL RECEIPT</h2>
        <p style="font-size: 12px; color: #555; margin-top: 10px;">ID: ${transactionId} | DATE: ${date}</p>
        
        <div style="margin: 20px 0; padding: 15px; background: #1a1918; color: #fff;">
          <p style="margin: 0; font-size: 10px; color: #ff5c4d;">CAMPAIGN</p>
          <h3 style="margin: 0; font-size: 16px;">${campaignTitle}</h3>
          <p style="margin: 15px 0 0 0; font-size: 10px; color: #ff5c4d;">PAID AMOUNT</p>
          <h1 style="margin: 0; font-size: 30px;">₹${amount}</h1>
        </div>
        
        <p style="font-size: 12px; text-align: center; color: #888;">JustHelps India • Verified System</p>
      </div>
    </div>
  `;
};