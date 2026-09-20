const fetch = require('node-fetch');
const Job = require('../models/Job');

const USER_AGENT = 'ELNADY-Jobs/1.0 (https://elnady.app; job board aggregator)';
const TOPIC_RE =
  /developer|engineer|software|programmer|frontend|front-end|backend|back-end|fullstack|full-stack|devops|sre|mobile|android|ios|react|node|python|java|php|laravel|flutter|\bintern(?:ship)?s?\b|cloud|security|typescript|javascript|data analyst|data analysis|data scientist|data engineer|analytics|machine learning|designer|design|ui\/ux|graphic|figma|product designer|product manager|marketing|social media|seo|content|copywriter|media buyer|qa|quality assurance|\banalyst\b|تحليل بيانات|تصميم|تسويق|برمجة/i;

const EGYPT_RE =
  /egypt|\begy\b|cairo|giza|alexandria|mansoura|tanta|aswan|luxor|maadi|heliopolis|nasr city|new cairo|sheikh zayed|6th of october|october city|10th of ramadan|port said|ismailia|suez|hurghada|مصر|القاهرة|الجيزة|الاسكندرية|الإسكندرية/;
const ARAB_RE =
  /saudi|riyadh|jeddah|dammam|khobar|neom|ksa|uae|dubai|abu dhabi|sharjah|qatar|doha|kuwait|bahrain|oman|muscat|jordan|amman|lebanon|beirut|iraq|palestine|morocco|casablanca|rabat|marrakech|agadir|tunisia|tunis|algeria|algiers|oran|libya|sudan|yemen|emirates|arabia|mena|middle east|gcc|gulf|السعودية|الرياض|جدة|الامارات|الإمارات|دبي|قطر|الكويت|البحرين|عمان|الاردن|الأردن|لبنان|المغرب|تونس|الجزائر/;
const EGYPT_COMPANY_RE =
  /bosta|instabug|swvl|vezeeta|breadfast|maxab|trella|paymob|fawry|nawy|sumerge|elmenus|homzmart|moneyfellows|telda|valeo|vodafone egypt|dell egypt|ibm egypt|jumia egypt|raya|itworx|link development|efg hermes|cib|nbe/i;
const ARAB_COMPANY_RE =
  /careem|tamara|tabby|talabat|noon|salla|foodics|stc|jahez|syarah|unifonic|mrsool|yassir|soum|incorta/i;

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(value, max) {
  const text = stripHtml(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function inferType(title, tags = []) {
  const hay = `${title} ${tags.join(' ')}`.toLowerCase();
  if (/\bintern(?:ship)?s?\b/.test(hay)) return 'internship';
  if (/freelance|contract/.test(hay)) return 'freelance';
  if (/part[- ]time/.test(hay)) return 'part-time';
  return 'full-time';
}

function isTechJob(title, tags = []) {
  return TOPIC_RE.test(`${title} ${tags.join(' ')}`);
}

function detectRegion(location = '', title = '', company = '') {
  const hay = `${location} ${title} ${company}`.toLowerCase();
  if (EGYPT_COMPANY_RE.test(company) || EGYPT_RE.test(hay)) return 'egypt';
  if (ARAB_COMPANY_RE.test(company) || ARAB_RE.test(hay)) return 'arab';
  return 'world';
}

function regionRank(job) {
  const region = detectRegion(job.location, job.title, job.companyName);
  if (region === 'egypt') return 0;
  if (region === 'arab') return 1;
  if (job.type === 'internship' || /junior|entry|intern|graduate/i.test(job.title || '')) return 2;
  return 3;
}

function keepJob(job) {
  const region = detectRegion(job.location, job.title, job.companyName);
  if (region === 'egypt' || region === 'arab') return true;
  if (job.type === 'internship') return true;
  return /junior|entry|intern|graduate|associate/i.test(job.title || '');
}

function withRegionLocation(job) {
  const region = detectRegion(job.location, job.title, job.companyName);
  if (region === 'egypt' && !EGYPT_RE.test(String(job.location || ''))) {
    return { ...job, location: job.location && job.location !== 'Remote' ? `${job.location} · Egypt` : 'Cairo, Egypt' };
  }
  if (region === 'arab' && !ARAB_RE.test(String(job.location || '')) && !EGYPT_RE.test(String(job.location || ''))) {
    return { ...job, location: job.location && job.location !== 'Remote' ? `${job.location} · MENA` : 'Remote · MENA' };
  }
  return job;
}

function friendlyLocation(location) {
  return clip(location || 'Remote', 80) || 'Remote';
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
    timeout: 20000,
  });
  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }
  return response.json();
}

