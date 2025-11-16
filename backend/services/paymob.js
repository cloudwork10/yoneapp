const fetch = require('node-fetch');

const PAYMOB_BASE = process.env.PAYMOB_BASE_URL || 'https://accept.paymob.com/api';

async function getAuthToken() {
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
  });
  if (!res.ok) {
    throw new Error(`Paymob auth failed: ${res.status}`);
  }
  const data = await res.json();
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
    throw new Error(`Paymob create order failed: ${res.status}`);
  }
  return await res.json();
}

async function generatePaymentKey(authToken, amountCents, orderId, billingData, integrationId) {
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
    throw new Error(`Paymob payment_key failed: ${res.status}`);
  }
  return await res.json();
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


