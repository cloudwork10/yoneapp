const Parser = require('rss-parser');
const fetch = require('node-fetch');
const TechNews = require('../models/TechNews');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; ELNADY-TechNews/1.0; +https://elnady.app)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['media:group', 'mediaGroup'],
    ],
  },
});

const FEEDS = [
  // ── World: career tech only (programming · design · marketing · freelance · data · AI · automation) ──
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'ai',
    region: 'world',
    source: 'TechCrunch · AI',
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'ai',
    region: 'world',
    source: 'The Verge · AI',
  },
  {
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'uiux',
    region: 'world',
    source: 'Smashing Magazine',
  },
  {
    url: 'https://css-tricks.com/feed/',
    category: 'frontend',
    region: 'world',
    source: 'CSS-Tricks',
  },
  {
    url: 'https://github.blog/feed/',
    category: 'releases',
    region: 'world',
    source: 'GitHub Blog',
  },
  {
    url: 'https://news.google.com/rss/search?q=(OpenAI+OR+ChatGPT+OR+Claude+OR+%22artificial+intelligence%22+OR+LLM)+(developer+OR+coding+OR+programming+OR+API)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'ai',
    region: 'world',
    source: 'Google News · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=(React+OR+%22Next.js%22+OR+TypeScript+OR+Vue+OR+Angular)+(%22web+development%22+OR+frontend+OR+CSS)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'frontend',
    region: 'world',
    source: 'Google News · Frontend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%22Node.js%22+OR+Django+OR+FastAPI+OR+%22Express.js%22+OR+NestJS)+(backend+OR+API+OR+programming)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'backend',
    region: 'world',
    source: 'Google News · Backend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%22React+Native%22+OR+Flutter+OR+SwiftUI+OR+Kotlin)+(%22mobile+app%22+OR+developer+OR+programming)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'mobile',
    region: 'world',
    source: 'Google News · Mobile',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Figma+OR+%22UI%2FUX%22+OR+%22product+design%22+OR+%22UX+design%22+OR+Framer)+(design+OR+designer)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'uiux',
    region: 'world',
    source: 'Google News · UI/UX',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%22data+analysis%22+OR+%22data+science%22+OR+%22Power+BI%22+OR+Tableau+OR+pandas+OR+SQL)+(analyst+OR+analytics+OR+dashboard)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'data',
    region: 'world',
    source: 'Google News · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Zapier+OR+n8n+OR+Make.com+OR+%22AI+agent%22+OR+%22workflow+automation%22+OR+%22AI+automation%22)+(developer+OR+automation+OR+no-code)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'automation',
    region: 'world',
    source: 'Google News · AI Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%22digital+marketing%22+OR+SEO+OR+%22Google+Ads%22+OR+%22Meta+Ads%22+OR+%22content+marketing%22+OR+%22email+marketing%22)+(marketing+OR+marketer)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'marketing',
    region: 'world',
    source: 'Google News · Digital Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=(freelance+OR+freelancing+OR+Upwork+OR+Fiverr)+(developer+OR+designer+OR+%22web+design%22+OR+programmer+OR+%22graphic+design%22)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'freelancing',
    region: 'world',
    source: 'Google News · Freelance',
  },
  {
    url: 'https://news.google.com/rss/search?q=(JavaScript+OR+TypeScript+OR+Python+OR+React+OR+%22Node.js%22)+(release+OR+version+OR+update)+(developer+OR+framework)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'releases',
    region: 'world',
    source: 'Google News · Dev Releases',
  },
  {
    url: 'https://krebsonsecurity.com/feed/',
    category: 'cybersecurity',
    region: 'world',
    source: 'Krebs on Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%22cyber+security%22+OR+cybersecurity+OR+%22penetration+testing%22+OR+pentest+OR+%22ethical+hacking%22+OR+bug+bounty+OR+OWASP+OR+CVE)+(security+OR+hacker+OR+vulnerability)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'cybersecurity',
    region: 'world',
    source: 'Google News · Cybersecurity',
  },

  // ── Egypt ──
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A+OR+ChatGPT+OR+OpenAI+OR+%D8%A8%D8%B1%D9%85%D8%AC%D8%A9)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'ai',
    region: 'egypt',
    source: 'Egypt · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=Egypt+(AI+OR+ChatGPT+OR+OpenAI)+(developer+OR+programming+OR+coding+OR+startup)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'ai',
    region: 'egypt',
    source: 'Egypt · AI EN',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%A8%D8%B1%D9%85%D8%AC%D8%A9+OR+%D9%85%D8%B7%D9%88%D8%B1+%D9%88%D9%8A%D8%A8+OR+React+OR+Frontend+OR+Python)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'frontend',
    region: 'egypt',
    source: 'Egypt · Programming',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%AA%D8%B5%D9%85%D9%8A%D9%85+OR+UI+OR+UX+OR+Figma+OR+%D8%AC%D8%B1%D8%A7%D9%81%D9%8A%D9%83)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'uiux',
    region: 'egypt',
    source: 'Egypt · Design',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%AA%D8%AD%D9%84%D9%8A%D9%84+%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA+OR+%D8%B9%D9%84%D9%85+%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA+OR+%22Power+BI%22+OR+SQL)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'data',
    region: 'egypt',
    source: 'Egypt · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%AA%D8%B3%D9%88%D9%8A%D9%82+%D8%B1%D9%82%D9%85%D9%8A+OR+SEO+OR+%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D8%A7%D8%AA+Google+OR+Meta+Ads)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'marketing',
    region: 'egypt',
    source: 'Egypt · Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%B9%D9%85%D9%84+%D8%AD%D8%B1+OR+freelance+OR+Upwork+OR+Fiverr)+(%D8%A8%D8%B1%D9%85%D8%AC%D8%A9+OR+%D8%AA%D8%B5%D9%85%D9%8A%D9%85+OR+%D8%AA%D8%B3%D9%88%D9%8A%D9%82)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'freelancing',
    region: 'egypt',
    source: 'Egypt · Freelance',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%A3%D8%AA%D9%85%D8%AA%D8%A9+OR+Zapier+OR+n8n+OR+%22AI+automation%22)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'automation',
    region: 'egypt',
    source: 'Egypt · Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=%D9%85%D8%B5%D8%B1+(%D8%A3%D9%85%D9%86+%D8%B3%D9%8A%D8%A8%D8%B1%D8%A7%D9%86%D9%8A+OR+cybersecurity+OR+pentest+OR+%D8%A7%D8%AE%D8%AA%D8%B1%D8%A7%D9%82+OR+OWASP)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'cybersecurity',
    region: 'egypt',
    source: 'Egypt · Cybersecurity',
  },

  // ── Arab / MENA ──
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE+OR+Egypt)+(AI+OR+ChatGPT+OR+OpenAI)+(developer+OR+programming+OR+coding)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'ai',
    region: 'arab',
    source: 'MENA · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(React+OR+%22web+development%22+OR+Python+OR+Flutter)+(developer+OR+programming)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'frontend',
    region: 'arab',
    source: 'MENA · Programming',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(Figma+OR+%22UI%2FUX%22+OR+%22product+design%22)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'uiux',
    region: 'arab',
    source: 'MENA · Design',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(%22data+science%22+OR+analytics+OR+%22Power+BI%22)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'data',
    region: 'arab',
    source: 'MENA · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(%22digital+marketing%22+OR+SEO+OR+%22Google+Ads%22)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'marketing',
    region: 'arab',
    source: 'MENA · Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(freelance+OR+Upwork+OR+Fiverr)+(developer+OR+designer)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'freelancing',
    region: 'arab',
    source: 'MENA · Freelance',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(Zapier+OR+n8n+OR+%22AI+automation%22+OR+%22AI+agent%22)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'automation',
    region: 'arab',
    source: 'MENA · Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+Saudi+OR+UAE)+(%22cyber+security%22+OR+cybersecurity+OR+pentest+OR+%22ethical+hacking%22+OR+OWASP)+when:14d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'cybersecurity',
    region: 'arab',
    source: 'MENA · Cybersecurity',
  },
];

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstUrl(...candidates) {
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string' && /^https?:\/\//i.test(c)) return c;
    if (Array.isArray(c)) {
      for (const item of c) {
        const u = item?.$?.url || item?.url || item;
        if (typeof u === 'string' && /^https?:\/\//i.test(u)) return u;
      }
    }
    if (typeof c === 'object') {
      const u = c?.$?.url || c?.url;
      if (typeof u === 'string' && /^https?:\/\//i.test(u)) return u;
    }
  }
  return '';
}

function pickImage(item) {
  const fromMedia =
    firstUrl(
      item.enclosure?.url,
      item.mediaThumbnail,
      item.mediaContent,
      item.mediaGroup?.['media:content'],
      item.mediaGroup?.['media:thumbnail'],
      item['media:content'],
      item['media:thumbnail']
    ) || '';

  if (fromMedia) return fromMedia;

  const html = String(item.content || item['content:encoded'] || item.summary || '');
  const match =
    html.match(/<img[^>]+src=["']([^"']+)["']/i) ||
    html.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/i);
  return match?.[1] || match?.[0] || '';
}

