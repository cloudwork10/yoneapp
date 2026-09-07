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

function normalizePhone(raw, dialCode = '') {
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

  // Full international number already saved on the account
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return '';
}

function isValidPhone(raw, dialCode = '') {
  return Boolean(normalizePhone(raw, dialCode));
}

function formatPhoneDisplay(normalized) {
  const digits = normalizePhone(normalized) || String(normalized || '').replace(/[^\d]/g, '');
  return digits ? `+${digits}` : '';
}

module.exports = {
  normalizePhone,
  isValidPhone,
  formatPhoneDisplay,
  normalizeEgyptPhone: (raw) => normalizePhone(raw),
  isValidEgyptPhone: (raw) => isValidPhone(raw),
  formatEgyptPhoneDisplay: formatPhoneDisplay,
};