async function fetchRemotive() {
  const queries = [
    'https://remotive.com/api/remote-jobs?search=egypt',
    'https://remotive.com/api/remote-jobs?search=cairo',
    'https://remotive.com/api/remote-jobs?search=dubai',
    'https://remotive.com/api/remote-jobs?search=saudi',
    'https://remotive.com/api/remote-jobs?search=uae',
    'https://remotive.com/api/remote-jobs?search=qatar',
    'https://remotive.com/api/remote-jobs?search=jordan',
    'https://remotive.com/api/remote-jobs?search=internship',
    'https://remotive.com/api/remote-jobs?search=intern',
    'https://remotive.com/api/remote-jobs?category=software-dev',
    'https://remotive.com/api/remote-jobs?category=data',
    'https://remotive.com/api/remote-jobs?category=design',
    'https://remotive.com/api/remote-jobs?category=marketing',
  ];
  const jobs = [];
  for (const url of queries) {
    try {
      const data = await fetchJson(url);
      const rows = Array.isArray(data?.jobs) ? data.jobs : [];
      rows.forEach((row) => {
        const title = String(row.title || '').trim();
        const applyUrl = String(row.url || '').trim();
        const location = row.candidate_required_location || 'Remote';
        if (!title || !applyUrl || !isTechJob(title, row.tags || [])) return;
        jobs.push({
          sourceName: 'Remotive',
          sourceKey: `remotive:${applyUrl}`,
          title: clip(title, 120),
          companyName: clip(row.company_name || 'Company', 100) || 'Company',
          location: friendlyLocation(location),
          type: inferType(title, row.tags || []),
          workMode: 'remote',
          description: clip(row.description || title, 8000) || title,
          applyUrl,
        });
      });
    } catch (error) {
      console.warn('Remotive query skipped:', error.message);
    }
  }
  return jobs;
}

async function fetchJobicy() {
  const jobs = [];
  for (const url of [
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=design',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=marketing',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=data',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=intern',
    'https://jobicy.com/api/v2/remote-jobs?count=50&geo=egypt&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=united-arab-emirates&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=saudi-arabia&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=qatar&tag=developer',
  ]) {
    const data = await fetchJson(url);
    const rows = Array.isArray(data?.jobs) ? data.jobs : [];
    rows.forEach((row) => {
      const title = String(row.jobTitle || row.title || '').trim();
      const applyUrl = String(row.url || '').trim();
      const location = row.jobGeo || 'Remote';
      if (!title || !applyUrl || !isTechJob(title)) return;
      jobs.push({
        sourceName: 'Jobicy',
        sourceKey: `jobicy:${applyUrl}`,
        title: clip(title, 120),
        companyName: clip(row.companyName || 'Company', 100) || 'Company',
        location: friendlyLocation(location),
        type: inferType(title),
        workMode: 'remote',
        description: clip(row.jobDescription || row.jobExcerpt || title, 8000) || title,
        applyUrl,
      });
    });
  }
  return jobs;
}

const SKIP_ROLE_RE =
  /\b(electrical|civil|mechanical|site engineer|health and safety|interior designer|cost control)\b/i;

function isMenaTechRole(title, location, company = '') {
  return (
    isTechJob(title) &&
    !SKIP_ROLE_RE.test(title) &&
    detectRegion(location, title, company) !== 'world'
  );
}

