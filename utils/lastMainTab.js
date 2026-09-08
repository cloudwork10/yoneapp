const MAIN_TABS = {
  index: '/(tabs)',
  scholarship: '/(tabs)/scholarship',
  reels: '/(tabs)/reels',
  courses: '/(tabs)/courses',
  podcasts: '/(tabs)/podcasts',
  more: '/(tabs)/more',
};

const HIDDEN_TABS = new Set([
  'roadmaps',
  'articles',
  'advices',
  'programming-terms',
  'top-cv',
]);

let lastMainTab = '/(tabs)/more';

export const rememberMainTab = (segment) => {
  if (segment && MAIN_TABS[segment] && !HIDDEN_TABS.has(segment)) {
    lastMainTab = MAIN_TABS[segment];
  }
};

export const getLastMainTab = () => lastMainTab;

export const isHiddenTab = (segment) => HIDDEN_TABS.has(segment);
