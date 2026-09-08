export const DEFAULT_COURSE_CATEGORIES = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Data Analysis',
  'Automation',
];

export const courseCategoryLabel = (value) => {
  if (value === 'Data Science') return 'AI / ML / Data Science';
  return value;
};

export const normalizeCourseCategory = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);

export const mergeCourseCategories = (...lists) => {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list || []) {
      const value = normalizeCourseCategory(item);
      const key = value.toLowerCase();
      if (!value || seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }
  return out;
};

export const matchesCourseCategory = (courseCategory, selected) => {
  if (!selected || selected === 'All') return true;
  if (selected === 'Data Science') {
    return ['Data Science', 'AI/ML', 'AI', 'ML'].includes(courseCategory);
  }
  return courseCategory === selected;
};
