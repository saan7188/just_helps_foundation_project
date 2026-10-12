const express = require('express');
const crypto = require('crypto');
const { randomUUID } = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

const Donation = require('../models/Donation');
const Cause = require('../models/Cause');
const sendEmail = require('../utils/sendEmail');
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const admin = require('../middleware/adminMiddleware');

const impactByCategory = {
  Food: 'You made someone worry a little less about their next meal.',
  Healthcare: 'You helped someone focus on getting better instead of worrying alone.',
  Education: 'You gave a learner one more reason to keep going.',
  Shelter: 'You helped make someone’s day a little safer.',
  'Girl Child': 'You helped turn a basic need into one less thing to worry about.',
  Emergency: 'You were there when someone needed help quickly.',
  General: 'You made someone’s day a little easier.'
};

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const error = new Error('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend environment.');
    error.status = 503;
    throw error;
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
};

const validAmount = value => Number.isFinite(value) && value >= 1 && value <= 1000000;

// Donations are open to guests. A valid session is optional and is used only to
// associate a donation with a donor account when the signed-in role is donor.
const optionalAuth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    return res.status(401).json({ msg: 'Your session has expired. Sign in again or continue as a guest.' });
  }
};

router.get('/all', auth, admin, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 }).lean();
    res.json(donations);
  } catch (error) {
    console.error('Donation list error:', error);
    res.status(500).json({ msg: 'Unable to load donations' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('email role');
    if (!user) return res.status(404).json({ msg: 'Account not found.' });
    if (user.role !== 'donor') return res.status(403).json({ msg: 'Donation user access required.' });
    const donations = await Donation.find({ $or: [{ userId: user._id }, { donorEmail: user.email }], paymentStatus: 'success' }).sort({ date: -1 }).lean();
    res.json(donations);
  } catch (error) {
    console.error('Donor history error:', error);
    res.status(500).json({ msg: 'Unable to load donation history.' });
  }
});

