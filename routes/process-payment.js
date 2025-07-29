// backend/api/process-payment.js (Node.js/Express example)
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Change the route to match frontend call
router.post('/api/process-payment', async (req, res) => {
  try {
    const { payment_method_id, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents and ensure integer
      currency: 'lkr', // Change to LKR for Sri Lankan Rupees
      payment_method: payment_method_id,
      confirmation_method: 'manual',
      confirm: true,
      return_url: 'http://localhost:5176/payment/return',
    });

    if (paymentIntent.status === 'succeeded') {
      // Payment successful
      res.json({
        success: true,
        transaction_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status
      });
    } else if (paymentIntent.status === 'requires_action') {
      // 3D Secure authentication required
      res.json({
        success: false,
        requires_action: true,
        client_secret: paymentIntent.client_secret
      });
    } else {
      res.json({
        success: false,
        error: 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
});

module.exports = router;