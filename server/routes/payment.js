const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();

const Donation = require('../models/Donation');
const Cause = require('../models/Cause');
const sendEmail = require('../utils/sendEmail');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// This project intentionally uses a free demo payment flow.
// No real card/UPI details are collected or stored.

const createTransactionId = () =>
  `JH-DEMO-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

router.get('/all', auth, admin, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 }).lean();
    res.json(donations);
  } catch (error) {
    console.error('Donation list error:', error);
    res.status(500).json({ msg: 'Unable to load donations' });
  }
});

router.post('/donate', async (req, res) => {
  const {
    donorName,
    donorEmail,
    amount,
    tip = 0,
    causeId,
    causeTitle,
    isAnonymous = false,
    dedication = ''
  } = req.body;

  const donationAmount = Number(amount);
  const tipAmount = Number(tip);
  const totalPaid = donationAmount + tipAmount;

  if (!donorName?.trim() || !donorEmail?.trim()) {
    return res.status(400).json({ msg: 'Name and email are required' });
  }

  if (!Number.isFinite(donationAmount) || donationAmount < 1) {
    return res.status(400).json({ msg: 'Donation amount must be at least ₹1' });
  }

  if (!Number.isFinite(tipAmount) || tipAmount < 0) {
    return res.status(400).json({ msg: 'Invalid tip amount' });
  }

  try {
    let cause = null;

    if (causeId) {
      if (!/^[a-f\d]{24}$/i.test(causeId)) {
        return res.status(400).json({ msg: 'Invalid campaign ID' });
      }

      cause = await Cause.findOne({ _id: causeId, isVerified: true });
      if (!cause) {
        return res.status(404).json({ msg: 'Campaign not found' });
      }
    }

    const transactionId = createTransactionId();

    const donation = await Donation.create({
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      amount: donationAmount,
      tipAmount,
      totalPaid,
      cause: cause ? String(cause._id) : 'general',
      causeTitle: cause?.title || causeTitle || 'General Donation',
      isAnonymous: Boolean(isAnonymous),
      dedication: dedication.trim(),
      transactionId
    });

    if (cause) {
      await Cause.updateOne(
        { _id: cause._id },
        { $inc: { collected: donationAmount } }
      );
    }

    // Receipt is a demo receipt. It must not claim that a real payment
    // processor or tax exemption was used.
    const receiptHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
        <h2 style="color:#D97706">Just Helps — Demo Donation Receipt</h2>
        <p>Thank you, ${donorName.trim()}.</p>
        <p>This portfolio project records simulated donations for demonstration purposes.</p>
        <hr>
        <p><strong>Campaign:</strong> ${cause?.title || causeTitle || 'General Donation'}</p>
        <p><strong>Donation:</strong> ₹${donationAmount.toFixed(2)}</p>
        <p><strong>Platform tip:</strong> ₹${tipAmount.toFixed(2)}</p>
        <p><strong>Total:</strong> ₹${totalPaid.toFixed(2)}</p>
        <p><strong>Demo transaction:</strong> ${transactionId}</p>
        <p style="color:#6B7280;font-size:13px">
          No real payment was processed. This receipt is not a tax certificate.
        </p>
      </div>
    `;

    // Email failure should not undo a successfully recorded demo donation.
    try {
      await sendEmail(
        donation.donorEmail,
        `Just Helps Demo Receipt — ${transactionId}`,
        `Demo donation recorded. Transaction: ${transactionId}`,
        receiptHtml
      );
    } catch (emailError) {
      console.error('Receipt email error:', emailError);
    }

    return res.status(201).json({
      msg: 'Demo donation recorded',
      transactionId,
      paymentMode: 'demo',
      donationId: donation._id
    });
  } catch (error) {
    console.error('Donation error:', error);
    return res.status(500).json({ msg: 'Unable to record donation' });
  }
});

module.exports = router;