async function fetchLeverEgypt() {
  const boards = [
    { slug: 'Bosta', company: 'Bosta' },
    { slug: 'Yassir', company: 'Yassir' },
    { slug: 'soum', company: 'SOUM' },
    { slug: 'incorta', company: 'Incorta' },
    { slug: 'syarah', company: 'Syarah' },
    { slug: 'jahez', company: 'Jahez' },
    { slug: 'unifonic', company: 'Unifonic' },
    { slug: 'mrsool', company: 'Mrsool' },
  ];
  const jobs = [];
  for (const board of boards) {
    try {
      const rows = await fetchJson(`https://api.lever.co/v0/postings/${board.slug}?mode=json`);
      (Array.isArray(rows) ? rows : []).forEach((row) => {
        const title = String(row.text || row.title || '').trim();
        const applyUrl = String(row.hostedUrl || row.applyUrl || '').trim();
        const location = (row.categories && row.categories.location) || '';
        if (!title || !applyUrl || !isMenaTechRole(title, location, board.company)) return;
        jobs.push({
          sourceName: board.company,
          sourceKey: `lever:${applyUrl}`,
          title: clip(title, 120),
          companyName: board.company,
          location: friendlyLocation(location || 'Remote'),
          type: inferType(title),
          workMode: /remote/i.test(location) ? 'remote' : 'hybrid',
          description: clip(row.descriptionPlain || row.description || title, 8000) || title,
          applyUrl,
        });
      });
    } catch (error) {
      console.warn(`Lever ${board.company} skipped:`, error.message);
    }
  }
  return jobs;
}

async function fetchGreenhouseMena() {
  const boards = [
    { slug: 'careem', company: 'Careem' },
    { slug: 'tamara', company: 'Tamara' },
    { slug: 'tabby', company: 'Tabby' },
    { slug: 'talabat', company: 'Talabat' },
    { slug: 'noon', company: 'Noon' },
    { slug: 'foodics', company: 'Foodics' },
    { slug: 'salla', company: 'Salla' },
    { slug: 'instabug', company: 'Instabug' },
    { slug: 'swvl', company: 'Swvl' },
    { slug: 'vezeeta', company: 'Vezeeta' },
    { slug: 'paymob', company: 'Paymob' },
  ];
  const jobs = [];
  for (const board of boards) {
    try {
      const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`);
      (Array.isArray(data?.jobs) ? data.jobs : []).forEach((row) => {
        const title = String(row.title || '').trim();
        const applyUrl = String(row.absolute_url || '').trim();
        const location = (row.location && row.location.name) || '';
        if (!title || !applyUrl || !isMenaTechRole(title, location, board.company)) return;
        jobs.push({
          sourceName: board.company,
          sourceKey: `greenhouse:${applyUrl}`,
          title: clip(title, 120),
          companyName: board.company,
          location: friendlyLocation(location || 'Remote'),
          type: inferType(title),
          workMode: /remote/i.test(location) ? 'remote' : 'hybrid',
          description: clip(title, 8000),
          applyUrl,
        });
      });
    } catch (error) {
      console.warn(`Greenhouse ${board.company} skipped:`, error.message);
    }
  }
  return jobs;
}

async function fetchWorkableEgypt() {
  const boards = [
    { slug: 'sumerge-1', company: 'Sumerge' },
    { slug: 'nawy-real-estate', company: 'Nawy' },
    { slug: 'breadfast', company: 'Breadfast' },
    { slug: 'maxab', company: 'MaxAB' },
    { slug: 'trella', company: 'Trella' },
    { slug: 'homzmart', company: 'Homzmart' },
    { slug: 'telda', company: 'Telda' },
  ];
  const jobs = [];
  for (const board of boards) {
    try {
      const data = await fetchJson(`https://apply.workable.com/api/v1/widget/accounts/${board.slug}`);
      (Array.isArray(data?.jobs) ? data.jobs : []).forEach((row) => {
        const title = String(row.title || '').trim();
        const applyUrl = String(row.url || row.shortlink || '').trim();
        const location =
          [row.city, row.country].filter(Boolean).join(', ') ||
          (row.locations || [])
            .map((item) => [item.city, item.country].filter(Boolean).join(', '))
            .filter(Boolean)
            .join(' · ');
        if (!title || !applyUrl || !isMenaTechRole(title, location, board.company)) return;
        jobs.push({
          sourceName: board.company,
          sourceKey: `workable:${applyUrl}`,
          title: clip(title, 120),
          companyName: board.company,
          location: friendlyLocation(location || 'Cairo, Egypt'),
          type: inferType(`${title} ${row.employment_type || ''}`),
          workMode: row.telecommuting ? 'remote' : 'hybrid',
          description: clip(title, 8000),
          applyUrl,
        });
      });
    } catch (error) {
      console.warn(`Workable ${board.company} skipped:`, error.message);
    }
  }
  return jobs;
}

