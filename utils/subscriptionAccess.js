import { Alert } from 'react-native';
import API_BASE_URL from '../config/api';
import { makeAuthenticatedRequest } from './tokenRefresh';

/**
 * This iOS build has no purchase flow at all — no manual-transfer screen, no
 * payment numbers, no prices, no purchase copy, and no runtime platform
 * check gating any of it. All of that was deleted outright rather than
 * hidden behind a Platform.OS branch, because a hidden branch's strings and
 * routes still compile into the binary — that shape is what caused an App
 * Store guideline 5.6 rejection on an earlier build. Premium content stays
 * locked with neutral copy and no CTA.
 *
 * Subscriptions bought on Android still unlock everything here — access is
 * read from the backend in fetchSubscriptionAccess() and does not depend on
 * where the subscription was purchased.
 */

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
  // No purchase copy exists in this build — see the file header above.
  // Every status maps to the same neutral message.
  return {
    title: '🔒 Premium Content',
    message:
      `This ${contentWord} is available with an active subscription.\n\n` +
      `المحتوى ده متاح مع الاشتراك النشط.`,
    actionLabel: null,
  };
}

/**
 * Show the lock alert. `router` is unused now that getPremiumGateCopy never
 * returns an action, but kept in the signature — this is called from ~5
 * screens and changing it isn't worth the diff for a no-op parameter.
 */
export function showPremiumGateAlert(access, router, contentWord = 'content') {
  const copy = getPremiumGateCopy(access, contentWord);
  Alert.alert(copy.title, copy.message, [{ text: 'OK', style: 'cancel' }]);
}
