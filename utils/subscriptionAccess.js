import { Alert } from 'react-native';
import API_BASE_URL from '../config/api';
import { makeAuthenticatedRequest } from './tokenRefresh';

/** Primary subscribe screen (manual transfer flow) */
export const SUBSCRIBE_ROUTE = '/subscription-2';

export const PLAN_LABELS = {
  monthly: { en: 'Monthly Plan', ar: 'الباقة الشهرية', days: 30 },
  quarterly: { en: 'Quarterly Plan', ar: 'الباقة الربع سنوية', days: 90 },
  'semi-annual': { en: 'Semi-Annual Plan', ar: 'الباقة نصف السنوية', days: 180 },
  annual: { en: 'Annual Plan', ar: 'الباقة السنوية', days: 365 },
};

export function planLabel(planId) {
  return PLAN_LABELS[planId] || { en: planId || 'Plan', ar: planId || 'باقة', days: 0 };
}

/**
 * @returns {Promise<{
 *   hasActiveSubscription: boolean,
 *   subscription: object|null,
 *   pendingRequest: object|null,
 *   latestRequest: object|null,
 *   status: 'active'|'pending'|'rejected'|'cancelled'|'none'
 * }>}
 */
export async function fetchSubscriptionAccess() {
  let subscription = null;
  let hasActiveSubscription = false;
  let pendingRequest = null;
  let latestRequest = null;

  try {
    const [subRes, reqRes] = await Promise.all([
      makeAuthenticatedRequest(`${API_BASE_URL}/api/payments/subscription`),
      makeAuthenticatedRequest(`${API_BASE_URL}/api/subscription-requests/mine`),
    ]);

    if (subRes.ok) {
      const data = await subRes.json();
      if (data.status === 'success' && data.data?.subscription) {
        subscription = data.data.subscription;
        hasActiveSubscription =
          subscription.status === 'active' &&
          new Date(subscription.endDate) > new Date();
      }
    }

    if (reqRes.ok) {
      const data = await reqRes.json();
      pendingRequest = data?.data?.pending || null;
      latestRequest = data?.data?.latest || null;
    }
  } catch {
    // keep defaults
  }

  let status = 'none';
  if (hasActiveSubscription) status = 'active';
  else if (pendingRequest) status = 'pending';
  else if (latestRequest?.status === 'rejected') status = 'rejected';
  else if (latestRequest?.status === 'cancelled') status = 'cancelled';

  return {
    hasActiveSubscription,
    subscription,
    pendingRequest,
    latestRequest,
    status,
  };
}

export function getPremiumGateCopy(access, contentWord = 'content') {
  const pending = access?.pendingRequest;
  const latest = access?.latestRequest;
  const label = planLabel(pending?.plan || latest?.plan);

  if (access?.status === 'pending' && pending) {
    return {
      title: '⏳ Pending activation',
      message:
        `You selected ${label.en} (EGP ${pending.price}).\n` +
        `Your request is under review — premium ${contentWord} unlocks after activation.\n\n` +
        `اخترت ${label.ar} (${pending.price} ج).\n` +
        `طلبك قيد المراجعة — هتقدر تدخل بعد التفعيل.`,
      actionLabel: 'Check status · متابعة الحالة',
    };
  }

  if (access?.status === 'rejected') {
    const note = latest?.adminNote ? `\n${latest.adminNote}` : '';
    return {
      title: 'Request not approved',
      message:
        `Your last subscription request was rejected.${note}\n` +
        `Submit again to unlock premium ${contentWord}.\n\n` +
        `طلب الاشتراك السابق اترفض.${note ? `\n${latest.adminNote}` : ''}\n` +
        `ابعت طلب جديد عشان تفتح المحتوى.`,
      actionLabel: 'Submit again · إرسال طلب جديد',
    };
  }

  return {
    title: '🔒 Premium Content',
    message:
      `This ${contentWord} needs an active subscription.\n` +
      `Subscribe, transfer, upload your receipt — we activate your access.\n\n` +
      `المحتوى ده محتاج اشتراك نشط.\n` +
      `اشترك · حوّل · ارفع السكرين — ويتم التفعيل.`,
    actionLabel: 'Subscribe · اشترك',
  };
}

/** Show lock alert and route to subscription status / subscribe screen */
export function showPremiumGateAlert(access, router, contentWord = 'content') {
  const copy = getPremiumGateCopy(access, contentWord);
  Alert.alert(copy.title, copy.message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: copy.actionLabel,
      onPress: () => router.push(SUBSCRIBE_ROUTE),
    },
  ]);
}
