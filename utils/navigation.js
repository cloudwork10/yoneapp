import { router } from 'expo-router';
import { getLastMainTab } from './lastMainTab';

/**
 * Go back when there is history, otherwise land on `fallbackHref`.
 *
 * Hidden tab screens (Advices, Terms, …) must not call `router.back()` —
 * that pops the tab navigator and lands on Home. They return to the last
 * visible tab instead (More, Home, Courses, …).
 */
export function goBackOr(fallbackHref, options = {}) {
  if (options.returnToLastTab) {
    router.navigate(getLastMainTab() || fallbackHref || '/(tabs)/more');
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}
