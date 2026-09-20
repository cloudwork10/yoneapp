/**
 * Arabic news idea explainers for Tech News.
 * Longer beginner-friendly Arabic summary — not a literal full-page translation.
 */

const fetch = require('node-fetch');

const TOPIC_HINTS = [
  {
    test: /ui\/?ux|figma|user experience|product design|ux design/i,
    ar: 'الخبر عن تصميم تجربة المستخدم أو واجهات المنتجات (UI/UX).',
    who: 'مهم لمصممين UI/UX واللي بيتعلم Figma أو تصميم منتجات.',
  },
  {
    test: /cyber|security|breach|ransomware|malware|phishing|vulnerability/i,
    ar: 'الخبر عن الأمن السيبراني: حماية أو اختراق أو تحديث أمني.',
    who: 'مهم لمبتدئين الأمن السيبراني وناس الـ SOC والـ pentest.',
  },
  {
    test: /data science|data anal|pandas|power bi|tableau|\bsql\b|analytics/i,
    ar: 'الخبر عن تحليل البيانات أو أدوات الـ Data Analysis.',
    who: 'مهم لمحللين البيانات واللي بيتعلم Excel أو SQL أو Power BI.',
  },
  {
    test: /automation|rpa|zapier|\bn8n\b|workflow automation/i,
    ar: 'الخبر عن الأتمتة وأدوات تسهيل المهام المتكررة.',
    who: 'مهم للي بيتعلم AI Automation أو أدوات زي n8n و Zapier.',
  },
  {
    test: /digital marketing|\bseo\b|google ads|social media marketing|content marketing/i,
    ar: 'الخبر عن التسويق الرقمي (Digital Marketing).',
    who: 'مهم لمسوقين وميديا بايرز واللي بيتعلم إعلانات.',
  },
  {
    test: /freelance|freelancing|upwork|fiverr/i,
    ar: 'الخبر عن العمل الحر والفريلانس.',
    who: 'مهم للي بيشتغل فريلانس أو ناوي يبدأ على Upwork و Fiverr.',
  },
  {
    test: /ios\s*27|iphone|ipados|macos\s*27|apple/i,
    ar: 'الخبر عن تحديثات أبل (آيفون / ماك / آيباد) أو نسخة تجريبية جديدة.',
    who: 'مهم لمطوري الموبايل ومستخدمي أبل اللي بيتابعوا التحديثات.',
  },
  {
    test: /openai|chatgpt|gpt-?5|gpt-?4|sora/i,
    ar: 'الخبر مرتبط بـ OpenAI وأدوات الذكاء الاصطناعي بتاعتها.',
    who: 'مهم لأي حد بيستخدم ChatGPT أو بيتعلم AI في الشغل.',
  },
  {
    test: /claude|anthropic/i,
    ar: 'الخبر عن Claude من Anthropic في مجال المساعدات الذكية.',
    who: 'مهم للي بيتابع أدوات AI وبيقارن بين المساعدات الذكية.',
  },
  {
    test: /gemini|google\s*ai|deepmind/i,
    ar: 'الخبر عن ذكاء جوجل الاصطناعي (Gemini وغيره).',
    who: 'مهم للي بيستخدم Gemini أو بيتعلم أدوات Google AI.',
  },
  {
    test: /uber|robotaxi|waymo/i,
    ar: 'الخبر عن أوبر وخدماتها أو مشاريع السيارات الذاتية.',
    who: 'مهم لمتابعي أخبار التكنولوجيا والنقل الذكي.',
  },
  {
    test: /react\s*native|expo/i,
    ar: 'الخبر يخص React Native أو Expo لتطوير تطبيقات الموبايل.',
    who: 'مهم لمطوري الموبايل اللي شغالين React Native.',
  },
  {
    test: /\breact\b|next\.?js|typescript|tailwind/i,
    ar: 'الخبر يخص أدوات Frontend زي React أو Next أو TypeScript.',
    who: 'مهم لمطوري الواجهات واللي بيتعلم Frontend.',
  },
  {
    test: /node\.?js|python|django|rust|golang|\bgo\b/i,
    ar: 'الخبر يخص لغة أو إطار Backend معروف.',
    who: 'مهم لمطوري الـ Backend واللي بيتعلم APIs.',
  },
  {
    test: /github|copilot/i,
    ar: 'الخبر مرتبط بـ GitHub أو أدوات المساعدة في كتابة الكود.',
    who: 'مهم لأي مبرمج بيستخدم GitHub أو أدوات مساعدة الكود.',
  },
  {
    test: /security|hack|breach|vulnerability|cve/i,
    ar: 'الخبر فيه جانب أمني: ثغرة أو تحذير أو تحديث حماية.',
    who: 'مهم لناس الأمن السيبراني والمطورين اللي بيتابعوا الثغرات.',
  },
  {
    test: /funding|raises|valuation|\$\d/i,
    ar: 'الخبر عن تمويل أو تقييم شركة في مجال التكنولوجيا.',
    who: 'مهم لمتابعي الستارت أب وسوق التكنولوجيا.',
  },
  {
    test: /release|version|beta|launch|announce/i,
    ar: 'الخبر عن إصدار أو إطلاق أو إعلان جديد.',
    who: 'مهم للمطورين اللي بيتابعوا تحديثات الأدوات والإصدارات.',
  },
];

