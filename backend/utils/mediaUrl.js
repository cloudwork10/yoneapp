const fs = require('fs');
const path = require('path');
const { getUploadRoot } = require('./uploadDirs');

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

const UPLOAD_FOLDERS = ['images', 'videos', 'audios', 'pdfs', 'cvs'];

function getBaseUrl(req) {
  if (req?.get) {
    const host = req.get('host');
    if (host) {
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }
  return (process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );
}

function getUploadFolder(url) {
  const match = url.match(/\/uploads\/([^/]+)\//);
  if (match && UPLOAD_FOLDERS.includes(match[1])) {
    return match[1];
  }
  if (url.includes('/uploads/videos/')) return 'videos';
  if (url.includes('/uploads/audios/')) return 'audios';
  if (url.includes('/uploads/pdfs/')) return 'pdfs';
  if (url.includes('/uploads/cvs/')) return 'cvs';
  return 'images';
}

/**
 * Normalize an upload URL to the current server host.
 * If the local file is missing, return a public placeholder.
 */
function resolveUploadUrl(url, req) {
  if (!url || typeof url !== 'string') {
    return PLACEHOLDER;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return PLACEHOLDER;
  }

  if (!trimmed.includes('/uploads/')) {
    return trimmed;
  }

  const filename = trimmed.split('/').pop()?.split('?')[0];
  if (!filename) {
    return PLACEHOLDER;
  }

  const folder = getUploadFolder(trimmed);
  const filePath = path.join(getUploadRoot(), folder, filename);
  const base = getBaseUrl(req);

  if (fs.existsSync(filePath)) {
    return `${base}/uploads/${folder}/${filename}`;
  }

  return PLACEHOLDER;
}

function resolveMediaFields(doc, fields, req) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  for (const field of fields) {
    if (plain[field]) {
      plain[field] = resolveUploadUrl(plain[field], req);
    }
  }
  return plain;
}

module.exports = {
  PLACEHOLDER,
  getBaseUrl,
  resolveUploadUrl,
  resolveMediaFields,
};
