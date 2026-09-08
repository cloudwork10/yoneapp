const TOPIC_RE =
  /developer|engineer|software|programmer|frontend|front-end|backend|back-end|fullstack|full-stack|devops|mobile|android|ios|react|node|python|java|php|laravel|flutter|\bintern(?:ship)?s?\b|cloud|security|typescript|javascript|data analyst|data analysis|data scientist|data engineer|analytics|machine learning|designer|design|ui\/ux|ux\/ui|graphic|figma|product designer|product manager|marketing|social media|seo|content|copywriter|media buyer|qa|quality assurance|\banalyst\b|تحليل بيانات|تصميم|تسويق|برمجة/i;

const EGYPT_RE =
  /egypt|\begy\b|cairo|giza|alexandria|mansoura|tanta|aswan|luxor|maadi|heliopolis|nasr city|new cairo|sheikh zayed|6th of october|october city|10th of ramadan|port said|ismailia|suez|asyut|assiut|minya|fayoum|damietta|zagazig|hurghada|sharm|مصر|القاهرة|الجيزة|الاسكندرية|الإسكندرية|المنصورة|طنطا|المعادي|مدينة نصر|التجمع|الشيخ زايد|أكتوبر/;
const ARAB_RE =
  /saudi|riyadh|jeddah|dammam|khobar|neom|ksa|uae|dubai|abu dhabi|sharjah|ajman|qatar|doha|kuwait|bahrain|manama|oman|muscat|jordan|amman|lebanon|beirut|iraq|baghdad|palestine|gaza|ramallah|morocco|casablanca|rabat|marrakech|agadir|fes|tunisia|tunis|sousse|algeria|algiers|oran|tlemcen|constantine|libya|tripoli|sudan|khartoum|yemen|sanaa|emirates|arabia|mena|middle east|gcc|gulf|السعودية|الرياض|جدة|الدمام|الامارات|الإمارات|دبي|ابوظبي|أبوظبي|قطر|الدوحة|الكويت|البحرين|عمان|الاردن|الأردن|لبنان|بيروت|العراق|فلسطين|المغرب|الدار البيضاء|تونس|الجزائر|ليبيا|السودان|اليمن|وطن عربي|الوطن العربي/;
