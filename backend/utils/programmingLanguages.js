const Setting = require('../models/Setting');

const PROGRAMMING_LANGUAGES_KEY = 'programmingLanguages';
const DEFAULT_PROGRAMMING_LANGUAGES = [
  { id: 'JavaScript', name: 'JavaScript' },
  { id: 'Python', name: 'Python' },
  { id: 'Java', name: 'Java' },
  { id: 'C++', name: 'C++' },
  { id: 'C#', name: 'C#' },
  { id: 'PHP', name: 'PHP' },
  { id: 'Ruby', name: 'Ruby' },
  { id: 'Go', name: 'Go' },
];

function normalizeProgrammingLanguageName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

function normalizeProgrammingLanguageList(list) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const name = normalizeProgrammingLanguageName(item?.name || item?.id || item);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: name, name });
  }
  return out;
}

async function getStoredProgrammingLanguages() {
  const setting = await Setting.findOne({ key: PROGRAMMING_LANGUAGES_KEY });
  if (setting && Array.isArray(setting.value)) {
    return normalizeProgrammingLanguageList(setting.value);
  }
  return [];
}

async function saveProgrammingLanguages(list) {
  const languages = normalizeProgrammingLanguageList(list);
  await Setting.findOneAndUpdate(
    { key: PROGRAMMING_LANGUAGES_KEY },
    { value: languages },
    { upsert: true, new: true }
  );
  return languages;
}

module.exports = {
  PROGRAMMING_LANGUAGES_KEY,
  DEFAULT_PROGRAMMING_LANGUAGES,
  normalizeProgrammingLanguageName,
  normalizeProgrammingLanguageList,
  getStoredProgrammingLanguages,
  saveProgrammingLanguages,
};
