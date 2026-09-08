import AsyncStorage from '@react-native-async-storage/async-storage';

export const PRAYER_CITY_STORAGE_KEY = 'prayerCity';

export const PRAYER_CITIES = [
  { name: 'Cairo', country: 'Egypt', displayName: 'القاهرة، مصر', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo', method: 5, fallback: { fajr: '05:04', dhuhr: '12:54', asr: '16:27', maghrib: '19:14', isha: '20:33' } },
  { name: 'Alexandria', country: 'Egypt', displayName: 'الإسكندرية، مصر', lat: 31.2001, lng: 29.9187, tz: 'Africa/Cairo', method: 5, fallback: { fajr: '05:08', dhuhr: '12:59', asr: '16:33', maghrib: '19:20', isha: '20:38' } },
  { name: 'Giza', country: 'Egypt', displayName: 'الجيزة، مصر', lat: 30.0131, lng: 31.2089, tz: 'Africa/Cairo', method: 5, fallback: { fajr: '05:04', dhuhr: '12:54', asr: '16:27', maghrib: '19:14', isha: '20:33' } },
  { name: 'Riyadh', country: 'Saudi Arabia', displayName: 'الرياض، السعودية', lat: 24.7136, lng: 46.6753, tz: 'Asia/Riyadh', method: 4, fallback: { fajr: '04:45', dhuhr: '12:15', asr: '15:45', maghrib: '18:30', isha: '20:00' } },
  { name: 'Dubai', country: 'UAE', displayName: 'دبي، الإمارات', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai', method: 8, fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
  { name: 'Kuwait City', country: 'Kuwait', displayName: 'الكويت، الكويت', lat: 29.3759, lng: 47.9774, tz: 'Asia/Kuwait', method: 9, fallback: { fajr: '04:50', dhuhr: '12:20', asr: '15:50', maghrib: '18:35', isha: '20:05' } },
  { name: 'Doha', country: 'Qatar', displayName: 'الدوحة، قطر', lat: 25.2854, lng: 51.5310, tz: 'Asia/Qatar', method: 10, fallback: { fajr: '04:55', dhuhr: '12:25', asr: '15:55', maghrib: '18:40', isha: '20:10' } },
  { name: 'Manama', country: 'Bahrain', displayName: 'المنامة، البحرين', lat: 26.2235, lng: 50.5876, tz: 'Asia/Bahrain', method: 8, fallback: { fajr: '04:50', dhuhr: '12:20', asr: '15:50', maghrib: '18:35', isha: '20:05' } },
  { name: 'Amman', country: 'Jordan', displayName: 'عمان، الأردن', lat: 31.9539, lng: 35.9106, tz: 'Asia/Amman', method: 3, fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } },
  { name: 'Beirut', country: 'Lebanon', displayName: 'بيروت، لبنان', lat: 33.8938, lng: 35.5018, tz: 'Asia/Beirut', method: 3, fallback: { fajr: '05:25', dhuhr: '12:55', asr: '16:25', maghrib: '19:10', isha: '20:40' } },
  { name: 'Damascus', country: 'Syria', displayName: 'دمشق، سوريا', lat: 33.5138, lng: 36.2765, tz: 'Asia/Damascus', method: 3, fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } },
  { name: 'Baghdad', country: 'Iraq', displayName: 'بغداد، العراق', lat: 33.3152, lng: 44.3661, tz: 'Asia/Baghdad', method: 3, fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
  { name: 'Tunis', country: 'Tunisia', displayName: 'تونس، تونس', lat: 36.8065, lng: 10.1815, tz: 'Africa/Tunis', method: 3, fallback: { fajr: '05:30', dhuhr: '13:00', asr: '16:30', maghrib: '19:15', isha: '20:45' } },
  { name: 'Algiers', country: 'Algeria', displayName: 'الجزائر، الجزائر', lat: 36.7538, lng: 3.0588, tz: 'Africa/Algiers', method: 3, fallback: { fajr: '05:35', dhuhr: '13:05', asr: '16:35', maghrib: '19:20', isha: '20:50' } },
  { name: 'Rabat', country: 'Morocco', displayName: 'الرباط، المغرب', lat: 34.0209, lng: -6.8416, tz: 'Africa/Casablanca', method: 21, fallback: { fajr: '05:40', dhuhr: '13:10', asr: '16:40', maghrib: '19:25', isha: '20:55' } },
  { name: 'Tripoli', country: 'Libya', displayName: 'طرابلس، ليبيا', lat: 32.8872, lng: 13.1913, tz: 'Africa/Tripoli', method: 3, fallback: { fajr: '05:25', dhuhr: '12:55', asr: '16:25', maghrib: '19:10', isha: '20:40' } },
  { name: 'Khartoum', country: 'Sudan', displayName: 'الخرطوم، السودان', lat: 15.5007, lng: 32.5599, tz: 'Africa/Khartoum', method: 3, fallback: { fajr: '05:10', dhuhr: '12:40', asr: '16:10', maghrib: '18:55', isha: '20:25' } },
  { name: 'Sanaa', country: 'Yemen', displayName: 'صنعاء، اليمن', lat: 15.3694, lng: 44.1910, tz: 'Asia/Aden', method: 3, fallback: { fajr: '05:00', dhuhr: '12:30', asr: '16:00', maghrib: '18:45', isha: '20:15' } },
  { name: 'Muscat', country: 'Oman', displayName: 'مسقط، عمان', lat: 23.5880, lng: 58.3829, tz: 'Asia/Muscat', method: 8, fallback: { fajr: '05:05', dhuhr: '12:35', asr: '16:05', maghrib: '18:50', isha: '20:20' } },
  { name: 'Jerusalem', country: 'Palestine', displayName: 'القدس، فلسطين', lat: 31.7683, lng: 35.2137, tz: 'Asia/Jerusalem', method: 3, fallback: { fajr: '05:20', dhuhr: '12:50', asr: '16:20', maghrib: '19:05', isha: '20:35' } },
];

export const DEFAULT_PRAYER_CITY = PRAYER_CITIES[0];

export const getZonedParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value || '0';
  return {
    year: Number(value('year')),
    month: Number(value('month')),
    day: Number(value('day')),
    hour: Number(value('hour')) % 24,
    minute: Number(value('minute')),
  };
};

