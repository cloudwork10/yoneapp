import { CERTIFICATE_FOUNDER_NAME } from '../config/legal';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getCertificateFields({
  course,
  projectSubmission,
  fullName,
  user,
} = {}) {
  const issuedAt = projectSubmission?.certificate?.issuedAt
    ? new Date(projectSubmission.certificate.issuedAt)
    : new Date();
  const day = String(issuedAt.getDate()).padStart(2, '0');
  const month = String(issuedAt.getMonth() + 1).padStart(2, '0');
  const year = issuedAt.getFullYear();
  return {
    studentName:
      projectSubmission?.certificate?.studentName
      || projectSubmission?.fullName
      || fullName
      || user?.name
      || 'Student',
    courseTitle: course?.title || 'Course',
    instructorName: course?.instructor || 'Course Instructor',
    founderName: CERTIFICATE_FOUNDER_NAME,
    issuedLabel: `${day}/${month}/${year}`,
  };
}

export function buildCertificateHtml(fields) {
  const studentName = escapeHtml(fields.studentName);
  const courseTitle = escapeHtml(fields.courseTitle);
  const instructorName = escapeHtml(fields.instructorName);
  const founderName = escapeHtml(fields.founderName);
  const issuedLabel = escapeHtml(fields.issuedLabel);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      @page { size: 842px 595px; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        width: 842px;
        height: 595px;
        background: #f4f6f9;
      }
      .page {
        position: relative;
        width: 842px;
        height: 595px;
        overflow: hidden;
        background: #f4f6f9;
        font-family: Helvetica, Arial, sans-serif;
      }
      .decor {
        position: absolute;
        top: 0;
        left: 0;
        width: 842px;
        height: 595px;
      }
      .frame {
        position: absolute;
        top: 32px;
        left: 36px;
        width: 770px;
        height: 531px;
        border: 1.5px solid #12315c;
        box-sizing: border-box;
      }
      .content {
        position: relative;
        z-index: 2;
        height: 531px;
        padding: 36px 72px 22px;
        box-sizing: border-box;
        text-align: center;
      }
      .title {
        margin: 0;
        color: #0c2348;
        font-family: "Times New Roman", Times, serif;
        font-size: 42px;
        font-weight: 700;
        letter-spacing: 4px;
        line-height: 1;
      }
      .subtitle {
        margin: 8px 0 0;
        color: #0c2348;
        font-family: "Times New Roman", Times, serif;
        font-size: 16px;
        letter-spacing: 5px;
        font-weight: 600;
      }
      .program {
        margin: 12px 0 0;
        color: #16386f;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2.4px;
      }
      .divider {
        width: 210px;
        height: 14px;
        margin: 12px auto 14px;
        position: relative;
      }
      .divider:before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: #16386f;
      }
      .divider:after {
        content: "◆";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #f4f6f9;
        color: #16386f;
        font-size: 10px;
        padding: 0 8px;
      }
      .presented {
        margin: 0 0 8px;
        color: #222;
        font-family: "Times New Roman", Times, serif;
        font-size: 12px;
        letter-spacing: 2px;
      }
      .name {
        margin: 0 auto;
        padding: 0 12px 8px;
        border-bottom: 1px solid #c5c9d1;
        display: inline-block;
        color: #111;
        font-size: 32px;
        font-weight: 800;
        line-height: 1.15;
      }
      .copy {
        margin: 14px auto 0;
        max-width: 560px;
        color: #222;
        font-family: "Times New Roman", Times, serif;
        font-size: 15px;
        line-height: 1.45;
      }
      .course { font-weight: 700; }
      .footer {
        margin: 28px auto 0;
        width: 626px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
      }
      .sign {
        width: 210px;
        text-align: center;
      }
      .sign-script {
        font-family: "Snell Roundhand", "Segoe Script", "Brush Script MT", cursive;
        font-size: 24px;
        color: #111;
        line-height: 1;
        margin-bottom: 2px;
      }
      .sign-line {
        height: 1px;
        background: #222;
        margin: 0 16px 8px;
      }
      .sign-name {
        font-size: 13px;
        font-weight: 800;
        color: #111;
      }
      .sign-role {
        margin-top: 4px;
        font-size: 10px;
        letter-spacing: 1px;
        color: #333;
      }
      .seal-slot {
        width: 84px;
        height: 84px;
      }
      .meta {
        margin-top: 12px;
        text-align: center;
        color: #666;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <svg class="decor" viewBox="0 0 842 595" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#0b234d" d="M0 0 H310 C250 18 198 48 156 98 C104 164 62 232 0 292 Z"/>
        <path fill="#163b78" d="M0 0 H230 C186 22 148 58 118 104 C78 168 40 220 0 258 Z"/>
        <path fill="#2a5aa3" d="M0 0 H150 C122 20 96 52 76 90 C52 140 26 182 0 214 Z"/>
        <path fill="#0b234d" d="M842 595 H532 C592 577 644 547 686 497 C738 431 780 363 842 303 Z"/>
        <path fill="#163b78" d="M842 595 H612 C656 573 694 537 724 491 C764 427 802 375 842 337 Z"/>
        <path fill="#2a5aa3" d="M842 595 H692 C720 575 746 543 766 505 C790 455 816 413 842 381 Z"/>
        <g transform="translate(421 508)">
          <circle r="41" fill="#c5d2e0"/>
          <circle r="33" fill="#dce3ec"/>
          <circle r="33" fill="none" stroke="#9aadc2" stroke-width="2" stroke-dasharray="2.2 3.1"/>
          <circle r="41" fill="none" stroke="#b7c6d6" stroke-width="5" stroke-dasharray="3 4"/>
        </g>
      </svg>
      <div class="frame">
        <div class="content">
          <h1 class="title">CERTIFICATE</h1>
          <p class="subtitle">OF ACHIEVEMENT</p>
          <p class="program">ELNADY LEARNING PROGRAM</p>
          <div class="divider"></div>
          <p class="presented">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          <p class="name">${studentName}</p>
          <p class="copy">
            for successfully completing the
            <span class="course">${courseTitle}</span>
            course as part of the ELNADY Learning Program, with high performance and outstanding achievement.
          </p>
          <div class="footer">
            <div class="sign">
              <div class="sign-script">Signature</div>
              <div class="sign-line"></div>
              <div class="sign-name">${instructorName}</div>
              <div class="sign-role">COURSE INSTRUCTOR</div>
            </div>
            <div class="seal-slot"></div>
            <div class="sign">
              <div class="sign-script">Signature</div>
              <div class="sign-line"></div>
              <div class="sign-name">${founderName}</div>
              <div class="sign-role">FOUNDER</div>
            </div>
          </div>
          <div class="meta">${issuedLabel}</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
