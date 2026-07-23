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
    url: 'https://techcrunch.com/feed/',
    category: 'general',
    region: 'world',
    source: 'TechCrunch',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'general',
    region: 'world',
    source: 'The Verge',
  },
  {
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'uiux',
    region: 'world',
    source: 'Smashing Magazine',
  },
  {
    url: 'https://krebsonsecurity.com/feed/',
    category: 'cybersecurity',
    region: 'world',
    source: 'Krebs on Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=OpenAI+OR+ChatGPT+OR+%22artificial+intelligence%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'ai',
    region: 'world',
    source: 'Google News · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=React+OR+%22Next.js%22+OR+TypeScript+frontend+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'frontend',
    region: 'world',
    source: 'Google News · Frontend',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Node.js%22+OR+Python+OR+Django+OR+backend+API+release+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'backend',
    region: 'world',
    source: 'Google News · Backend',
  },
  {
    url: 'https://news.google.com/rss/search?q=React+Native+OR+Flutter+OR+Swift+OR+Kotlin+mobile+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'mobile',
    region: 'world',
    source: 'Google News · Mobile',
  },
  {
    url: 'https://news.google.com/rss/search?q=software+release+OR+%22version%22+(JavaScript+OR+Python+OR+Go+OR+Rust)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'releases',
    region: 'world',
    source: 'Google News · Releases',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22UI%2FUX%22+OR+Figma+OR+%22user+experience%22+OR+%22product+design%22+OR+UX+design+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'uiux',
    region: 'world',
    source: 'Google News · UI/UX',
  },
  {
    url: 'https://news.google.com/rss/search?q=cybersecurity+OR+%22data+breach%22+OR+ransomware+OR+%22ethical+hacking%22+OR+%22info+sec%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'cybersecurity',
    region: 'world',
    source: 'Google News · Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22data+analysis%22+OR+%22data+science%22+OR+pandas+OR+%22Power+BI%22+OR+Tableau+OR+SQL+analytics+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'data',
    region: 'world',
    source: 'Google News · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=automation+OR+RPA+OR+%22workflow+automation%22+OR+Zapier+OR+n8n+OR+%22no+code+automation%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'automation',
    region: 'world',
    source: 'Google News · Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22digital+marketing%22+OR+SEO+OR+%22social+media+marketing%22+OR+%22Google+Ads%22+OR+content+marketing+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'marketing',
    region: 'world',
    source: 'Google News · Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=freelance+OR+freelancing+OR+Upwork+OR+Fiverr+OR+%22remote+work%22+(design+OR+developer+OR+writer)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'freelancing',
    region: 'world',
    source: 'Google News · Freelance',
  },
  {
    url: 'https://github.blog/feed/',
    category: 'general',
    region: 'world',
    source: 'GitHub Blog',
  },

  // ── Egypt & Arab world — same domains, region=arab ──
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+OR+%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA)+(%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A+OR+ChatGPT+OR+OpenAI)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'ai',
    region: 'arab',
    source: 'عرب · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA+OR+Saudi+OR+UAE)+(AI+OR+%22artificial+intelligence%22+OR+OpenAI)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'ai',
    region: 'arab',
    source: 'MENA · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%A8%D8%B1%D9%85%D8%AC%D8%A9+OR+%D9%85%D8%B7%D9%88%D8%B1+%D9%88%D9%8A%D8%A8+OR+React+OR+Frontend)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'frontend',
    region: 'arab',
    source: 'عرب · Frontend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(React+OR+Frontend+OR+%22web+development%22)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'frontend',
    region: 'arab',
    source: 'MENA · Frontend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%AE%D9%88%D8%A7%D8%AF%D9%85+OR+backend+OR+API+OR+Python)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'backend',
    region: 'arab',
    source: 'عرب · Backend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(backend+OR+%22Node.js%22+OR+Python+OR+API)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'backend',
    region: 'arab',
    source: 'MENA · Backend',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%D8%A7%D8%AA+%D8%AC%D9%88%D8%A7%D9%84+OR+Flutter+OR+%22React+Native%22)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'mobile',
    region: 'arab',
    source: 'عرب · Mobile',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(Flutter+OR+%22React+Native%22+OR+mobile+app)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'mobile',
    region: 'arab',
    source: 'MENA · Mobile',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%AA%D8%B5%D9%85%D9%8A%D9%85+OR+UI+OR+UX+OR+Figma)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'uiux',
    region: 'arab',
    source: 'عرب · UI/UX',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+OR+%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA)+(%D8%A3%D9%85%D9%86+%D8%B3%D9%8A%D8%A8%D8%B1%D8%A7%D9%86%D9%8A+OR+%D8%A7%D8%AE%D8%AA%D8%B1%D8%A7%D9%82+%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA+OR+cybersecurity)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'cybersecurity',
    region: 'arab',
    source: 'عرب · Cybersecurity',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA+OR+Saudi)+(cybersecurity+OR+%22data+breach%22+OR+hacking)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'cybersecurity',
    region: 'arab',
    source: 'MENA · Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%AA%D8%AD%D9%84%D9%8A%D9%84+%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA+OR+%D8%B9%D9%84%D9%85+%D8%A7%D9%84%D8%A8%D9%8A%D8%A7%D9%86%D8%A7%D8%AA+OR+SQL)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'data',
    region: 'arab',
    source: 'عرب · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(%22data+science%22+OR+analytics+OR+%22Power+BI%22)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'data',
    region: 'arab',
    source: 'MENA · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%A3%D8%AA%D9%85%D8%AA%D8%A9+OR+automation+OR+RPA)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'automation',
    region: 'arab',
    source: 'عرب · Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%AA%D8%B3%D9%88%D9%8A%D9%82+%D8%B1%D9%82%D9%85%D9%8A+OR+SEO+OR+%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D8%A7%D8%AA)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'marketing',
    region: 'arab',
    source: 'عرب · Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8)+(%D8%B9%D9%85%D9%84+%D8%AD%D8%B1+OR+freelance+OR+Upwork)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'freelancing',
    region: 'arab',
    source: 'عرب · Freelance',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(freelance+OR+Upwork+OR+Fiverr+OR+%22remote+work%22)+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'freelancing',
    region: 'arab',
    source: 'MENA · Freelance',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+OR+%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA)+(%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1+OR+%D8%AA%D8%AD%D8%AF%D9%8A%D8%AB+%D8%A8%D8%B1%D9%85%D8%AC%D9%8A+OR+release)+when:14d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'releases',
    region: 'arab',
    source: 'عرب · Releases',
  },
  {
    url: 'https://news.google.com/rss/search?q=(%D9%85%D8%B5%D8%B1+OR+%D8%A7%D9%84%D9%88%D8%B7%D9%86+%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A)+(%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7+OR+%D8%B4%D8%B1%D9%83%D8%A7%D8%AA+%D9%86%D8%A7%D8%B4%D8%A6%D8%A9+OR+%D8%B1%D9%82%D9%85%D9%86%D8%A9)+when:7d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'general',
    region: 'arab',
    source: 'مصر / عرب · عام',
  },
  {
    url: 'https://news.google.com/rss/search?q=(Egypt+OR+MENA)+(startup+OR+tech+OR+fintech+OR+Wamda+OR+Flat6Labs)+when:7d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'general',
    region: 'arab',
    source: 'MENA · General',
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
  if (/cyber|security|breach|ransomware|malware|phishing|hacker|vulnerability|cve|أمن سيبراني|اختراق/.test(t) || /أمن سيبراني|اختراق بيانات/.test(String(title || ''))) {
    return 'cybersecurity';
  }
  if (/ui\/?ux|figma|user experience|product design|ux design|interface design|wireframe|تصميم/.test(t)) {
    return 'uiux';
  }
  if (/data science|data anal|pandas|power bi|tableau|\bsql\b|analytics|machine learning dataset|تحليل بيانات|علم البيانات/.test(t)) {
    return 'data';
  }
  if (/automation|rpa|zapier|\bn8n\b|workflow automation|no-?code automation|أتمتة/.test(t)) {
    return 'automation';
  }
  if (/digital marketing|\bseo\b|google ads|social media marketing|content marketing|email marketing|تسويق/.test(t)) {
    return 'marketing';
  }
  if (/freelance|freelancing|upwork|fiverr|independent contractor|gig economy|عمل حر/.test(t)) {
    return 'freelancing';
  }
  if (/openai|chatgpt|gpt|claude|gemini|llm|artificial intelligence|\bai\b|ذكاء اصطناعي/.test(t)) return 'ai';
  if (/react native|flutter|swift|kotlin|ios|android|mobile|تطبيقات جوال/.test(t)) return 'mobile';
  if (/react|next\.?js|vue|angular|typescript|css|frontend|tailwind|مطور ويب/.test(t)) return 'frontend';
  if (/node\.?js|python|django|golang|\bgo\b|rust|java|backend|api|database|خوادم/.test(t)) return 'backend';
  if (/release|version|launches|announces|update|إصدار|تحديث/.test(t)) return 'releases';
  return fallback || 'general';
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

  for (const item of items.slice(0, 10)) {
    const title = stripHtml(item.title || '').slice(0, 300);
    const url = item.link || item.guid;
    if (!title || !url) continue;

    const summary = stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 600);
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
          // Migrate legacy category=arab → region arab + domain
          if (existing.category === 'arab') {
            existing.region = 'arab';
            existing.category = categorize(title, feed.category === 'arab' ? 'general' : feed.category);
          }
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

  let images = { checked: 0, filled: 0 };
  try {
    images = await enrichMissingImages(50);
    console.log(`🖼️ Tech news images filled: ${images.filled}/${images.checked}`);
  } catch (e) {
    console.warn('Tech news image enrich failed:', e.message);
  }

  return { imported: total, errors, images };
}

module.exports = { refreshTechNews, FEEDS, fetchOgImage, enrichMissingImages };
