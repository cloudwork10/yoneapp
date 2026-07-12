/**
 * Content access helpers
 * accessType: 'free' | 'premium'
 * Missing/legacy values are treated as free so existing content stays open
 * until an admin explicitly marks it premium.
 */
export function requiresSubscription(item) {
  if (!item) return false;
  if (item.accessType === 'premium' || item.isPremium === true || item.isFree === false) {
    return true;
  }
  if (item.price === 'Premium') {
    return true;
  }
  if (item.accessType === 'free' || item.isFree === true || item.isPremium === false) {
    return false;
  }
  if (item.price === 'Free') {
    return false;
  }
  return false;
}

export function isContentLocked(item, hasActiveSubscription) {
  return requiresSubscription(item) && !hasActiveSubscription;
}

export function getAccessLabel(item) {
  return requiresSubscription(item) ? 'Premium' : 'Free';
}