async function fetchAdzuna() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const country = process.env.ADZUNA_COUNTRY || 'eg';
  const url =
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1` +
    `?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}` +
    `&results_per_page=30&what=software%20developer&content-type=application/json`;
  const data = await fetchJson(url);
  const rows = Array.isArray(data?.results) ? data.results : [];
  return rows.map((row) => {
    const title = String(row.title || '').trim();
    const applyUrl = String(row.redirect_url || '').trim();
    if (!title || !applyUrl) return null;
    return {
      sourceName: 'Adzuna',
      sourceKey: `adzuna:${row.id || applyUrl}`,
      title: clip(title, 120),
      companyName: clip(row.company?.display_name || 'Company', 100) || 'Company',
      location: clip(row.location?.display_name || 'Remote', 80) || 'Remote',
      type: inferType(title),
      workMode: /remote/i.test(`${row.location?.display_name || ''} ${title}`) ? 'remote' : 'hybrid',
      description: clip(row.description || title, 8000) || title,
      applyUrl,
    };
  }).filter(Boolean);
}

async function upsertFeedJob(item) {
  const existing = await Job.findOne({ sourceKey: item.sourceKey });
  const payload = {
    title: item.title,
    companyName: item.companyName,
    location: item.location,
    type: item.type,
    workMode: item.workMode,
    description: item.description,
    applyType: 'external',
    applyUrl: item.applyUrl,
    source: 'feed',
    sourceName: item.sourceName,
    sourceKey: item.sourceKey,
    approvalStatus: 'approved',
    lastSeenAt: new Date(),
    accessType: 'free',
    isFeatured: detectRegion(item.location, item.title, item.companyName) === 'egypt',
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return 'updated';
  }

  await Job.create({
    ...payload,
    isActive: true,
  });
  return 'created';
}

async function refreshJobFeed() {
  const imported = { lever: 0, greenhouse: 0, workable: 0, arbeitnow: 0, remotive: 0, jobicy: 0, adzuna: 0, updated: 0, created: 0, hiddenExpired: 0 };
  const collected = [];

  try {
    const lever = await fetchLeverEgypt();
    imported.lever = lever.length;
    collected.push(...lever);
  } catch (error) {
    console.warn('Job feed Lever Egypt failed:', error.message);
  }

  try {
    const greenhouse = await fetchGreenhouseMena();
    imported.greenhouse = greenhouse.length;
    collected.push(...greenhouse);
  } catch (error) {
    console.warn('Job feed Greenhouse MENA failed:', error.message);
  }

  try {
    const workable = await fetchWorkableEgypt();
    imported.workable = workable.length;
    collected.push(...workable);
  } catch (error) {
    console.warn('Job feed Workable Egypt failed:', error.message);
  }

  try {
    let arbeitnowCount = 0;
    for (const page of [1, 2, 3]) {
      const data = await fetchJson(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
      const rows = Array.isArray(data?.data) ? data.data : [];
      rows.forEach((row) => {
        const title = String(row.title || '').trim();
        const url = String(row.url || '').trim();
        if (!title || !url || !isTechJob(title, row.tags || [])) return;
        collected.push({
          sourceName: 'Arbeitnow',
          sourceKey: `arbeitnow:${url}`,
          title: clip(title, 120),
          companyName: clip(row.company_name || 'Company', 100) || 'Company',
          location: friendlyLocation(row.location || 'Remote'),
          type: inferType(title, row.tags || []),
          workMode: row.remote ? 'remote' : 'hybrid',
          description: clip(row.description || title, 8000) || title,
          applyUrl: url,
        });
        arbeitnowCount += 1;
      });
    }
    imported.arbeitnow = arbeitnowCount;
  } catch (error) {
    console.warn('Job feed Arbeitnow failed:', error.message);
  }

  try {
    const remotive = await fetchRemotive();
    imported.remotive = remotive.length;
    collected.push(...remotive);
  } catch (error) {
    console.warn('Job feed Remotive failed:', error.message);
  }

  try {
    const jobicy = await fetchJobicy();
    imported.jobicy = jobicy.length;
    collected.push(...jobicy);
  } catch (error) {
    console.warn('Job feed Jobicy failed:', error.message);
  }

  try {
    const adzuna = await fetchAdzuna();
    imported.adzuna = adzuna.length;
    collected.push(...adzuna);
  } catch (error) {
    console.warn('Job feed Adzuna failed:', error.message);
  }

  try {
    for (const url of [
      'https://himalayas.app/jobs/api/search?country=egypt',
      'https://himalayas.app/jobs/api/search?country=united-arab-emirates',
      'https://himalayas.app/jobs/api/search?country=saudi-arabia',
      'https://himalayas.app/jobs/api/search?q=intern',
      'https://himalayas.app/jobs/api?limit=40',
    ]) {
      const data = await fetchJson(url);
      const rows = Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : [];
      rows.forEach((row) => {
        const title = String(row.title || '').trim();
        const applyUrl = String(row.applicationLink || row.url || '').trim();
        if (!title || !applyUrl || !isTechJob(title)) return;
        collected.push({
          sourceName: 'Himalayas',
          sourceKey: `himalayas:${applyUrl}`,
          title: clip(title, 120),
          companyName: clip(row.companyName || 'Company', 100) || 'Company',
          location: friendlyLocation(
            Array.isArray(row.locationRestrictions) && row.locationRestrictions.length
              ? row.locationRestrictions.join(', ')
              : row.location || row.country || 'Remote'
          ),
          type: inferType(title),
          workMode: 'remote',
          description: clip(row.excerpt || title, 8000) || title,
          applyUrl,
        });
      });
    }
  } catch (error) {
    console.warn('Job feed Himalayas failed:', error.message);
  }

  try {
    const data = await fetchJson('https://remoteok.com/api');
    const rows = Array.isArray(data) ? data : [];
    rows.forEach((row) => {
      const title = String(row.position || row.title || '').trim();
      const applyUrl = String(row.apply_url || row.url || '').trim();
      if (!title || !applyUrl || !isTechJob(title, row.tags || [])) return;
      collected.push({
        sourceName: 'RemoteOK',
        sourceKey: `remoteok:${applyUrl}`,
        title: clip(title, 120),
        companyName: clip(row.company || 'Company', 100) || 'Company',
        location: friendlyLocation(row.location || 'Remote'),
        type: inferType(title, row.tags || []),
        workMode: 'remote',
        description: clip(row.description || title, 8000) || title,
        applyUrl,
      });
    });
  } catch (error) {
    console.warn('Job feed RemoteOK failed:', error.message);
  }

  const unique = [];
  const seen = new Set();
  collected.forEach((job) => {
    const next = withRegionLocation(job);
    if (!next.sourceKey || seen.has(next.sourceKey) || !keepJob(next)) return;
    seen.add(next.sourceKey);
    unique.push(next);
  });
  unique.sort((a, b) => regionRank(a) - regionRank(b));

  for (const job of unique.slice(0, 450)) {
    const result = await upsertFeedJob(job);
    if (result === 'created') imported.created += 1;
    else imported.updated += 1;
  }

  if (unique.length >= 8) {
    const stale = await Job.updateMany(
      {
        source: 'feed',
        lastSeenAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        isActive: true,
      },
      { $set: { isActive: false } }
    );
    imported.hiddenExpired = stale.modifiedCount || 0;
  }

  const activeFeed = await Job.find({ source: 'feed', isActive: true })
    .select('title location companyName type')
    .lean();
  const dropIds = activeFeed
    .filter((row) => !keepJob(row))
    .map((row) => row._id);
  if (dropIds.length) {
    await Job.updateMany({ _id: { $in: dropIds } }, { $set: { isActive: false, isFeatured: false } });
    imported.hiddenExpired += dropIds.length;
  }

  return imported;
}

let jobFeedRunning = false;

function kickJobFeed() {
  if (jobFeedRunning) return false;
  jobFeedRunning = true;
  refreshJobFeed()
    .then((r) =>
      console.log(
        `💼 Job feed: created=${r.created} updated=${r.updated} lever=${r.lever} greenhouse=${r.greenhouse} workable=${r.workable}`
      )
    )
    .catch((e) => console.warn('Job feed refresh failed:', e.message))
    .finally(() => {
      jobFeedRunning = false;
    });
  return true;
}

module.exports = { refreshJobFeed, kickJobFeed };
