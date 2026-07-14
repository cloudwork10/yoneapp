/**
 * Arabic news idea explainers for Tech News.
 * "من عندنا" — short Arabic summary of the story, not Google Translate of the full page.
 */

const fetch = require('node-fetch');

const TOPIC_HINTS = [
  {
    test: /ui\/?ux|figma|user experience|product design|ux design/i,
    ar: 'الخبر عن تصميم تجربة المستخدم أو واجهات المنتجات (UI/UX).',
  },
  {
    test: /cyber|security|breach|ransomware|malware|phishing|vulnerability/i,
    ar: 'الخبر عن الأمن السيبراني: حماية أو اختراق أو تحديث أمني.',
  },
  {
    test: /data science|data anal|pandas|power bi|tableau|\bsql\b|analytics/i,
    ar: 'الخبر عن تحليل البيانات أو أدوات الـ Data Analysis.',
  },
  {
    test: /automation|rpa|zapier|\bn8n\b|workflow automation/i,
    ar: 'الخبر عن الأتمتة وأدوات تسهيل المهام المتكررة.',
  },
  {
    test: /digital marketing|\bseo\b|google ads|social media marketing|content marketing/i,
    ar: 'الخبر عن التسويق الرقمي (Digital Marketing).',
  },
  {
    test: /freelance|freelancing|upwork|fiverr/i,
    ar: 'الخبر عن العمل الحر والفريلانس.',
  },
  {
    test: /ios\s*27|iphone|ipados|macos\s*27|apple/i,
    ar: 'الخبر عن تحديثات أبل (آيفون / ماك / آيباد) أو نسخة تجريبية جديدة.',
  },
  {
    test: /openai|chatgpt|gpt-?5|gpt-?4|sora/i,
    ar: 'الخبر مرتبط بـ OpenAI وأدوات الذكاء الاصطناعي بتاعتها.',
  },
  {
    test: /claude|anthropic/i,
    ar: 'الخبر عن Claude من Anthropic في مجال المساعدات الذكية.',
  },
  {
    test: /gemini|google\s*ai|deepmind/i,
    ar: 'الخبر عن ذكاء جوجل الاصطناعي (Gemini وغيره).',
  },
  {
    test: /uber|robotaxi|waymo/i,
    ar: 'الخبر عن أوبر وخدماتها أو مشاريع السيارات الذاتية.',
  },
  {
    test: /react\s*native|expo/i,
    ar: 'الخبر يخص React Native أو Expo لتطوير تطبيقات الموبايل.',
  },
  {
    test: /\breact\b|next\.?js|typescript|tailwind/i,
    ar: 'الخبر يخص أدوات Frontend زي React أو Next أو TypeScript.',
  },
  {
    test: /node\.?js|python|django|rust|golang|\bgo\b/i,
    ar: 'الخبر يخص لغة أو إطار Backend معروف.',
  },
  {
    test: /github|copilot/i,
    ar: 'الخبر مرتبط بـ GitHub أو أدوات المساعدة في كتابة الكود.',
  },
  {
    test: /security|hack|breach|vulnerability|cve/i,
    ar: 'الخبر فيه جانب أمني: ثغرة أو تحذير أو تحديث حماية.',
  },
  {
    test: /funding|raises|valuation|\$\d/i,
    ar: 'الخبر عن تمويل أو تقييم شركة في مجال التكنولوجيا.',
  },
  {
    test: /release|version|beta|launch|announce/i,
    ar: 'الخبر عن إصدار أو إطلاق أو إعلان جديد.',
  },
];

function cleanEn(text = '') {
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isStaleExplain(text = '') {
  return /بكل بساطة|مبتدئين|مفيش لازمة|المهم تفهم الاتجاه|خلّيني أشرحها|من غير وجع دماغ|وجع دماغ|لو ما عندكش/i.test(
    String(text)
  );
}

async function softTranslateToAr(text) {
  const q = cleanEn(text).slice(0, 280);
  if (!q || q.length < 8) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|ar`;
    const res = await fetch(url, { timeout: 8000 });
    if (!res.ok) return '';
    const data = await res.json();
    const translated = data?.responseData?.translatedText || '';
    if (!translated || /MYMEMORY WARNING|QUERY LENGTH|INVALID/i.test(translated)) return '';
    if (/^[A-Za-z0-9\s.,;:'"()\-]+$/.test(translated) && /[A-Za-z]{4,}/.test(translated)) {
      return '';
    }
    return translated.trim();
  } catch {
    return '';
  }
}

function topicLine(title, summary) {
  const blob = `${title} ${summary}`;
  for (const tip of TOPIC_HINTS) {
    if (tip.test.test(blob)) return tip.ar;
  }
  return '';
}

function buildFunArabicExplain(item, softAr = '') {
  const title = cleanEn(item.title);
  const summary = cleanEn(item.summary);
  const topic = topicLine(title, summary);
  const lines = [];

  if (softAr) {
    lines.push(softAr);
  } else if (summary) {
    lines.push(summary.slice(0, 320));
  } else if (title) {
    lines.push(title);
  }

  if (topic) {
    lines.push('', topic);
  }

  return lines.join('\n').trim();
}

async function getOrCreateExplain(itemDoc) {
  const cached = String(itemDoc.summaryAr || '').trim();
  if (cached.length > 40 && !isStaleExplain(cached)) {
    return cached;
  }

  const title = itemDoc.title || '';
  const summary = itemDoc.summary || '';
  const softAr = await softTranslateToAr(summary || title);
  const text = buildFunArabicExplain(
    {
      title,
      summary,
      category: itemDoc.category,
      source: itemDoc.source,
    },
    softAr
  );

  itemDoc.summaryAr = text;
  try {
    await itemDoc.save();
  } catch (e) {
    console.warn('Could not cache summaryAr:', e.message);
  }
  return text;
}

module.exports = {
  buildFunArabicExplain,
  getOrCreateExplain,
  softTranslateToAr,
};
