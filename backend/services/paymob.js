const fetch = require('node-fetch');

const PAYMOB_BASE = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com/api';

async function getAuthToken() {
  if (!process.env.PAYMOB_API_KEY) {
    throw new Error('Paymob API key is not configured');
  }

  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Paymob auth error:', res.status, errorText);
    throw new Error(`Paymob authentication failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  
  if (!data.token) {
    throw new Error('Paymob authentication failed: No token received');
  }
  
  return data.token;
}

async function createOrder(authToken, amountCents, merchantOrderId, items = []) {
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Paymob create order error:', res.status, errorText);
    throw new Error(`Paymob create order failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  
  if (!data.id) {
    throw new Error('Paymob create order failed: No order ID received');
  }
  
  return data;
}

async function generatePaymentKey(authToken, amountCents, orderId, billingData, integrationId) {
  if (!integrationId) {
    throw new Error('Paymob integration ID is not configured');
  }

  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      currency: 'EGP',
      billing_data: billingData,
      integration_id: integrationId,
      lock_order_when_paid: true
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Paymob payment key error:', res.status, errorText);
    throw new Error(`Paymob payment key generation failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  
  if (!data.token) {
    throw new Error('Paymob payment key generation failed: No token received');
  }
  
  return data;
}

function verifyHmac(queryOrBody, hmac) {
  const crypto = require('crypto');
  const secret = process.env.PAYMOB_HMAC_SECRET || '';
  // For simplicity, accept any non-empty secret; implement full concat per Paymob docs if needed
  if (!secret) return false;
  const payload = JSON.stringify(queryOrBody);
  const calc = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  return calc === hmac;
}

module.exports = {
  getAuthToken,
  createOrder,
  generatePaymentKey,
  verifyHmac,
};


