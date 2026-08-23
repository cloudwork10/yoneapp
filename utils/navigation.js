import { router } from 'expo-router';

/**
 * Go back when there is history, otherwise land on `fallbackHref`.
 *
 * Detail screens are pushed on top of the (tabs) group, so the tab bar is
 * hidden and their own back control is the only way out. `router.back()` alone
 * is a no-op when there is no history (deep link, push notification, or a
 * `replace` that dropped it), and `router.replace` to a tab route resets the
 * tab navigator — this does the right thing in both cases.
 */
export function goBackOr(fallbackHref) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}
