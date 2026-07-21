const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  UPLOAD_SUBFOLDERS,
  countUploadFiles,
  getUploadRoot,
  isUploadsWritable,
} = require('../utils/uploadDirs');

const router = express.Router();

const restoreUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 150 * 1024 * 1024 },
});

router.get('/storage/status', (req, res) => {
  const counts = countUploadFiles();
  res.status(200).json({
    status: 'success',
    uploadRoot: getUploadRoot(),
    writable: isUploadsWritable(),
    persistentHint:
      'Attach a Railway Volume mounted at /app/uploads so files survive redeploys.',
    ...counts,
  });
});

router.post('/storage/restore', restoreUpload.single('archive'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Send a zip file in the "archive" field (uploads/images/... structure).',
    });
  }

  const zipPath = req.file.path;
  const uploadRoot = getUploadRoot();
  let restored = 0;
  let skipped = 0;

  try {
    const zip = new AdmZip(zipPath);
    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) {
        continue;
      }

      let entryName = entry.entryName.replace(/\\/g, '/');
      if (entryName.startsWith('uploads/')) {
        entryName = entryName.slice('uploads/'.length);
      }

      const parts = entryName.split('/').filter(Boolean);
      if (parts.length < 2) {
        skipped += 1;
        continue;
      }

      const folder = parts[0];
      if (!UPLOAD_SUBFOLDERS.includes(folder)) {
        skipped += 1;
        continue;
      }

      const filename = path.basename(parts.slice(1).join('/'));
      if (!filename || filename.includes('..')) {
        skipped += 1;
        continue;
      }

      const dest = path.join(uploadRoot, folder, filename);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, entry.getData());
      restored += 1;
    }

    const counts = countUploadFiles();
    return res.status(200).json({
      status: 'success',
      message: 'Upload archive restored on server.',
      restored,
      skipped,
      ...counts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to restore upload archive.',
      error: error.message,
    });
  } finally {
    try {
      fs.unlinkSync(zipPath);
    } catch {
      // ignore cleanup errors
    }
  }
});

module.exports = router;