export const cleanPrayerTime = (value) => {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

export const parsePrayerClock = (value) => {
  const cleaned = cleanPrayerTime(value);
  if (!cleaned) return null;
  const [hour, minute] = cleaned.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute, time: cleaned };
};

export const shiftClock = (hour, minute, deltaMinutes) => {
  let total = hour * 60 + minute + deltaMinutes;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return {
    hour: Math.floor(total / 60),
    minute: total % 60,
  };
};

export const formatClock = (date, timeZone) => {
  const { hour, minute } = getZonedParts(date, timeZone);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const resolvePrayerCity = (saved) => {
  if (!saved) return DEFAULT_PRAYER_CITY;
  return PRAYER_CITIES.find((city) => city.name === saved.name && city.country === saved.country)
    || DEFAULT_PRAYER_CITY;
};

export const loadPrayerCity = async () => {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_CITY_STORAGE_KEY);
    return resolvePrayerCity(raw ? JSON.parse(raw) : null);
  } catch {
    return DEFAULT_PRAYER_CITY;
  }
};

export const savePrayerCity = async (city) => {
  const resolved = resolvePrayerCity(city);
  await AsyncStorage.setItem(PRAYER_CITY_STORAGE_KEY, JSON.stringify({
    name: resolved.name,
    country: resolved.country,
  }));
  return resolved;
};

export const fetchPrayerTimes = async (city = DEFAULT_PRAYER_CITY) => {
  const selected = resolvePrayerCity(city);
  const now = getZonedParts(new Date(), selected.tz || 'Africa/Cairo');
  const datePath = `${String(now.day).padStart(2, '0')}-${String(now.month).padStart(2, '0')}-${now.year}`;

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${datePath}?latitude=${selected.lat}&longitude=${selected.lng}&method=${selected.method}&timezonestring=${encodeURIComponent(selected.tz)}`
    );

    if (response.ok) {
      const data = await response.json();
      const timings = data.data?.timings || {};
      return {
        fajr: cleanPrayerTime(timings.Fajr),
        dhuhr: cleanPrayerTime(timings.Dhuhr),
        asr: cleanPrayerTime(timings.Asr),
        maghrib: cleanPrayerTime(timings.Maghrib),
        isha: cleanPrayerTime(timings.Isha),
      };
    }
  } catch (error) {
    console.log('Error fetching prayer times:', error);
  }

  return selected.fallback;
};