function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(value, max) {
  const text = stripHtml(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function inferType(title) {
  const hay = String(title || '').toLowerCase();
  if (/\bintern(?:ship)?s?\b/.test(hay)) return 'internship';
  if (/freelance|contract/.test(hay)) return 'freelance';
  if (/part[- ]time/.test(hay)) return 'part-time';
  return 'full-time';
}

function regionFromText(location = '', title = '') {
  const loc = String(location || '').toLowerCase();
  const hay = `${loc} ${title || ''}`.toLowerCase();
  if (EGYPT_RE.test(loc)) return 'egypt';
  if (ARAB_RE.test(hay) && !EGYPT_RE.test(hay)) return 'arab';
  if (EGYPT_RE.test(hay)) return 'egypt';
  return 'world';
}

function displayLocation(location, region) {
  const clean = clip(location || '', 80);
  if (region === 'arab' && /mena|middle east|gcc|gulf/i.test(location || '')) {
    return clean || 'Arab World · Remote';
  }
  return clean || (region === 'egypt' ? 'Egypt' : region === 'arab' ? 'Arab World' : 'Remote');
}

function toJob(item) {
  return {
    _id: item._id,
    title: item.title,
    companyName: item.companyName,
    location: item.location,
    type: item.type,
    workMode: item.workMode,
    description: item.description,
    salaryRange: '',
    applyType: 'external',
    applyUrl: item.applyUrl,
    source: 'feed',
    sourceName: item.sourceName,
    isFeatured: false,
  };
}

async function readJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Feed failed ${response.status}`);
  return response.json();
}

function pushMappedJob(jobs, item) {
  const region = regionFromText(item.location, item.title);
  jobs.push(
    toJob({
      ...item,
      location: displayLocation(item.location, region),
    })
  );
}

function sortJobs(jobs) {
  return jobs.sort((a, b) => {
    const aIntern = a.type === 'internship' ? 0 : 1;
    const bIntern = b.type === 'internship' ? 0 : 1;
    return aIntern - bIntern;
  });
}

const SKIP_ROLE_RE =
  /\b(electrical|civil|mechanical|site engineer|health and safety|interior designer|cost control)\b/i;

function isMenaTechRole(title, location) {
  const loc = String(location || '').toLowerCase();
  return (
    TOPIC_RE.test(title) &&
    !SKIP_ROLE_RE.test(title) &&
    (EGYPT_RE.test(loc) || ARAB_RE.test(loc))
  );
}

async function fetchMenaCareerBoards(jobs) {
  const leverBoards = [
    { slug: 'Bosta', company: 'Bosta' },
    { slug: 'Yassir', company: 'Yassir' },
    { slug: 'soum', company: 'SOUM' },
    { slug: 'incorta', company: 'Incorta' },
  ];
  const greenhouseBoards = [
    { slug: 'careem', company: 'Careem' },
    { slug: 'tamara', company: 'Tamara' },
  ];
  const workableBoards = [
    { slug: 'sumerge-1', company: 'Sumerge' },
    { slug: 'nawy-real-estate', company: 'Nawy' },
  ];

  await Promise.all([
    ...leverBoards.map(({ slug, company }) =>
      (async () => {
        try {
          const rows = await readJson(`https://api.lever.co/v0/postings/${slug}?mode=json`);
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const title = String(row.text || row.title || '').trim();
            const applyUrl = String(row.hostedUrl || row.applyUrl || '').trim();
            const location = (row.categories && row.categories.location) || row.location || '';
            if (!title || !applyUrl || !isMenaTechRole(title, location)) return;
            pushMappedJob(jobs, {
              _id: `feed:lever:${applyUrl}`,
              title: clip(title, 120),
              companyName: company,
              location: location || 'Remote',
              type: inferType(`${title} ${row.categories?.commitment || ''}`),
              workMode: /remote/i.test(location) ? 'remote' : 'hybrid',
              description: clip(row.descriptionPlain || row.description || title, 4000) || title,
              applyUrl,
              sourceName: company,
            });
          });
        } catch (error) {
          console.log(`${company} feed skipped:`, error.message);
        }
      })()
    ),
    ...greenhouseBoards.map(({ slug, company }) =>
      (async () => {
        try {
          const data = await readJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`);
          const rows = Array.isArray(data?.jobs) ? data.jobs : [];
          rows.forEach((row) => {
            const title = String(row.title || '').trim();
            const applyUrl = String(row.absolute_url || '').trim();
            const location = (row.location && row.location.name) || '';
            if (!title || !applyUrl || !isMenaTechRole(title, location)) return;
            pushMappedJob(jobs, {
              _id: `feed:greenhouse:${applyUrl}`,
              title: clip(title, 120),
              companyName: company,
              location: location || 'Remote',
              type: inferType(title),
              workMode: /remote/i.test(location) ? 'remote' : 'hybrid',
              description: clip(title, 4000),
              applyUrl,
              sourceName: company,
            });
          });
        } catch (error) {
          console.log(`${company} feed skipped:`, error.message);
        }
      })()
    ),
    ...workableBoards.map(({ slug, company }) =>
      (async () => {
        try {
          const data = await readJson(`https://apply.workable.com/api/v1/widget/accounts/${slug}`);
          const rows = Array.isArray(data?.jobs) ? data.jobs : [];
          rows.forEach((row) => {
            const title = String(row.title || '').trim();
            const applyUrl = String(row.url || row.shortlink || '').trim();
            const location = [row.city, row.country].filter(Boolean).join(', ') ||
              (row.locations || []).map((item) => [item.city, item.country].filter(Boolean).join(', ')).join(' · ');
            if (!title || !applyUrl || !isMenaTechRole(title, location)) return;
            pushMappedJob(jobs, {
              _id: `feed:workable:${applyUrl}`,
              title: clip(title, 120),
              companyName: company,
              location: location || 'Cairo, Egypt',
              type: inferType(`${title} ${row.employment_type || ''}`),
              workMode: row.telecommuting ? 'remote' : 'hybrid',
              description: clip(title, 4000),
              applyUrl,
              sourceName: company,
            });
          });
        } catch (error) {
          console.log(`${company} feed skipped:`, error.message);
        }
      })()
    ),
  ]);
}

