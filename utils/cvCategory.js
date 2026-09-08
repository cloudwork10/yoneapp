export const CV_FILTERS = [
  { value: 'All', label: 'All' },
  { value: 'Frontend Developer', label: 'Frontend' },
  { value: 'Backend Developer', label: 'Backend' },
  { value: 'Full Stack Developer', label: 'Full Stack' },
  { value: 'Mobile Developer', label: 'Mobile' },
  { value: 'DevOps Engineer', label: 'DevOps' },
  { value: 'Data Scientist', label: 'Data' },
  { value: 'Cyber Security', label: 'Cyber Security' },
  { value: 'AI / ML', label: 'AI / ML' },
  { value: 'AI Automation', label: 'AI Automation' },
  { value: 'UI/UX Designer', label: 'Design' },
];

const RULES = [
  {
    value: 'Full Stack Developer',
    keys: ['full stack', 'fullstack', 'full-stack', 'mern', 'mean', 'فل ستاك', 'فول ستاك'],
  },
  {
    value: 'Frontend Developer',
    keys: ['frontend', 'front end', 'front-end', 'react', 'vue', 'angular', 'html', 'css', 'فرونت', 'واجهات'],
  },
  {
    value: 'Backend Developer',
    keys: ['backend', 'back end', 'back-end', 'django', 'laravel', 'spring', 'node', 'باك اند', 'باك-اند'],
  },
  {
    value: 'Mobile Developer',
    keys: ['mobile', 'android', 'ios', 'flutter', 'react native', 'موبايل', 'تطبيقات'],
  },
  {
    value: 'DevOps Engineer',
    keys: ['devops', 'kubernetes', 'docker', 'aws', 'terraform', 'jenkins', 'ديفوبس', 'ديف أوبس'],
  },
  {
    value: 'Cyber Security',
    keys: ['cyber', 'security', 'pentest', 'soc', 'ethical hack', 'سيبراني', 'أمن معلومات'],
  },
  {
    value: 'AI Automation',
    keys: ['ai automation', 'automation', 'n8n', 'zapier', 'make.com', 'أتمتة', 'اتوميشن'],
  },
  {
    value: 'AI / ML',
    keys: ['ai/ml', 'ai-ml', 'machine learning', 'deep learning', 'llm', 'ذكاء اصطناعي'],
  },
  {
    value: 'Data Scientist',
    keys: ['data scien', 'data analyst', 'data analysis', 'تحليل بيانات', 'علم البيانات'],
  },
  {
    value: 'UI/UX Designer',
    keys: ['ui/ux', 'ui ux', 'designer', 'figma', 'ux', 'ui', 'مصمم', 'تصميم'],
  },
];

export const normalizeCvCategory = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);

export const cvCategoryLabel = (value) => {
  const found = CV_FILTERS.find((item) => item.value === value);
  return found?.label || value;
};

export const mergeCvCategories = (...lists) => {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list || []) {
      const value = normalizeCvCategory(item);
      const key = value.toLowerCase();
      if (!value || key === 'all' || key === 'general' || seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }
  return out;
};

export const buildCvFilters = (cvList = []) => {
  const extras = mergeCvCategories((cvList || []).map((cv) => inferCvCategory(cv)));
  const defaults = CV_FILTERS.filter((item) => item.value !== 'All').map((item) => item.value);
  return [
    { value: 'All', label: 'All' },
    ...mergeCvCategories(defaults, extras).map((value) => ({
      value,
      label: cvCategoryLabel(value),
    })),
  ];
};

export const inferCvCategory = (cv) => {
  const stored = normalizeCvCategory(cv?.category);
  if (stored && stored !== 'General') {
    return stored;
  }

  const text = [cv?.title, cv?.description, cv?.name, ...(cv?.skills || [])]
    .join(' ')
    .toLowerCase();

  const match = RULES.find((rule) => rule.keys.some((key) => text.includes(key)));
  return match?.value || stored || 'General';
};

export const matchesCvFilter = (cv, selected) => {
  if (!selected || selected === 'All') return true;
  return inferCvCategory(cv) === selected;
};
