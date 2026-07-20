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

export function resolveCourseAccessType(course) {
  if (course?.accessType === 'premium' || course?.accessType === 'free') {
    return course.accessType;
  }

  const lessons = course?.sections?.flatMap((section) => section.lessons || []) || [];
  if (lessons.length === 0) {
    return 'free';
  }

  const premiumCount = lessons.filter((lesson) => lesson.accessType === 'premium').length;
  const freeCount = lessons.length - premiumCount;

  if (premiumCount > 0 && freeCount > 0) {
    return 'mixed';
  }
  if (premiumCount > 0) {
    return 'premium';
  }
  return 'free';
}

export function getCourseAccessLabel(course) {
  const accessType = resolveCourseAccessType(course);
  if (accessType === 'premium') return 'اشتراك';
  if (accessType === 'mixed') return 'مختلط';
  return 'مجاني';
}
