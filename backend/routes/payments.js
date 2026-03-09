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
    console.log('🔍 Create order request received');
    console.log('🔍 User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
    console.log('🔍 Request body:', req.body);
    
    const { plan, paymentMethod, billing } = req.body;

    if (!plan) {
      console.error('❌ No plan provided in request');
      return res.status(400).json({
        status: 'error',
        message: 'Subscription plan is required'
      });
    }

    if (!paymentMethod) {
      console.error('❌ No payment method provided in request');
      return res.status(400).json({
        status: 'error',
        message: 'Payment method is required'
      });
    }

    // Validate plan first
    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription plan'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];

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

    // Check Paymob configuration - Test Mode
    const isTestMode = process.env.NODE_ENV === 'development' && !process.env.PAYMOB_API_KEY;
    
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 PAYMOB_API_KEY exists:', !!process.env.PAYMOB_API_KEY);
    console.log('🔍 Is Test Mode:', isTestMode);
    
    if (isTestMode) {
      console.warn('⚠️ Paymob API key not configured - Running in TEST MODE');
      console.warn('⚠️ This is a test response. Configure Paymob API keys for production.');
      
      try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planDetails.duration);

        console.log('🔍 Creating test subscription for user:', req.user.id);
        console.log('🔍 Plan details:', planDetails);

        // Create subscription record (test mode)
        const subscription = new Subscription({
          user: req.user.id,
          plan,
          status: 'pending',
          endDate,
          price: planDetails.price,
          paymentMethod,
          paymobOrderId: 'TEST_ORDER_' + Date.now(),
          paymobTransactionId: 'TEST_TRANSACTION_' + Date.now() // Provide a test value instead of null
        });

        await subscription.save();
        console.log('✅ Test subscription created:', subscription._id);

        // Return test payment data
        return res.json({
          status: 'success',
          message: 'Test mode: Payment order created (Paymob not configured)',
          data: {
            orderId: subscription.paymobOrderId,
            paymentKey: 'TEST_PAYMENT_KEY_' + Date.now(),
            amount: planDetails.price,
            currency: 'EGP',
            paymentMethod,
            redirectUrl: `https://test-payment.yoneapp.com?order=${subscription.paymobOrderId}`,
            testMode: true
          }
        });
      } catch (testError) {
        console.error('❌ Error in test mode:', testError);
        console.error('❌ Test error stack:', testError.stack);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create test payment order',
          error: testError.message
        });
      }
    }

    if (!process.env.PAYMOB_API_KEY) {
      console.error('❌ Paymob API key not configured in config.env');
      console.error('❌ Missing environment variables: PAYMOB_API_KEY');
      return res.status(500).json({
        status: 'error',
        message: 'Payment service is not configured. Please contact support.',
        code: 'PAYMENT_SERVICE_NOT_CONFIGURED',
        details: 'Paymob API keys are missing. Please configure PAYMOB_API_KEY in backend/config.env'
      });
    }

    if (!process.env.PAYMOB_INTEGRATION_ID_CARD) {
      console.error('❌ Paymob Integration ID not configured');
      return res.status(500).json({
        status: 'error',
        message: 'Payment service is not fully configured. Please contact support.',
        code: 'PAYMENT_SERVICE_NOT_CONFIGURED',
        details: 'Paymob Integration ID is missing. Please configure PAYMOB_INTEGRATION_ID_CARD in backend/config.env'
      });
    }

    // Production mode - Paymob integration
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
    
    let authToken;
    try {
      authToken = await getAuthToken();
    } catch (error) {
      console.error('Paymob authentication error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to authenticate with payment service. Please try again later.'
      });
    }

    const merchantOrderId = `ORD_${subscription._id}`;
    
    let order;
    try {
      order = await createOrder(authToken, amountCents, merchantOrderId, [
        {
          name: planDetails.name,
          amount_cents: amountCents,
          description: `${plan} subscription`,
          quantity: 1,
        },
      ]);
    } catch (error) {
      console.error('Paymob create order error:', error);
      // Clean up subscription record
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create payment order. Please try again.'
      });
    }

    if (!order || !order.id) {
      console.error('Invalid order response from Paymob:', order);
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(500).json({
        status: 'error',
        message: 'Invalid response from payment service. Please try again.'
      });
    }

    const orderId = order.id;

    // Minimal billing data (Paymob requires specific keys)
    const billingData = {
      apartment: 'NA',
      email: billing?.email || req.user.email || `${req.user.id}@example.com`,
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
    
    if (!integrationId) {
      console.error('Paymob integration ID not configured');
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(500).json({
        status: 'error',
        message: 'Payment service is not fully configured. Please contact support.'
      });
    }

    let paymentKeyResp;
    try {
      paymentKeyResp = await generatePaymentKey(authToken, amountCents, orderId, billingData, integrationId);
    } catch (error) {
      console.error('Paymob generate payment key error:', error);
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate payment key. Please try again.'
      });
    }

    if (!paymentKeyResp || !paymentKeyResp.token) {
      console.error('Invalid payment key response from Paymob:', paymentKeyResp);
      await Subscription.findByIdAndDelete(subscription._id);
      return res.status(500).json({
        status: 'error',
        message: 'Invalid response from payment service. Please try again.'
      });
    }

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
    console.error('❌ Error creating payment order:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
    
    // Try to clean up subscription if it was created
    if (req.body.plan && req.user && req.user.id) {
      try {
        await Subscription.findOneAndDelete({
          user: req.user.id,
          status: 'pending',
          plan: req.body.plan
        });
        console.log('✅ Cleaned up pending subscription');
      } catch (cleanupError) {
        console.error('❌ Error cleaning up subscription:', cleanupError);
      }
    }

    // Provide more specific error message
    let errorMessage = 'Failed to create payment order';
    let errorCode = 'PAYMENT_ORDER_ERROR';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      errorMessage = `Payment service error: ${error.response.statusText || 'Unknown error'}`;
    }

    // Log to error log
    const { logger } = require('../middleware/security');
    logger.error('Payment order creation failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      plan: req.body.plan,
      paymentMethod: req.body.paymentMethod
    });

    res.status(500).json({
      status: 'error',
      message: errorMessage,
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.stack,
        originalError: error.message 
      })
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
