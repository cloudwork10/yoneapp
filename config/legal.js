/** Public URLs for app store listings (GitHub Pages). */
export const PRIVACY_POLICY_URL = 'https://cloudwork10.github.io/yoneapp-legal/privacy.html';
export const TERMS_URL = 'https://cloudwork10.github.io/yoneapp-legal/terms.html';
export const REFUND_POLICY_URL = 'https://cloudwork10.github.io/yoneapp-legal/refund.html';
export const CONTACT_EMAIL = 'supportyone@gmail.com';
/** @deprecated Use CONTACT_EMAIL */
export const SUPPORT_EMAIL = CONTACT_EMAIL;

/** WhatsApp number (Egypt). Stored as local 01… ; wa.me uses +20. */
export const WHATSAPP_NUMBER =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WHATSAPP_NUMBER) ||
  '01064663594';

export const VODAFONE_CASH_NUMBER = '01064663594';
export const INSTAPAY_NUMBER = '01032311716';

export const MANUAL_PAYMENT_HINT =
  'حوّل على فودافون كاش أو InstaPay، بعدين ارفع سكرين التحويل تحت.';

export const TELEGRAM_URL = 'https://t.me/+hMz0vFEexds2ZjY0';
export const CERTIFICATE_FOUNDER_NAME = 'Abdulrahman Alaa';

/** Digits for https://wa.me/ (country code 20 + number without leading 0). */
export function whatsappWaMeNumber(raw = WHATSAPP_NUMBER) {
  const digits = String(raw).replace(/[^\d]/g, '');
  if (digits.startsWith('20')) return digits;
  if (digits.startsWith('0')) return `20${digits.slice(1)}`;
  return digits;
}