const CATEGORY_WHO = {
  ai: 'مهم للي بيتعلم الذكاء الاصطناعي أو بيستخدم أدوات AI.',
  frontend: 'مهم لمطوري الواجهات والويب.',
  backend: 'مهم لمطوري السيرفر والـ APIs.',
  mobile: 'مهم لمطوري تطبيقات الموبايل.',
  uiux: 'مهم لمصممين الواجهات وتجربة المستخدم.',
  data: 'مهم لمحللين البيانات.',
  automation: 'مهم للي بيشتغل أتمتة أو AI Automation.',
  marketing: 'مهم للتسويق الرقمي والميديا باينج.',
  freelancing: 'مهم للفريلانسرز.',
  cybersecurity: 'مهم لناس الأمن السيبراني.',
  releases: 'مهم للمطورين اللي بيتابعوا إصدارات جديدة.',
};

function cleanEn(text = '') {
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isStaleExplain(text = '') {
  const value = String(text || '').trim();
  if (value.length < 160) return true;
  return /بكل بساطة|مبتدئين|مفيش لازمة|المهم تفهم الاتجاه|خلّيني أشرحها|من غير وجع دماغ|وجع دماغ|لو ما عندكش/i.test(
    value
  );
}

async function softTranslateToAr(text) {
  const q = cleanEn(text).slice(0, 480);
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

function topicMatch(title, summary) {
  const blob = `${title} ${summary}`;
  for (const tip of TOPIC_HINTS) {
    if (tip.test.test(blob)) return tip;
  }
  return null;
}

function buildFunArabicExplain(item, softAr = '', titleAr = '') {
  const title = cleanEn(item.title);
  const summary = cleanEn(item.summary);
  const topic = topicMatch(title, summary);
  const lines = [];

  if (titleAr) {
    lines.push(titleAr);
  } else if (title) {
    lines.push(title);
  }

  if (softAr) {
    lines.push('', softAr);
  } else if (summary) {
    lines.push('', summary.slice(0, 520));
  }

  if (topic?.ar) {
    lines.push('', topic.ar);
  }

  const who = topic?.who || CATEGORY_WHO[item.category] || 'مهم لأي حد بيتعلم تكنولوجيا أو بيشتغل في المجال.';
  lines.push(who);

  return lines.join('\n').trim();
}

async function getOrCreateExplain(itemDoc) {
  const cached = String(itemDoc.summaryAr || '').trim();
  if (cached.length >= 160 && !isStaleExplain(cached)) {
    return cached;
  }

  const title = itemDoc.title || '';
  const summary = itemDoc.summary || '';
  const [titleAr, softAr] = await Promise.all([
    softTranslateToAr(title),
    softTranslateToAr(summary || title),
  ]);
  const text = buildFunArabicExplain(
    {
      title,
      summary,
      category: itemDoc.category,
      source: itemDoc.source,
    },
    softAr,
    titleAr
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