function absolutize(url, base) {
  if (!url) return '';
  try {
    if (/^https?:\/\//i.test(url)) return url.split(' ')[0].trim();
    if (url.startsWith('//')) return `https:${url}`;
    if (base) return new URL(url, base).href;
  } catch {
    return '';
  }
  return '';
}

function isBadImageUrl(url = '') {
  const u = String(url).toLowerCase();
  if (!u || u.startsWith('data:')) return true;
  if (/1x1|pixel|spacer|blank\.|sprite|favicon|logo\.svg|icon-|\.svg($|\?)/i.test(u)) return true;
  if (/doubleclick|googlesyndication|adservice|analytics/i.test(u)) return true;
  return false;
}

function extractImageFromHtml(html, baseUrl = '') {
  if (!html) return '';
  const patterns = [
    /property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
    /"image"\s*:\s*"([^"]+)"/i,
    /"image"\s*:\s*\{\s*"@type"\s*:\s*"ImageObject"\s*,\s*"url"\s*:\s*"([^"]+)"/i,
    /"thumbnailUrl"\s*:\s*"([^"]+)"/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    /<amp-img[^>]+src=["']([^"']+)["']/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    const abs = absolutize(m?.[1], baseUrl);
    if (abs && !isBadImageUrl(abs)) return abs;
  }

  // Prefer large-looking <img> from article body
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].slice(0, 25);
  for (const tagMatch of imgTags) {
    const tag = tagMatch[0];
    const src =
      tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bdata-lazy-src=["']([^"']+)["']/i)?.[1];
    const abs = absolutize(src, baseUrl);
    if (!abs || isBadImageUrl(abs)) continue;
    const w = Number(tag.match(/\bwidth=["']?(\d+)/i)?.[1] || 0);
    const h = Number(tag.match(/\bheight=["']?(\d+)/i)?.[1] || 0);
    if ((w && w < 80) || (h && h < 80)) continue;
    if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(abs) || /\/images?\//i.test(abs) || /cdn|media|wp-content|static/i.test(abs)) {
      return abs;
    }
  }

  return '';
}

function extractPublisherUrlFromGoogleHtml(html) {
  if (!html) return '';
  const patterns = [
    /<a[^>]+href=["'](https?:\/\/(?!news\.google\.com|www\.google\.com|accounts\.google)[^"']+)["'][^>]*>(?:[^<]*)</i,
    /data-(?:n-au|url)=["'](https?:\/\/(?!news\.google\.com)[^"']+)["']/i,
    /"canonicalUrl"\s*:\s*"(https?:\\\/\\\/[^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (!m?.[1]) continue;
    let u = m[1].replace(/\\\//g, '/');
    if (/^https?:\/\//i.test(u) && !/google\./i.test(u)) return u;
  }
  return '';
}

async function fetchPage(pageUrl) {
  const res = await fetch(pageUrl, {
    method: 'GET',
    redirect: 'follow',
    timeout: 12000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) return null;
  // Keep full HTML — Google News puts og:image near the end (~500kb+)
  const html = await res.text();
  return { html, finalUrl: res.url || pageUrl };
}

async function fetchOgImage(pageUrl) {
  if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) return '';
  try {
    let page = await fetchPage(pageUrl);
    if (!page) return '';

    let image = extractImageFromHtml(page.html, page.finalUrl);
    if (image) return image;

    // Google News often needs a hop to the publisher article
    if (/news\.google\.com/i.test(pageUrl) || /news\.google\.com/i.test(page.finalUrl)) {
      const publisher = extractPublisherUrlFromGoogleHtml(page.html);
      if (publisher && publisher !== page.finalUrl) {
        page = await fetchPage(publisher);
        if (page) {
          image = extractImageFromHtml(page.html, page.finalUrl);
          if (image) return image;
        }
      }

      // Fallback: Google-hosted article art / logo from og:image near end of page
      const lateOg = page.html.match(
        /property=["']og:image["']\s+content=["'](https?:\/\/[^"']+)["']/i
      );
      if (lateOg?.[1] && !isBadImageUrl(lateOg[1])) return lateOg[1];
    }
  } catch {
    // ignore timeouts / blocks
  }
  return '';
}

function categorize(title, fallback) {
  const t = String(title || '').toLowerCase();
  const raw = String(title || '');
  if (
    /cyber|security|breach|ransomware|malware|phishing|hacker|vulnerability|cve|owasp|pentest|pen.?test|penetration test|ethical hack|bug bounty|أمن سيبراني|اختراق|اختبار اختراق/.test(t) ||
    /أمن سيبراني|اختراق|اختبار اختراق/.test(raw)
  ) {
    return 'cybersecurity';
  }
  if (/ui\/?ux|figma|user experience|product design|ux design|interface design|wireframe|framer|graphic design|تصميم|جرافيك/.test(t) || /تصميم|جرافيك/.test(raw)) {
    return 'uiux';
  }
  if (/data science|data anal|pandas|power bi|tableau|\bsql\b|analytics|dashboard|تحليل بيانات|علم البيانات/.test(t) || /تحليل بيانات|علم البيانات/.test(raw)) {
    return 'data';
  }
  if (/zapier|\bn8n\b|make\.com|ai agent|workflow automation|ai automation|no-?code automation|أتمتة/.test(t) || /أتمتة/.test(raw)) {
    return 'automation';
  }
  if (/digital marketing|\bseo\b|google ads|meta ads|social media marketing|content marketing|email marketing|تسويق رقمي|إعلانات/.test(t) || /تسويق|إعلانات/.test(raw)) {
    return 'marketing';
  }
  if (/freelance|freelancing|upwork|fiverr|عمل حر/.test(t) || /عمل حر/.test(raw)) {
    return 'freelancing';
  }
  if (/openai|chatgpt|gpt|claude|gemini|llm|artificial intelligence|\bai\b|ذكاء اصطناعي/.test(t) || /ذكاء اصطناعي/.test(raw)) {
    return 'ai';
  }
  if (/react native|flutter|swiftui|kotlin|ios app|android app|mobile app|تطبيقات/.test(t)) return 'mobile';
  if (/react|next\.?js|vue|angular|typescript|css|frontend|tailwind|مطور ويب/.test(t)) return 'frontend';
  if (/node\.?js|django|fastapi|nestjs|express|backend|api|database/.test(t)) return 'backend';
  if (/release|version|changelog|launches|framework update|إصدار|تحديث/.test(t)) return 'releases';
  return fallback || 'general';
}

/** Keep only ELNADY career-tech topics — drop politics, gadgets, sports, celebrity noise */
function isElnadyRelevant(title, summary = '') {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();
  const raw = `${title || ''} ${summary || ''}`;

  const deny =
    /politic|election|war|military|football|soccer|nba|celebrity|hollywood|bitcoin crash|crypto scam|iphone rumor|galaxy s2\d review|hollywood|netflix series|trump|biden|كورة|انتخابات|حرب|مشاهير|فنان|مباراة/;
  if (deny.test(text) || /كورة|انتخابات|حرب|مشاهير/.test(raw)) return false;

  const allow =
    /programm|developer|coding|software|javascript|typescript|python|react|node\.?js|flutter|figma|ui\/?ux|design|seo|marketing|freelance|upwork|fiverr|data anal|data science|power bi|tableau|\bsql\b|openai|chatgpt|claude|llm|artificial intelligence|\bai\b|automation|zapier|\bn8n\b|api|frontend|backend|mobile app|web development|digital marketing|meta ads|google ads|machine learning|dashboard|no-?code|low-?code|github|framework|cyber|security|breach|ransomware|malware|phishing|hacker|vulnerability|cve|owasp|pentest|pen.?test|penetration test|ethical hack|bug bounty|مكتبة|برمجة|مطور|تصميم|تسويق|عمل حر|ذكاء اصطناعي|تحليل بيانات|أتمتة|فريلانس|أمن سيبراني|اختراق/;
  return allow.test(text) || /برمجة|مطور|تصميم|تسويق|عمل حر|ذكاء اصطناعي|تحليل بيانات|أتمتة|أمن سيبراني|اختراق/.test(raw);
}

async function resolveImage(item, url) {
  let image = pickImage(item);
  if (image && !isBadImageUrl(image)) return image;
  image = await fetchOgImage(url);
  return image || '';
}

/** Backfill article images for news rows missing a thumbnail */
async function enrichMissingImages(limit = 40) {
  const missing = await TechNews.find({
    $or: [{ image: '' }, { image: { $exists: false } }, { image: null }],
    isActive: true,
    isHidden: false,
  })
    .sort({ publishedAt: -1 })
    .limit(limit);

  let filled = 0;
  for (const doc of missing) {
    try {
      const image = await fetchOgImage(doc.url);
      if (!image) continue;
      doc.image = image;
      await doc.save();
      filled += 1;
    } catch (e) {
      console.warn('Image enrich skip:', e.message);
    }
  }
  return { checked: missing.length, filled };
}

async function fetchFeed(feed) {
  const result = await parser.parseURL(feed.url);
  const items = result.items || [];
  let upserted = 0;

  for (const item of items.slice(0, 12)) {
    const title = stripHtml(item.title || '').slice(0, 300);
    const url = item.link || item.guid;
    if (!title || !url) continue;

    const summary = stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 600);
    if (!isElnadyRelevant(title, summary)) continue;

    const externalId = String(item.guid || url).slice(0, 500);
    const publishedAt = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
        ? new Date(item.pubDate)
        : new Date();

    try {
      const existing = await TechNews.findOne({
        $or: [{ externalId }, { url }],
      });

      if (existing) {
        if (existing.isAuto) {
          existing.title = title;
          existing.summary = summary || existing.summary;
          existing.region = feed.region || existing.region || 'world';
          existing.category = categorize(title, feed.category);
          if (existing.category === 'arab') {
            existing.region = feed.region || 'arab';
            existing.category = categorize(title, feed.category === 'arab' ? 'general' : feed.category);
          }
          existing.isHidden = false;
          existing.isActive = true;
          if (!existing.image) {
            existing.image = await resolveImage(item, url);
          } else {
            const fromFeed = pickImage(item);
            if (fromFeed && !isBadImageUrl(fromFeed)) existing.image = fromFeed;
          }
          existing.publishedAt = Number.isNaN(publishedAt.getTime())
            ? existing.publishedAt
            : publishedAt;
          await existing.save();
        }
        continue;
      }

      const image = await resolveImage(item, url);
      let category = categorize(title, feed.category);
      if (category === 'arab') category = feed.category === 'arab' ? 'general' : feed.category;

      await TechNews.create({
        title,
        summary,
        url,
        image,
        source: feed.source || result.title || 'Tech',
        category,
        region: feed.region || 'world',
        publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        externalId,
        isAuto: true,
        isPinned: false,
        isHidden: false,
        isActive: true,
      });
      upserted += 1;
    } catch (err) {
      if (err?.code !== 11000) {
        console.warn('Tech news item skip:', err.message);
      }
    }
  }

  return upserted;
}

/** Hide older auto items that no longer match ELNADY career-tech topics */
async function hideOffTopicAutoNews() {
  const autos = await TechNews.find({
    isAuto: true,
    isPinned: false,
    isHidden: { $ne: true },
  })
    .select('_id title summary')
    .limit(800)
    .lean();

  let hidden = 0;
  for (const row of autos) {
    if (isElnadyRelevant(row.title, row.summary)) continue;
    await TechNews.updateOne({ _id: row._id }, { $set: { isHidden: true, isActive: false } });
    hidden += 1;
  }
  return hidden;
}

async function refreshTechNews() {
  let total = 0;
  const errors = [];
  for (const feed of FEEDS) {
    try {
      total += await fetchFeed(feed);
    } catch (err) {
      console.warn(`Tech news feed failed (${feed.source}):`, err.message);
      errors.push({ source: feed.source, message: err.message });
    }
  }

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await TechNews.deleteMany({
    isAuto: true,
    isPinned: false,
    publishedAt: { $lt: cutoff },
  });

  let hiddenOffTopic = 0;
  try {
    hiddenOffTopic = await hideOffTopicAutoNews();
    if (hiddenOffTopic) {
      console.log(`🧹 Hidden off-topic auto news: ${hiddenOffTopic}`);
    }
  } catch (e) {
    console.warn('Tech news off-topic cleanup failed:', e.message);
  }

  let images = { checked: 0, filled: 0 };
  try {
    images = await enrichMissingImages(50);
    console.log(`🖼️ Tech news images filled: ${images.filled}/${images.checked}`);
  } catch (e) {
    console.warn('Tech news image enrich failed:', e.message);
  }

  return { imported: total, errors, images, hiddenOffTopic };
}

module.exports = { refreshTechNews, FEEDS, fetchOgImage, enrichMissingImages };
