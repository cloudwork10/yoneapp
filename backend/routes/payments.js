const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {
  getAuthToken,
  createOrder,
  generatePaymentKey,
  verifyHmac
} = require('../services/paymob');

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 99, // 99 EGP or $2
    duration: 30, // days
    discount: 0
  },
  quarterly: {
    name: 'Quarterly Plan',
    price: 199, // 199 EGP or $4
    duration: 90, // days
    discount: 33 // (297-199)/297 * 100
  },
  'semi-annual': {
    name: 'Semi-Annual Plan',
    price: 299, // 299 EGP or $6
    duration: 180, // days
    discount: 50 // (594-299)/594 * 100
  },
  annual: {
    name: 'Annual Plan',
    price: 499, // 499 EGP or $8
    duration: 365, // days
    discount: 58 // (1188-499)/1188 * 100
  }
};

// Get subscription plans
router.get('/plans', (req, res) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      discount: plan.discount,
      originalPrice: Math.round(plan.price / (1 - plan.discount / 100))
    }));

    res.json({
      status: 'success',
      data: { plans }
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription plans'
    });
  }
});

// Get user's current subscription
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        status: 'success',
        data: { subscription: null }
      });
    }

    res.json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription'
    });
  }
});

// Create payment order (Paymob)
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { plan, paymentMethod, billing } = req.body;

    // Validate plan
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription plan'
      });
    }

    // Validate payment method
    const validPaymentMethods = ['visa', 'mastercard', 'vodafone_cash', 'fawry', 'valu'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment method'
      });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has an active subscription'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.duration);

    // Create subscription record
    const subscription = new Subscription({
      user: req.user.id,
      plan,
      status: 'pending',
      endDate,
      price: planDetails.price,
      paymentMethod,
      paymobOrderId: null,
      paymobTransactionId: null
    });

    await subscription.save();

    // Paymob integration
    const amountCents = planDetails.price * 100;
    const authToken = await getAuthToken();
    const merchantOrderId = `ORD_${subscription._id}`;
    const order = await createOrder(authToken, amountCents, merchantOrderId, [
      {
        name: planDetails.name,
        amount_cents: amountCents,
        description: `${plan} subscription`,
        quantity: 1,
      },
    ]);
    const orderId = order.id;

    // Minimal billing data (Paymob requires specific keys)
    const billingData = {
      apartment: 'NA',
      email: billing?.email || `${req.user.id}@example.com`,
      floor: 'NA',
      first_name: billing?.first_name || (req.user.name || 'User').split(' ')[0],
      street: 'NA',
      building: 'NA',
      phone_number: billing?.phone || '0000000000',
      shipping_method: 'NA',
      postal_code: 'NA',
      city: 'Cairo',
      country: 'EG',
      last_name: billing?.last_name || (req.user.name || 'User').split(' ').slice(1).join(' ') || 'User',
      state: 'NA',
    };

    const integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
    const paymentKeyResp = await generatePaymentKey(authToken, amountCents, orderId, billingData, integrationId);
    const paymentKey = paymentKeyResp.token;

    // Save payment record
    const payment = new Payment({
      user: req.user.id,
      subscription: subscription._id,
      amount: planDetails.price,
      paymentMethod,
      paymobOrderId: String(orderId),
      paymobTransactionId: '',
      paymobPaymentKey: paymentKey
    });

    await payment.save();

    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const redirectUrl = iframeId
      ? `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`
      : `https://accept.paymob.com/api/acceptance/iframes?payment_token=${paymentKey}`;

    res.json({
      status: 'success',
      data: {
        orderId: payment.paymobOrderId,
        paymentKey,
        amount: planDetails.price,
        currency: 'EGP',
        paymentMethod,
        redirectUrl
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment order'
    });
  }
});

// Handle payment success webhook (HMAC optional basic)
router.post('/webhook/success', async (req, res) => {
  try {
    const { obj, hmac } = req.body;
    if (process.env.PAYMOB_HMAC_SECRET && !verifyHmac(req.body, hmac)) {
      return res.status(401).json({ status: 'error', message: 'Invalid HMAC' });
    }
    const orderId = String(obj?.order?.id || obj?.order_id || req.body.orderId);
    const transactionId = String(obj?.id || req.body.transactionId || '');

    // Find the payment record
    const payment = await Payment.findOne({
      paymobOrderId: orderId
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.paymobTransactionId = transactionId;
    payment.paymobResponse = req.body;
    await payment.save();

    // Update subscription status
    const subscription = await Subscription.findById(payment.subscription);
    if (subscription) {
      subscription.status = 'active';
      await subscription.save();
    }

    res.json({
      status: 'success',
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process payment'
    });
  }
});

// Handle payment failure webhook
router.post('/webhook/failure', async (req, res) => {
  try {
    const { obj, hmac } = req.body;
    if (process.env.PAYMOB_HMAC_SECRET && !verifyHmac(req.body, hmac)) {
      return res.status(401).json({ status: 'error', message: 'Invalid HMAC' });
    }
    const orderId = String(obj?.order?.id || obj?.order_id || req.body.orderId);
    const transactionId = String(obj?.id || req.body.transactionId || '');
    const failureReason = obj?.data?.message || req.body.failureReason || 'unknown';

    // Find the payment record
    const payment = await Payment.findOne({
      paymobOrderId: orderId
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'failed';
    payment.failureReason = failureReason;
    payment.paymobTransactionId = transactionId;
    payment.paymobResponse = req.body;
    await payment.save();

    // Update subscription status
    const subscription = await Subscription.findById(payment.subscription);
    if (subscription) {
      subscription.status = 'cancelled';
      await subscription.save();
    }

    res.json({
      status: 'success',
      message: 'Payment failure processed'
    });
  } catch (error) {
    console.error('Error processing payment failure:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process payment failure'
    });
  }
});

// Check subscription status for content access
router.get('/check-access', requireAuth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    const hasAccess = subscription && subscription.endDate > new Date();

    res.json({
      status: 'success',
      data: {
        hasAccess,
        subscription: hasAccess ? subscription : null
      }
    });
  } catch (error) {
    console.error('Error checking subscription access:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check subscription access'
    });
  }
});

module.exports = router;