export async function fetchPublicJobFeed() {
  const jobs = [];
  await fetchMenaCareerBoards(jobs);

  try {
    const data = await readJson('https://www.arbeitnow.com/api/job-board-api?page=1');
    const rows = Array.isArray(data?.data) ? data.data : [];
    rows.forEach((row) => {
      const title = String(row.title || '').trim();
      const applyUrl = String(row.url || '').trim();
      if (!title || !applyUrl || !TOPIC_RE.test(`${title} ${(row.tags || []).join(' ')}`)) return;
      pushMappedJob(jobs, {
        _id: `feed:arbeitnow:${applyUrl}`,
        title: clip(title, 120),
        companyName: clip(row.company_name || 'Company', 100) || 'Company',
        location: row.location || 'Remote',
        type: inferType(`${title} ${(row.tags || []).join(' ')}`),
        workMode: row.remote ? 'remote' : 'hybrid',
        description: clip(row.description || title, 4000) || title,
        applyUrl,
        sourceName: 'Arbeitnow',
      });
    });
    const page2 = await readJson('https://www.arbeitnow.com/api/job-board-api?page=2');
    const extra = Array.isArray(page2?.data) ? page2.data : [];
    extra.forEach((row) => {
      const title = String(row.title || '').trim();
      const applyUrl = String(row.url || '').trim();
      if (!title || !applyUrl || !TOPIC_RE.test(`${title} ${(row.tags || []).join(' ')}`)) return;
      pushMappedJob(jobs, {
        _id: `feed:arbeitnow:${applyUrl}`,
        title: clip(title, 120),
        companyName: clip(row.company_name || 'Company', 100) || 'Company',
        location: row.location || 'Remote',
        type: inferType(`${title} ${(row.tags || []).join(' ')}`),
        workMode: row.remote ? 'remote' : 'hybrid',
        description: clip(row.description || title, 4000) || title,
        applyUrl,
        sourceName: 'Arbeitnow',
      });
    });
  } catch (error) {
    console.log('Arbeitnow feed skipped:', error.message);
  }

  const remotiveQueries = [
    'https://remotive.com/api/remote-jobs?category=software-dev',
    'https://remotive.com/api/remote-jobs?category=data',
    'https://remotive.com/api/remote-jobs?category=design',
    'https://remotive.com/api/remote-jobs?category=marketing',
    'https://remotive.com/api/remote-jobs?search=internship',
    'https://remotive.com/api/remote-jobs?search=intern',
    'https://remotive.com/api/remote-jobs?search=egypt',
    'https://remotive.com/api/remote-jobs?search=cairo',
    'https://remotive.com/api/remote-jobs?search=dubai',
    'https://remotive.com/api/remote-jobs?search=saudi',
    'https://remotive.com/api/remote-jobs?search=uae',
    'https://remotive.com/api/remote-jobs?search=qatar',
    'https://remotive.com/api/remote-jobs?search=kuwait',
    'https://remotive.com/api/remote-jobs?search=jordan',
    'https://remotive.com/api/remote-jobs?search=riyadh',
    'https://remotive.com/api/remote-jobs?search=morocco',
    'https://remotive.com/api/remote-jobs?search=algeria',
    'https://remotive.com/api/remote-jobs?search=tunisia',
    'https://remotive.com/api/remote-jobs?search=lebanon',
  ];

  await Promise.all(
    remotiveQueries.map(async (url) => {
      try {
        const data = await readJson(url);
        const rows = Array.isArray(data?.jobs) ? data.jobs : [];
        rows.slice(0, 50).forEach((row) => {
          const title = String(row.title || '').trim();
          const applyUrl = String(row.url || '').trim();
          if (!title || !applyUrl || !TOPIC_RE.test(`${title} ${(row.tags || []).join(' ')}`)) return;
          pushMappedJob(jobs, {
            _id: `feed:remotive:${applyUrl}`,
            title: clip(title, 120),
            companyName: clip(row.company_name || 'Company', 100) || 'Company',
            location: row.candidate_required_location || 'Remote',
            type: inferType(`${title} ${(row.tags || []).join(' ')}`),
            workMode: 'remote',
            description: clip(row.description || title, 4000) || title,
            applyUrl,
            sourceName: 'Remotive',
          });
        });
      } catch (error) {
        console.log('Remotive feed skipped:', error.message);
      }
    })
  );

  const jobicyQueries = [
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=design',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=marketing',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=data',
    'https://jobicy.com/api/v2/remote-jobs?count=40&geo=anywhere&tag=intern',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=united-arab-emirates&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=saudi-arabia&tag=developer',
    'https://jobicy.com/api/v2/remote-jobs?count=30&geo=qatar&tag=developer',
  ];

  await Promise.all(
    jobicyQueries.map(async (url) => {
      try {
        const data = await readJson(url);
        const rows = Array.isArray(data?.jobs) ? data.jobs : [];
        rows.forEach((row) => {
          const title = String(row.jobTitle || row.title || '').trim();
          const applyUrl = String(row.url || '').trim();
          if (!title || !applyUrl || !TOPIC_RE.test(title)) return;
          if (url.includes('geo=') && !url.includes('geo=anywhere') && !ARAB_RE.test(String(row.jobGeo || '').toLowerCase())) {
            return;
          }
          pushMappedJob(jobs, {
            _id: `feed:jobicy:${applyUrl}`,
            title: clip(title, 120),
            companyName: clip(row.companyName || 'Company', 100) || 'Company',
            location: row.jobGeo || 'Remote',
            type: inferType(title),
            workMode: 'remote',
            description: clip(row.jobDescription || row.jobExcerpt || title, 4000) || title,
            applyUrl,
            sourceName: 'Jobicy',
          });
        });
      } catch (error) {
        console.log('Jobicy feed skipped:', error.message);
      }
    })
  );

  const himalayaQueries = [
    'https://himalayas.app/jobs/api/search?q=developer&worldwide=true',
    'https://himalayas.app/jobs/api/search?q=design',
    'https://himalayas.app/jobs/api/search?q=marketing',
    'https://himalayas.app/jobs/api/search?q=data%20analyst',
    'https://himalayas.app/jobs/api/search?employment_type=Intern',
    'https://himalayas.app/jobs/api/search?country=egypt',
    'https://himalayas.app/jobs/api/search?country=united-arab-emirates',
    'https://himalayas.app/jobs/api/search?country=saudi-arabia',
    'https://himalayas.app/jobs/api/search?country=qatar',
    'https://himalayas.app/jobs/api/search?country=jordan',
    'https://himalayas.app/jobs/api/search?country=morocco',
    'https://himalayas.app/jobs/api?limit=20',
  ];

  await Promise.all(
    himalayaQueries.map(async (url) => {
      try {
        const data = await readJson(url);
        const rows = Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : [];
        rows.forEach((row) => {
          const title = String(row.title || row.jobTitle || '').trim();
          const applyUrl = String(row.applicationLink || row.applyUrl || row.url || '').trim();
          const restrictions = Array.isArray(row.locationRestrictions) ? row.locationRestrictions : [];
          const location = restrictions.length
            ? restrictions.join(', ')
            : row.location || row.country || 'Remote';
          if (!title || !applyUrl || !TOPIC_RE.test(title)) return;
          if (url.includes('country=') && !EGYPT_RE.test(String(location).toLowerCase()) && !ARAB_RE.test(String(location).toLowerCase())) {
            return;
          }
          pushMappedJob(jobs, {
            _id: `feed:himalayas:${applyUrl}`,
            title: clip(title, 120),
            companyName: clip(row.companyName || row.company || 'Company', 100) || 'Company',
            location,
            type: inferType(`${title} ${row.employmentType || ''}`),
            workMode: 'remote',
            description: clip(row.excerpt || row.description || title, 4000) || title,
            applyUrl,
            sourceName: 'Himalayas',
          });
        });
      } catch (error) {
        console.log('Himalayas feed skipped:', error.message);
      }
    })
  );

  try {
    const data = await readJson('https://remoteok.com/api');
    const rows = Array.isArray(data) ? data : [];
    rows.forEach((row) => {
      const title = String(row.position || row.title || '').trim();
      const applyUrl = String(row.apply_url || row.url || '').trim();
      if (!title || !applyUrl || !TOPIC_RE.test(`${title} ${(row.tags || []).join(' ')}`)) return;
      pushMappedJob(jobs, {
        _id: `feed:remoteok:${applyUrl}`,
        title: clip(title, 120),
        companyName: clip(row.company || 'Company', 100) || 'Company',
        location: row.location || 'Remote',
        type: inferType(`${title} ${(row.tags || []).join(' ')}`),
        workMode: 'remote',
        description: clip(row.description || title, 4000) || title,
        applyUrl,
        sourceName: 'RemoteOK',
      });
    });
  } catch (error) {
    console.log('RemoteOK feed skipped:', error.message);
  }

  const seen = new Set();
  return sortJobs(
    jobs.filter((job) => {
      if (seen.has(job.applyUrl) || seen.has(job._id)) return false;
      seen.add(job.applyUrl);
      seen.add(job._id);
      return true;
    })
  );
}

const previewJobs = new Map();

export function cacheFeedJob(job) {
  if (job?._id) previewJobs.set(String(job._id), job);
}

export function getCachedFeedJob(id) {
  return previewJobs.get(String(id || '')) || null;
}

export function getJobRegion(job) {
  const location = String(job?.location || '');
  if (job?.source === 'feed') {
    if (EGYPT_RE.test(location.toLowerCase())) return 'egypt';
    if (ARAB_RE.test(`${location} ${job?.title || ''}`.toLowerCase())) return 'arab';
    return 'world';
  }
  const region = regionFromText(location || 'Egypt', job?.title);
  return region === 'world' && (!job?.location || /egypt|مصر/i.test(location))
    ? 'egypt'
    : region;
}

export function mergeJobs(localJobs = [], feedJobs = []) {
  const seen = new Set(
    localJobs
      .map((job) => String(job.applyUrl || job.title || '').toLowerCase())
      .filter(Boolean)
  );
  const extras = feedJobs.filter((job) => {
    const key = String(job.applyUrl || job.title || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  extras.forEach(cacheFeedJob);
  return sortJobs([...localJobs, ...extras]);
}
