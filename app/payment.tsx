import { Redirect } from 'expo-router';

/**
 * This iOS build has no payment flow of any kind — the entire screen and
 * its data (see git history for this branch) were deleted rather than
 * hidden, to remove any possibility of App Store guideline 5.6 flagging
 * dormant payment code in the binary. Android continues to ship the real
 * flow from the main branch.
 */
export default function PaymentFallback() {
  return <Redirect href="/(tabs)/more" />;
}
