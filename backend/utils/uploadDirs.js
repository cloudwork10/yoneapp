const fs = require('fs');
const path = require('path');

const UPLOAD_SUBFOLDERS = ['images', 'videos', 'audios', 'pdfs', 'cvs'];

const UPLOAD_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '..', 'uploads');

function ensureUploadDirs() {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  for (const folder of UPLOAD_SUBFOLDERS) {
    fs.mkdirSync(path.join(UPLOAD_ROOT, folder), { recursive: true });
  }
  return UPLOAD_ROOT;
}

function getUploadRoot() {
  return UPLOAD_ROOT;
}

function countUploadFiles() {
  const byFolder = {};
  let total = 0;

  for (const folder of UPLOAD_SUBFOLDERS) {
    const dir = path.join(UPLOAD_ROOT, folder);
    try {
      const files = fs.readdirSync(dir).filter((name) => !name.startsWith('.'));
      byFolder[folder] = files.length;
      total += files.length;
    } catch {
      byFolder[folder] = 0;
    }
  }

  return { total, byFolder };
}

function isUploadsWritable() {
  try {
    const probe = path.join(UPLOAD_ROOT, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  UPLOAD_SUBFOLDERS,
  ensureUploadDirs,
  getUploadRoot,
  countUploadFiles,
  isUploadsWritable,
};
