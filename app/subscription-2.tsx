import { Redirect } from 'expo-router';

/**
 * This iOS build has no payment flow of any kind — see app/payment.tsx.
 */
export default function Subscription2Fallback() {
  return <Redirect href="/(tabs)/more" />;
}
