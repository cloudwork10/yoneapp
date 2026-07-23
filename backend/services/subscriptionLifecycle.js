const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendPushToUser, sendExpoPushMessages } = require('./pushNotifications');

const DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_NAMES = {
  monthly: 'Monthly Plan',
  quarterly: 'Quarterly Plan',
  'semi-annual': 'Semi-Annual Plan',
  annual: 'Annual Plan',
};

function cairoNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
  };
}

function cairoDateKey(date) {
  const p = cairoNowParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

function remainingDays(endDate, now = new Date()) {
  const ms = new Date(endDate).getTime() - now.getTime();
  return Math.ceil(ms / DAY_MS);
}

async function getAdminUsers() {
  return User.find({
    $or: [{ isAdmin: true }, { role: 'admin' }],
    pushToken: { $exists: true, $ne: null },
  }).select('pushToken name email');
}

async function notifyAdmins(title, body, data = {}) {
  const admins = await getAdminUsers();
  if (!admins.length) return { ok: false, sent: 0 };
  return sendExpoPushMessages(
    admins.map((admin) => ({
      to: admin.pushToken,
      title,
      body,
      data,
    }))
  );
}

/**
 * Mark past-due active subscriptions as expired + notify user & admins.
 */
async function expireDueSubscriptions(now = new Date()) {
  const due = await Subscription.find({
    status: 'active',
    endDate: { $lte: now },
  }).populate('user', 'name email pushToken');

  let expired = 0;
  for (const sub of due) {
    sub.status = 'expired';
    sub.isSubscriptionActive = false;
    sub.autoRenew = false;

    const already = sub.reminders?.expiredNotified;
    if (!sub.reminders) sub.reminders = {};
    sub.reminders.expiredNotified = true;
    await sub.save();
    expired += 1;

    if (already) continue;

    const planName = PLAN_NAMES[sub.plan] || sub.plan;
    const user = sub.user;
    const userName = user?.name || 'User';

    await sendPushToUser(user, {
      title: 'انتهى الاشتراك',
      body: `اشتراك ${planName} خلص والمحتوى المميز اتقفل. جدّد من التطبيق عشان ترجع تفتحه.`,
      data: { type: 'subscription_expired', plan: sub.plan },
    });

    await notifyAdmins(
      'اشتراك خلص',
      `${userName} — ${planName} انتهى. المحتوى اتقفل.`,
      {
        type: 'admin_subscription_expired',
        userId: String(user?._id || ''),
        plan: sub.plan,
      }
    );
  }

  return { expired };
}

/**
 * Send renewal reminders: 2 days before, same day, lock-tonight evening.
 */
async function sendRenewalReminders(now = new Date()) {
  const cairo = cairoNowParts(now);
  const todayKey = cairoDateKey(now);

  const active = await Subscription.find({
    status: 'active',
    endDate: { $gt: now },
  }).populate('user', 'name email pushToken');

  let twoDays = 0;
  let sameDay = 0;
  let lockTonight = 0;

  for (const sub of active) {
    if (!sub.reminders) sub.reminders = {};
    const daysLeft = remainingDays(sub.endDate, now);
    const endKey = cairoDateKey(sub.endDate);
    const planName = PLAN_NAMES[sub.plan] || sub.plan;
    const user = sub.user;
    let dirty = false;

    // 2 days before
    if (daysLeft === 2 && !sub.reminders.twoDaysBefore) {
      await sendPushToUser(user, {
        title: 'تذكير: الاشتراك هينتهي بعد يومين',
        body: `اشتراك ${planName} هينتهي بعد يومين. جدّد دلوقتي عشان المحتوى يفضل مفتوح.`,
        data: { type: 'subscription_remind_2d', plan: sub.plan },
      });
      sub.reminders.twoDaysBefore = true;
      dirty = true;
      twoDays += 1;
    }

    // Same calendar day (morning window 8–14 Cairo)
    if (
      endKey === todayKey &&
      cairo.hour >= 8 &&
      cairo.hour < 15 &&
      !sub.reminders.sameDay
    ) {
      await sendPushToUser(user, {
        title: 'اشتراكك بينتهي النهاردة',
        body: `اشتراك ${planName} بينتهي النهاردة. جدّد دلوقتي قبل ما المحتوى يتقفل.`,
        data: { type: 'subscription_remind_same_day', plan: sub.plan },
      });
      sub.reminders.sameDay = true;
      dirty = true;
      sameDay += 1;
    }

    // Tonight lock warning (21–23 Cairo on end day)
    if (
      endKey === todayKey &&
      cairo.hour >= 21 &&
      !sub.reminders.lockTonight
    ) {
      await sendPushToUser(user, {
        title: 'المحتوى هيتقفل الليلة',
        body: `اشتراك ${planName} هينتهي الليلة والمحتوى المميز هيتقفل. جدّد الآن.`,
        data: { type: 'subscription_remind_lock_tonight', plan: sub.plan },
      });
      await notifyAdmins(
        'اشتراك هينتهي الليلة',
        `${user?.name || 'User'} — ${planName} هينتهي الليلة`,
        {
          type: 'admin_subscription_ending_tonight',
          userId: String(user?._id || ''),
          plan: sub.plan,
        }
      );
      sub.reminders.lockTonight = true;
      dirty = true;
      lockTonight += 1;
    }

    if (dirty) await sub.save();
  }

  return { twoDays, sameDay, lockTonight };
}

async function runSubscriptionLifecycleJob() {
  const now = new Date();
  const expiredResult = await expireDueSubscriptions(now);
  const remindResult = await sendRenewalReminders(now);
  return { at: now.toISOString(), ...expiredResult, ...remindResult };
}

/**
 * If subscription is past endDate, mark expired (used on read paths).
 */
async function ensureSubscriptionNotStale(subscription) {
  if (!subscription) return null;
  if (subscription.status === 'active' && new Date(subscription.endDate) <= new Date()) {
    subscription.status = 'expired';
    subscription.isSubscriptionActive = false;
    if (!subscription.reminders) subscription.reminders = {};
    const already = subscription.reminders.expiredNotified;
    subscription.reminders.expiredNotified = true;
    await subscription.save();
    if (!already) {
      const user = await User.findById(subscription.user).select('pushToken name email');
      const planName = PLAN_NAMES[subscription.plan] || subscription.plan;
      await sendPushToUser(user, {
        title: 'انتهى الاشتراك',
        body: `اشتراك ${planName} خلص والمحتوى اتقفل. جدّد من التطبيق.`,
        data: { type: 'subscription_expired', plan: subscription.plan },
      });
    }
    return null;
  }
  if (subscription.status !== 'active') return null;
  if (new Date(subscription.endDate) <= new Date()) return null;
  return subscription;
}

module.exports = {
  runSubscriptionLifecycleJob,
  expireDueSubscriptions,
  sendRenewalReminders,
  ensureSubscriptionNotStale,
  remainingDays,
  PLAN_NAMES,
};