// Create a server-side Razorpay order. The browser never receives the key secret.
router.post('/create-order', optionalAuth, async (req, res) => {
  try {
    const { client, keyId } = getRazorpay();
    const User = require('../models/User');
    let account = null;
    if (req.user?.id && req.user.id !== 'admin') {
      account = await User.findById(req.user.id);
      if (!account) return res.status(401).json({ msg: 'Your account could not be found. Continue as a guest or sign in again.' });
      if (account.role !== 'donor') account = null;
    }
    const {
      donorName, donorEmail, amount, tip = 0, causeId,
      causeTitle, category = 'General', isAnonymous = false, dedication = ''
    } = req.body;

    const donationAmount = Number(amount);
    const tipAmount = Number(tip);
    const totalPaid = donationAmount + tipAmount;
    const normalizedName = String(account?.name || donorName || '').trim();
    const normalizedEmail = String(account?.email || donorEmail || '').trim().toLowerCase();

    if (!normalizedName || normalizedName.length > 100 || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ msg: 'Enter a valid name and email.' });
    }
    if (!validAmount(donationAmount) || !Number.isFinite(tipAmount) || tipAmount < 0 || tipAmount > 100000 || totalPaid > 1100000) {
      return res.status(400).json({ msg: 'Enter a valid donation amount.' });
    }

    let cause = null;
    if (causeId) {
      if (!/^[a-f\d]{24}$/i.test(String(causeId))) {
        return res.status(400).json({ msg: 'Invalid campaign ID.' });
      }
      cause = await Cause.findOne({
        _id: causeId,
        isVerified: true,
        $or: [{ status: 'approved' }, { status: { $exists: false } }]
      });
      if (!cause) return res.status(404).json({ msg: 'Campaign not found or not approved.' });
      if (Number(cause.collected || 0) + donationAmount > Number(cause.target)) {
        return res.status(400).json({ msg: 'This donation would exceed the campaign goal.' });
      }
    }

    const recordedCategory = String(cause?.category || category || 'General').trim().slice(0, 50);
    const recordedCauseTitle = String(cause?.title || causeTitle || 'General Donation').trim().slice(0, 200);
    const order = await client.orders.create({
      amount: Math.round(totalPaid * 100),
      currency: 'INR',
      receipt: `jh_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
      notes: { project: 'Just Helps Foundation', mode: 'test' }
    });

    const donation = await Donation.create({
      userId: account?._id || null,
      donorName: normalizedName,
      donorEmail: normalizedEmail,
      amount: donationAmount,
      tipAmount,
      totalPaid,
      cause: cause ? String(cause._id) : 'general',
      causeTitle: recordedCauseTitle,
      category: recordedCategory,
      isAnonymous: Boolean(isAnonymous),
      dedication: String(dedication || '').trim().slice(0, 500),
      paymentStatus: 'pending',
      paymentMethod: 'razorpay_test',
      razorpayOrderId: order.id
    });

    return res.status(201).json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      donationId: donation._id,
      mode: 'test'
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return res.status(error.status || 500).json({ msg: error.status ? error.message : 'Unable to create Razorpay test order.' });
  }
});

// Verify the signature and confirm Razorpay reports a captured payment for this exact order.
router.post('/verify', optionalAuth, async (req, res) => {
  try {
    const { client, keySecret } = getRazorpay();
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ msg: 'Missing Razorpay payment verification details.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const supplied = Buffer.from(String(signature), 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return res.status(400).json({ msg: 'Payment signature is invalid.' });
    }

    const donation = await Donation.findOne({ razorpayOrderId: orderId });
    if (!donation) return res.status(404).json({ msg: 'Donation order not found.' });
    // Account-linked donations can only be verified by that same account. Guest
    // orders have no userId and can be verified without registration or login.
    if (donation.userId && String(donation.userId) !== String(req.user?.id || '')) {
      return res.status(403).json({ msg: 'This donation belongs to another account.' });
    }

    if (donation.paymentStatus === 'success') {
      if (donation.razorpayPaymentId !== paymentId) {
        return res.status(409).json({ msg: 'This order was already verified with a different payment.' });
      }
      return res.json({
        msg: 'Payment already verified.',
        transactionId: donation.transactionId,
        category: donation.category,
        causeTitle: donation.causeTitle,
        impactMessage: impactByCategory[donation.category] || impactByCategory.General
      });
    }
    if (donation.paymentStatus !== 'pending') {
      return res.status(409).json({ msg: 'This donation order is no longer pending.' });
    }

    const payment = await client.payments.fetch(paymentId);
    if (payment.order_id !== orderId || Number(payment.amount) !== Math.round(donation.totalPaid * 100) || payment.currency !== 'INR') {
      return res.status(400).json({ msg: 'Payment details do not match this donation.' });
    }
    if (payment.status !== 'captured') {
      return res.status(409).json({ msg: 'Payment is not captured yet. Please wait and try again.' });
    }

    // Claim this pending record once so duplicate callbacks cannot add to campaign totals twice.
    const transactionId = `JH-TEST-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const claimed = await Donation.findOneAndUpdate(
      { _id: donation._id, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'success', paymentMethod: 'razorpay_test', razorpayPaymentId: paymentId, transactionId } },
      { new: true }
    );
    if (!claimed) {
      const latest = await Donation.findById(donation._id);
      if (latest?.paymentStatus === 'success' && latest.razorpayPaymentId === paymentId) {
        return res.json({
          msg: 'Payment already verified.',
          transactionId: latest.transactionId,
          category: latest.category,
          causeTitle: latest.causeTitle,
          impactMessage: impactByCategory[latest.category] || impactByCategory.General
        });
      }
      return res.status(409).json({ msg: 'This donation is already being processed or is no longer pending.' });
    }

    if (claimed.cause && claimed.cause !== 'general') {
      const updatedCause = await Cause.findOneAndUpdate(
        {
          _id: claimed.cause,
          isVerified: true,
          $or: [{ status: 'approved' }, { status: { $exists: false } }],
          $expr: { $lte: [{ $add: ['$collected', claimed.amount] }, '$target'] }
        },
        { $inc: { collected: claimed.amount } },
        { new: true }
      );
      if (!updatedCause) {
        await Donation.updateOne({ _id: claimed._id }, { $set: { paymentStatus: 'failed' } });
        return res.status(409).json({ msg: 'Payment was received but the campaign goal changed. Please contact support.' });
      }
    }

    const safeName = escapeHtml(claimed.donorName);
    const safeCause = escapeHtml(claimed.causeTitle || 'General Donation');
    const receiptHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
        <h2 style="color:#D97706">Just Helps — Razorpay Test Receipt</h2>
        <p>Thank you, ${safeName}.</p>
        <p><strong>Campaign:</strong> ${safeCause}</p>
        <p><strong>Donation:</strong> ₹${claimed.amount.toFixed(2)}</p>
        <p><strong>Platform tip:</strong> ₹${claimed.tipAmount.toFixed(2)}</p>
        <p><strong>Total:</strong> ₹${claimed.totalPaid.toFixed(2)}</p>
        <p><strong>Test transaction:</strong> ${transactionId}</p>
        <p><strong>Razorpay payment ID:</strong> ${escapeHtml(paymentId)}</p>
        <p style="color:#6B7280;font-size:13px">Razorpay Test Mode only. No real money was charged. This is not a tax certificate.</p>
      </div>`;

    try {
      await sendEmail(
        claimed.donorEmail,
        `Just Helps Test Receipt — ${transactionId}`,
        `Razorpay test payment verified. Test transaction: ${transactionId}. No real money was charged.`,
        receiptHtml
      );
    } catch (emailError) {
      console.error('Test receipt email error:', emailError);
    }

    return res.json({
      msg: 'Razorpay test payment verified.',
      transactionId,
      paymentMode: 'razorpay_test',
      category: claimed.category,
      causeTitle: claimed.causeTitle,
      impactMessage: impactByCategory[claimed.category] || impactByCategory.General
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return res.status(error.status || 500).json({ msg: error.status ? error.message : 'Unable to verify test payment.' });
  }
});

router.post('/cancel', async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || '');
    if (!orderId) return res.status(400).json({ msg: 'Order ID is required.' });
    await Donation.updateOne(
      { razorpayOrderId: orderId, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'cancelled' } }
    );
    return res.json({ msg: 'Pending test donation cancelled.' });
  } catch (error) {
    console.error('Razorpay cancel error:', error);
    return res.status(500).json({ msg: 'Unable to cancel donation order.' });
  }
});

module.exports = router;
