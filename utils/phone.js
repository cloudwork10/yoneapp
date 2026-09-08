export const COUNTRY_DIALS = [
  { iso: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', flag: '🇦🇪' },
  { iso: 'QA', name: 'Qatar', dial: '974', flag: '🇶🇦' },
  { iso: 'KW', name: 'Kuwait', dial: '965', flag: '🇰🇼' },
  { iso: 'BH', name: 'Bahrain', dial: '973', flag: '🇧🇭' },
  { iso: 'OM', name: 'Oman', dial: '968', flag: '🇴🇲' },
  { iso: 'JO', name: 'Jordan', dial: '962', flag: '🇯🇴' },
  { iso: 'LB', name: 'Lebanon', dial: '961', flag: '🇱🇧' },
  { iso: 'PS', name: 'Palestine', dial: '970', flag: '🇵🇸' },
  { iso: 'IQ', name: 'Iraq', dial: '964', flag: '🇮🇶' },
  { iso: 'SY', name: 'Syria', dial: '963', flag: '🇸🇾' },
  { iso: 'YE', name: 'Yemen', dial: '967', flag: '🇾🇪' },
  { iso: 'SD', name: 'Sudan', dial: '249', flag: '🇸🇩' },
  { iso: 'LY', name: 'Libya', dial: '218', flag: '🇱🇾' },
  { iso: 'TN', name: 'Tunisia', dial: '216', flag: '🇹🇳' },
  { iso: 'DZ', name: 'Algeria', dial: '213', flag: '🇩🇿' },
  { iso: 'MA', name: 'Morocco', dial: '212', flag: '🇲🇦' },
  { iso: 'MR', name: 'Mauritania', dial: '222', flag: '🇲🇷' },
  { iso: 'TR', name: 'Turkey', dial: '90', flag: '🇹🇷' },
  { iso: 'US', name: 'United States', dial: '1', flag: '🇺🇸' },
  { iso: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧' },
  { iso: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', dial: '33', flag: '🇫🇷' },
  { iso: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹' },
  { iso: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸' },
  { iso: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱' },
  { iso: 'BE', name: 'Belgium', dial: '32', flag: '🇧🇪' },
  { iso: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪' },
  { iso: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴' },
  { iso: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭' },
  { iso: 'AT', name: 'Austria', dial: '43', flag: '🇦🇹' },
  { iso: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱' },
  { iso: 'RU', name: 'Russia', dial: '7', flag: '🇷🇺' },
  { iso: 'UA', name: 'Ukraine', dial: '380', flag: '🇺🇦' },
  { iso: 'IN', name: 'India', dial: '91', flag: '🇮🇳' },
  { iso: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰' },
  { iso: 'BD', name: 'Bangladesh', dial: '880', flag: '🇧🇩' },
  { iso: 'CN', name: 'China', dial: '86', flag: '🇨🇳' },
  { iso: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵' },
  { iso: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷' },
  { iso: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩' },
  { iso: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾' },
  { iso: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭' },
  { iso: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬' },
  { iso: 'TH', name: 'Thailand', dial: '66', flag: '🇹🇭' },
  { iso: 'VN', name: 'Vietnam', dial: '84', flag: '🇻🇳' },
  { iso: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺' },
  { iso: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿' },
  { iso: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦' },
  { iso: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷' },
  { iso: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽' },
  { iso: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷' },
  { iso: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦' },
  { iso: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬' },
  { iso: 'KE', name: 'Kenya', dial: '254', flag: '🇰🇪' },
  { iso: 'GH', name: 'Ghana', dial: '233', flag: '🇬🇭' },
];

const DIALS_BY_LENGTH = [...COUNTRY_DIALS].sort((a, b) => b.dial.length - a.dial.length);

export function getCountryByDial(dial) {
  const value = String(dial || '').replace(/[^\d]/g, '');
  return COUNTRY_DIALS.find((country) => country.dial === value) || COUNTRY_DIALS[0];
}

export function splitStoredPhone(raw) {
  const digits = String(raw || '').replace(/[^\d]/g, '');
  const match = DIALS_BY_LENGTH.find((country) => digits.startsWith(country.dial));
  if (match && digits.length > match.dial.length) {
    return { country: match, local: digits.slice(match.dial.length) };
  }
  return { country: COUNTRY_DIALS[0], local: digits };
}

const LOCAL_LENGTH = {
  20: 10,
  966: 9,
  971: 9,
  974: 8,
  965: 8,
  973: 8,
  968: 8,
  962: 9,
  961: 8,
  970: 9,
  964: 10,
  1: 10,
  44: 10,
};

function isNationalLengthValid(dial, national) {
  if (!national) return false;
  const need = LOCAL_LENGTH[dial];
  if (need) return national.length === need;
  return national.length >= 8 && national.length <= 12;
}

export function normalizePhone(raw, dialCode = '') {
  let digits = String(raw || '').replace(/[^\d]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);

  const dial = String(dialCode || '').replace(/[^\d]/g, '');
  if (dial) {
    const national = digits.startsWith(dial) ? digits.slice(dial.length) : digits.replace(/^0+/, '');
    if (dial === '20' && !/^1\d{9}$/.test(national)) return '';
    if (!isNationalLengthValid(dial, national)) return '';
    return `${dial}${national}`;
  }

  if (digits.startsWith('20') && digits.length === 12 && /^201\d{9}$/.test(digits)) return digits;
  if (digits.startsWith('0') && digits.length === 11 && /^01\d{9}$/.test(digits)) return `20${digits.slice(1)}`;
  return '';
}

export function isValidPhone(raw, dialCode = '') {
  return Boolean(normalizePhone(raw, dialCode));
}

export function formatPhoneDisplay(normalized) {
  const digits = normalizePhone(normalized) || String(normalized || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  const { country, local } = splitStoredPhone(digits);
  return `+${country.dial} ${local}`;
}

export const normalizeEgyptPhone = (raw) => normalizePhone(raw, '20');
export const isValidEgyptPhone = (raw) => isValidPhone(raw, '20') || isValidPhone(raw);
export const formatEgyptPhoneDisplay = formatPhoneDisplay;
