const DEFAULTS = {
  web: { github: true, live: true, video: false, extra: false },
  mobile: { github: true, live: false, video: true, extra: false },
  design: { github: false, live: false, video: false, extra: true },
  marketing: { github: false, live: true, video: true, extra: false },
  data: { github: true, live: false, video: true, extra: true },
  business: { github: false, live: true, video: true, extra: false },
};

const LABELS = {
  web: {
    github: 'GitHub',
    live: 'Live website',
    video: 'Walkthrough video',
    extra: 'Extra link',
    hint: 'Web project: GitHub + a live URL. Video is optional.',
  },
  mobile: {
    github: 'GitHub',
    live: 'Store / TestFlight (optional)',
    video: 'App demo video',
    extra: 'Extra link',
    hint: 'Mobile project: GitHub + a short demo video. Live store link is optional.',
  },
  design: {
    github: 'GitHub',
    live: 'Live preview',
    video: 'Walkthrough video',
    extra: 'Figma / Behance',
    hint: 'Design project: Figma or Behance is required.',
  },
  marketing: {
    github: 'GitHub',
    live: 'Campaign / portfolio',
    video: 'Results video',
    extra: 'Extra link',
    hint: 'Marketing project: live campaign or portfolio + a short results video.',
  },
  data: {
    github: 'GitHub / notebook',
    live: 'Live demo',
    video: 'Analysis walkthrough',
    extra: 'Dashboard / report',
    hint: 'Data project: notebook on GitHub + dashboard/report + a short explanation video.',
  },
  business: {
    github: 'GitHub',
    live: 'Case study / live',
    video: 'Pitch video',
    extra: 'Extra link',
    hint: 'Business project: live case study + a short pitch video.',
  },
};

function pickBool(value, fallback) {
  return value === true || value === false ? value : fallback;
}

export function inferProjectKind(category = '', title = '', projectKind = 'auto') {
  if (projectKind && projectKind !== 'auto') return projectKind;
  const hay = `${category} ${title}`.toLowerCase();
  if (/mobile|android|ios|flutter|react native/.test(hay)) return 'mobile';
  if (/design|ui\/ux|figma/.test(hay)) return 'design';
  if (/market/.test(hay)) return 'marketing';
  if (/data|analy/.test(hay)) return 'data';
  if (/business/.test(hay)) return 'business';
  return 'web';
}

export function resolveProjectRules(course = {}) {
  const kind = inferProjectKind(course.category, course.title, course.projectKind);
  const defaults = DEFAULTS[kind] || DEFAULTS.web;
  const labels = LABELS[kind] || LABELS.web;
  return {
    kind,
    githubRequired: pickBool(course.projectGithubRequired, defaults.github),
    liveRequired: pickBool(course.projectLiveRequired, defaults.live),
    videoRequired: pickBool(course.projectVideoRequired, defaults.video),
    extraRequired: pickBool(course.projectExtraRequired, defaults.extra),
    labels,
    hint: labels.hint,
  };
}

export const PROJECT_KINDS = [
  { id: 'auto', label: 'Auto from course type' },
  { id: 'web', label: 'Web / Programming' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'design', label: 'Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'data', label: 'Data analysis' },
  { id: 'business', label: 'Business' },
];
