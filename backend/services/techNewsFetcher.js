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
    source: 'TechCrunch · AI',
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'ai',
    source: 'The Verge · AI',
  },
  {
    url: 'https://techcrunch.com/feed/',
    category: 'general',
    source: 'TechCrunch',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'general',
    source: 'The Verge',
  },
  {
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'uiux',
    source: 'Smashing Magazine',
  },
  {
    url: 'https://krebsonsecurity.com/feed/',
    category: 'cybersecurity',
    source: 'Krebs on Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=OpenAI+OR+ChatGPT+OR+%22artificial+intelligence%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'ai',
    source: 'Google News · AI',
  },
  {
    url: 'https://news.google.com/rss/search?q=React+OR+%22Next.js%22+OR+TypeScript+frontend+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'frontend',
    source: 'Google News · Frontend',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Node.js%22+OR+Python+OR+Django+OR+backend+API+release+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'backend',
    source: 'Google News · Backend',
  },
  {
    url: 'https://news.google.com/rss/search?q=React+Native+OR+Flutter+OR+Swift+OR+Kotlin+mobile+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'mobile',
    source: 'Google News · Mobile',
  },
  {
    url: 'https://news.google.com/rss/search?q=software+release+OR+%22version%22+(JavaScript+OR+Python+OR+Go+OR+Rust)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'releases',
    source: 'Google News · Releases',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22UI%2FUX%22+OR+Figma+OR+%22user+experience%22+OR+%22product+design%22+OR+UX+design+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'uiux',
    source: 'Google News · UI/UX',
  },
  {
    url: 'https://news.google.com/rss/search?q=cybersecurity+OR+%22data+breach%22+OR+ransomware+OR+%22ethical+hacking%22+OR+%22info+sec%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'cybersecurity',
    source: 'Google News · Security',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22data+analysis%22+OR+%22data+science%22+OR+pandas+OR+%22Power+BI%22+OR+Tableau+OR+SQL+analytics+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'data',
    source: 'Google News · Data',
  },
  {
    url: 'https://news.google.com/rss/search?q=automation+OR+RPA+OR+%22workflow+automation%22+OR+Zapier+OR+n8n+OR+%22no+code+automation%22+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'automation',
    source: 'Google News · Automation',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22digital+marketing%22+OR+SEO+OR+%22social+media+marketing%22+OR+%22Google+Ads%22+OR+content+marketing+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'marketing',
    source: 'Google News · Marketing',
  },
  {
    url: 'https://news.google.com/rss/search?q=freelance+OR+freelancing+OR+Upwork+OR+Fiverr+OR+%22remote+work%22+(design+OR+developer+OR+writer)+when:7d&hl=en-US&gl=US&ceid=US:en',
    category: 'freelancing',
    source: 'Google News · Freelance',
  },
  {
    url: 'https://github.blog/feed/',
    category: 'general',
    source: 'GitHub Blog',
  },
  // Egypt & Arab world tech — kept in `arab` category for the Reader chip
  {
    url: 'https://news.google.com/rss/search?q=%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7+OR+%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A+OR+%D8%B4%D8%B1%D9%83%D8%A7%D8%AA+%D9%86%D8%A7%D8%B4%D8%A6%D8%A9+when:7d&hl=ar&gl=EG&ceid=EG:ar',
    category: 'arab',
    source: 'Google News · مصر تكنولوجيا',
    lockCategory: true,
  },
  {
    url: 'https://news.google.com/rss/search?q=Egypt+(tech+OR+startup+OR+%22artificial+intelligence%22+OR+fintech+OR+%22silicon+valley+of+the+middle+east%22)+when:7d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'arab',
    source: 'Google News · Egypt Tech',
    lockCategory: true,
  },
  {
    url: 'https://news.google.com/rss/search?q=%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7+OR+%D8%B1%D9%82%D9%85%D9%86%D8%A9+OR+%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A+(%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9+OR+%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA+OR+%D8%A7%D9%84%D8%A3%D8%B1%D8%AF%D9%86+OR+%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA)+when:7d&hl=ar&gl=SA&ceid=SA:ar',
    category: 'arab',
    source: 'Google News · عرب تكنولوجيا',
    lockCategory: true,
  },
  {
    url: 'https://news.google.com/rss/search?q=(MENA+OR+%22Middle+East%22+OR+GCC)+(startup+OR+tech+OR+fintech+OR+%22artificial+intelligence%22)+when:7d&hl=en-US&gl=AE&ceid=AE:en',
    category: 'arab',
    source: 'Google News · MENA Tech',
    lockCategory: true,
  },
  {
    url: 'https://news.google.com/rss/search?q=Wamda+OR+Flat6Labs+OR+%22Cairo+tech%22+OR+%22Egyptian+startup%22+OR+Careem+OR+Fawry+when:14d&hl=en-US&gl=EG&ceid=EG:en',
    category: 'arab',
    source: 'Google News · Egypt Startups',
    lockCategory: true,
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
  // Regional Arab/Egypt feeds stay under the arab chip
  if (fallback === 'arab') return 'arab';

  const t = String(title || '').toLowerCase();
  if (/cyber|security|breach|ransomware|malware|phishing|hacker|vulnerability|cve/.test(t)) {
    return 'cybersecurity';
  }
  if (/ui\/?ux|figma|user experience|product design|ux design|interface design|wireframe/.test(t)) {
    return 'uiux';
  }
  if (/data science|data anal|pandas|power bi|tableau|\bsql\b|analytics|machine learning dataset/.test(t)) {
    return 'data';
  }
  if (/automation|rpa|zapier|\bn8n\b|workflow automation|no-?code automation/.test(t)) {
    return 'automation';
  }
  if (/digital marketing|\bseo\b|google ads|social media marketing|content marketing|email marketing/.test(t)) {
    return 'marketing';
  }
  if (/freelance|freelancing|upwork|fiverr|independent contractor|gig economy/.test(t)) {
    return 'freelancing';
  }
  if (/openai|chatgpt|gpt|claude|gemini|llm|artificial intelligence|\bai\b/.test(t)) return 'ai';
  if (/react native|flutter|swift|kotlin|ios|android|mobile/.test(t)) return 'mobile';
  if (/react|next\.?js|vue|angular|typescript|css|frontend|tailwind/.test(t)) return 'frontend';
  if (/node\.?js|python|django|golang|\bgo\b|rust|java|backend|api|database/.test(t)) return 'backend';
  if (/release|version|launches|announces|update/.test(t)) return 'releases';
  // Arabic regional keywords → arab chip even from mixed feeds
  if (
    /مصر|السعودية|الإمارات|الكويت|قطر|الأردن|تونس|المغرب|البحرين|عمان|فلسطين|لبنان|العراق|سوريا|الوطن العربي|الشرق الأوسط|شركات ناشئة|ريادة أعمال|التكنولوجيا|الذكاء الاصطناعي/.test(
      String(title || '')
    ) ||
    /\b(egypt|egyptian|mena|saudi|uae|dubai|cairo|riyadh|flat6labs|wamda|fawry|careem)\b/i.test(t)
  ) {
    return 'arab';
  }
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

      await TechNews.create({
        title,
        summary,
        url,
        image,
        source: feed.source || result.title || 'Tech',
        category: feed.lockCategory
          ? feed.category
          : categorize(title, feed.category),
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
