import AsyncStorage from '@react-native-async-storage/async-storage';

const activityKey = (userId) => `yone_activity_days_v1:${userId || 'guest'}`;
const progressPrefix = (userId) => `yone_course_progress_v1:${userId || 'guest'}:`;

export function todayStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDurationToMinutes(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 20 ? value : value * 60;
  }

  const text = String(value).trim().toLowerCase();
  if (!text) return 0;

  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*m/);
  if (hourMatch || minuteMatch) {
    return (hourMatch ? parseFloat(hourMatch[1]) * 60 : 0) + (minuteMatch ? parseFloat(minuteMatch[1]) : 0);
  }

  if (/^\d+:\d+/.test(text)) {
    const [hours, minutes] = text.split(':');
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  }

  const numeric = parseFloat(text.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric)) return 0;
  if (/hour/.test(text)) return numeric * 60;
  if (/min/.test(text)) return numeric;
  return numeric > 20 ? numeric : numeric * 60;
}

export function formatHours(minutes) {
  const hours = Math.max(0, minutes) / 60;
  if (hours <= 0) return '0h';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 10) {
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}h`;
  }
  return `${Math.round(hours)}h`;
}

export function computeStreak(days) {
  const unique = [...new Set((days || []).filter(Boolean))].sort();
  if (!unique.length) return 0;

  const cursor = new Date();
  const today = todayStamp(cursor);
  const yesterdayDate = new Date(cursor);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = todayStamp(yesterdayDate);

  let pointer = unique.includes(today) ? today : unique.includes(yesterday) ? yesterday : null;
  if (!pointer) return 0;

  const set = new Set(unique);
  let streak = 0;
  while (set.has(pointer)) {
    streak += 1;
    const [year, month, day] = pointer.split('-').map(Number);
    const previous = new Date(year, month - 1, day);
    previous.setDate(previous.getDate() - 1);
    pointer = todayStamp(previous);
  }
  return streak;
}

export async function recordActivityDay(userId) {
  if (!userId) return;
  const key = activityKey(userId);
  const today = todayStamp();
  try {
    const raw = await AsyncStorage.getItem(key);
    const days = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(days) ? days.filter(Boolean) : [];
    if (!next.includes(today)) next.push(today);
    await AsyncStorage.setItem(key, JSON.stringify(next.slice(-400)));
  } catch {
    // ignore
  }
}

export async function loadActivityDays(userId) {
  try {
    const raw = await AsyncStorage.getItem(activityKey(userId));
    const days = raw ? JSON.parse(raw) : [];
    return Array.isArray(days) ? days : [];
  } catch {
    return [];
  }
}

export async function loadLocalCourseProgress(userId) {
  const prefix = progressPrefix(userId);
  const byCourse = {};
  try {
    const keys = await AsyncStorage.getAllKeys();
    const progressKeys = keys.filter((key) => key.startsWith(prefix));
    if (!progressKeys.length) return byCourse;
    const pairs = await AsyncStorage.multiGet(progressKeys);
    pairs.forEach(([key, value]) => {
      const courseId = key.slice(prefix.length);
      if (!courseId) return;
      try {
        const parsed = JSON.parse(value || '[]');
        byCourse[courseId] = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        byCourse[courseId] = [];
      }
    });
  } catch {
    // ignore
  }
  return byCourse;
}

function courseIdOf(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return String(item._id || item.id || item.course || '');
}

function lessonList(course) {
  if (!course?.sections?.length) {
    return course?.previewVideo ? [{ id: '1', duration: '15:30' }] : [];
  }
  return course.sections.flatMap((section, sectionIndex) =>
    (section.lessons || []).map((lesson, lessonIndex) => ({
      id: `${sectionIndex}-${lessonIndex}`,
      duration: lesson.duration || '10:00',
    }))
  );
}

export async function computeLearningStats({ userId, profileUser, courses = [] }) {
  await recordActivityDay(userId);
  const [activityDays, localProgress] = await Promise.all([
    loadActivityDays(userId),
    loadLocalCourseProgress(userId),
  ]);

  const courseMap = new Map();
  (courses || []).forEach((course) => {
    const id = courseIdOf(course);
    if (id) courseMap.set(id, course);
  });

  const completedIds = new Set();
  (profileUser?.coursesCompleted || []).forEach((item) => {
    const id = courseIdOf(item);
    if (id) completedIds.add(id);
  });
  (profileUser?.certificates || []).forEach((item) => {
    const id = courseIdOf(item.course || item);
    if (id) completedIds.add(id);
  });

  let watchedMinutes = 0;

  Object.entries(localProgress).forEach(([courseId, watchedIds]) => {
    const watched = new Set(watchedIds);
    const course = courseMap.get(courseId);
    const lessons = lessonList(course);
    if (lessons.length && watched.size >= lessons.length) {
      completedIds.add(courseId);
    }

    if (lessons.length) {
      lessons.forEach((lesson) => {
        if (watched.has(String(lesson.id))) {
          watchedMinutes += parseDurationToMinutes(lesson.duration) || 15;
        }
      });
    } else {
      watchedMinutes += watched.size * 15;
    }
  });

  completedIds.forEach((courseId) => {
    const course = courseMap.get(courseId) || (profileUser?.coursesCompleted || []).find(
      (item) => courseIdOf(item) === courseId
    );
    const courseMinutes = parseDurationToMinutes(course?.duration);
    if (courseMinutes && !localProgress[courseId]) {
      watchedMinutes += courseMinutes;
    }
  });

  const backendHours = Number(profileUser?.learningStats?.totalHours) || 0;
  const totalMinutes = Math.max(watchedMinutes, Math.round(backendHours * 60));
  const backendStreak = Number(profileUser?.learningStats?.currentStreak) || 0;

  return {
    coursesCompleted: completedIds.size,
    totalHoursLabel: formatHours(totalMinutes),
    currentStreak: Math.max(computeStreak(activityDays), backendStreak),
  };
}
