const DEFAULTS = {
  web: { github: true, live: true, video: false, extra: false },
  mobile: { github: true, live: false, video: true, extra: false },
  design: { github: false, live: false, video: false, extra: true },
  marketing: { github: false, live: true, video: true, extra: false },
  data: { github: true, live: false, video: true, extra: true },
  business: { github: false, live: true, video: true, extra: false },
};

function pickBool(value, fallback) {
  return value === true || value === false ? value : fallback;
}

function inferProjectKind(category = '', title = '', projectKind = 'auto') {
  if (projectKind && projectKind !== 'auto') return projectKind;
  const hay = `${category} ${title}`.toLowerCase();
  if (/mobile|android|ios|flutter|react native/.test(hay)) return 'mobile';
  if (/design|ui\/ux|figma/.test(hay)) return 'design';
  if (/market/.test(hay)) return 'marketing';
  if (/data|analy/.test(hay)) return 'data';
  if (/business/.test(hay)) return 'business';
  return 'web';
}

function resolveProjectRules(course = {}) {
  const kind = inferProjectKind(course.category, course.title, course.projectKind);
  const defaults = DEFAULTS[kind] || DEFAULTS.web;
  return {
    kind,
    githubRequired: pickBool(course.projectGithubRequired, defaults.github),
    liveRequired: pickBool(course.projectLiveRequired, defaults.live),
    videoRequired: pickBool(course.projectVideoRequired, defaults.video),
    extraRequired: pickBool(course.projectExtraRequired, defaults.extra),
  };
}

module.exports = { inferProjectKind, resolveProjectRules };
