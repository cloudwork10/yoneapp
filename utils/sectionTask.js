export const SECTION_TASK_MARKER = '__YONE_SECTION_TASK__';

export function emptySectionTask() {
  return { title: '', body: '', pdfUrl: '' };
}

export function normalizeSectionTask(task) {
  return {
    title: String(task?.title || '').trim(),
    body: String(task?.body || '').trim(),
    pdfUrl: String(task?.pdfUrl || '').trim(),
  };
}

export function hasSectionTask(task) {
  const next = normalizeSectionTask(task);
  return !!(next.title || next.body || next.pdfUrl);
}

function parsePackedTask(description) {
  const text = String(description || '');
  const idx = text.lastIndexOf(SECTION_TASK_MARKER);
  if (idx === -1) {
    return { description: text, task: null };
  }
  const visible = text.slice(0, idx).trimEnd();
  const jsonPart = text.slice(idx + SECTION_TASK_MARKER.length).trim();
  try {
    const parsed = JSON.parse(jsonPart);
    return { description: visible, task: normalizeSectionTask(parsed) };
  } catch {
    return { description: text, task: null };
  }
}

export function hydrateSectionTask(section) {
  if (!section || typeof section !== 'object') return section;
  const packed = parsePackedTask(section.description);
  const task = hasSectionTask(section.task) ? normalizeSectionTask(section.task) : (packed.task || emptySectionTask());
  return {
    ...section,
    description: packed.description,
    task,
  };
}

export function packSectionTask(section) {
  if (!section || typeof section !== 'object') return section;
  const packed = parsePackedTask(section.description);
  const task = normalizeSectionTask(section.task);
  let description = packed.description;
  if (hasSectionTask(task)) {
    description = `${description ? `${description}\n\n` : ''}${SECTION_TASK_MARKER}${JSON.stringify(task)}`.trim();
  }
  return {
    ...section,
    description,
    task,
  };
}

export function pdfPreviewUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  const drive = value.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (drive?.[1]) {
    return `https://drive.google.com/file/d/${drive[1]}/preview`;
  }
  if (/docs\.google\.com\/gview/i.test(value) || /\/preview(\?|$)/i.test(value)) {
    return value;
  }
  if (/\.pdf(\?|$)/i.test(value) || /\/uploads\/pdfs\//i.test(value)) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(value)}`;
  }
  return value;
}
