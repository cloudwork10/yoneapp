const crypto = require('crypto');
const Setting = require('../models/Setting');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const SETTING_KEY = 'whatsappGrantPhones';
const GRANT_DAYS = 365;
const GRANT_PLAN = 'annual';

let cache = { at: 0, keys: new Set() };

function digitsOnly(raw) {
  return String(raw || '').replace(/[^\d]/g, '').replace(/^00/, '');
}

/** Canonical Egypt mobile: 201XXXXXXXXX plus last 10 digits for form variants. */
function phoneKeys(raw) {
  const digits = digitsOnly(raw);
  if (!digits) return [];
  let canon = digits;
  if (/^201\d{9}$/.test(digits)) canon = digits;
  else if (/^01\d{9}$/.test(digits)) canon = `20${digits.slice(1)}`;
  else if (/^1\d{9}$/.test(digits)) canon = `20${digits}`;
  else if (digits.startsWith('20') && digits.length >= 11) canon = digits;
  const keys = new Set([canon, digits]);
  const national = canon.startsWith('20') ? canon.slice(2) : canon.replace(/^0+/, '');
  if (national.length >= 9) keys.add(national.slice(-10));
  return [...keys];
}

function parsePhoneList(input) {
  const raw = Array.isArray(input)
    ? input
    : String(input || '')
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
  const keys = new Set();
  raw.forEach((item) => {
    phoneKeys(item).forEach((key) => keys.add(key));
  });
  return [...keys];
}

async function loadAllowKeys(force = false) {
  if (!force && cache.at && Date.now() - cache.at < 30 * 1000) return cache.keys;
  const setting = await Setting.findOne({ key: SETTING_KEY });
  const stored = Array.isArray(setting?.value?.phones) ? setting.value.phones : [];
  cache = { at: Date.now(), keys: new Set(stored) };
  return cache.keys;
}

async function saveAllowKeys(keys) {
  const phones = [...keys];
  await Setting.findOneAndUpdate(
    { key: SETTING_KEY },
    { value: { phones, plan: GRANT_PLAN, days: GRANT_DAYS, updatedAt: new Date().toISOString() } },
    { upsert: true, new: true }
  );
  cache = { at: Date.now(), keys: new Set(phones) };
  return phones.length;
}

async function addGrantPhones(input, { replace = false } = {}) {
  const incoming = parsePhoneList(input);
  const current = replace ? new Set() : await loadAllowKeys(true);
  incoming.forEach((key) => current.add(key));
  const count = await saveAllowKeys(current);
  const activated = await activateMatchingExistingUsers();
  return { storedKeys: count, added: incoming.length, activated };
}

function userMatchesAllowlist(user, allowKeys) {
  return phoneKeys(user?.phone).some((key) => allowKeys.has(key));
}

async function activateIfAllowlisted(userDoc) {
  if (!userDoc?._id || !userDoc.phone) return null;
  const allowKeys = await loadAllowKeys();
  if (!allowKeys.size || !userMatchesAllowlist(userDoc, allowKeys)) return null;

  const existing = await Subscription.findOne({
    user: userDoc._id,
    status: 'active',
    endDate: { $gt: new Date() },
  });
  if (existing) return existing;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + GRANT_DAYS);
  const stamp = `${userDoc._id}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  return Subscription.create({
    user: userDoc._id,
    plan: GRANT_PLAN,
    status: 'active',
    startDate,
    endDate,
    autoRenew: false,
    price: 0,
    currency: 'EGP',
    paymentMethod: 'manual',
    paymobOrderId: `WA_GRANT_${stamp}`,
    paymobTransactionId: stamp,
    isSubscriptionActive: true,
  });
}

async function activateMatchingExistingUsers() {
  const allowKeys = await loadAllowKeys(true);
  if (!allowKeys.size) return 0;
  const users = await User.find({ phone: { $nin: [null, ''] } }).select('_id phone');
  let activated = 0;
  for (const user of users) {
    if (!userMatchesAllowlist(user, allowKeys)) continue;
    const before = await Subscription.findOne({
      user: user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    });
    if (before) continue;
    const created = await activateIfAllowlisted(user);
    if (created) activated += 1;
  }
  return activated;
}

async function grantStats() {
  const keys = await loadAllowKeys(true);
  const users = await User.find({ phone: { $nin: [null, ''] } }).select('_id phone');
  let matchedUsers = 0;
  for (const user of users) {
    if (userMatchesAllowlist(user, keys)) matchedUsers += 1;
  }
  return { phoneKeys: keys.size, matchedUsers, plan: GRANT_PLAN, days: GRANT_DAYS };
}

module.exports = {
  SETTING_KEY,
  phoneKeys,
  parsePhoneList,
  addGrantPhones,
  activateIfAllowlisted,
  activateMatchingExistingUsers,
  grantStats,
};
