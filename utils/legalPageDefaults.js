import { CONTACT_EMAIL, PRIVACY_POLICY_URL, REFUND_POLICY_URL, TERMS_URL } from '../config/legal';

function page(title, subtitle, sections) {
  return {
    title,
    subtitle,
    sections: sections.map((section) => ({ title: section.title, body: section.body })),
  };
}

export const LEGAL_PAGE_DEFAULTS = {
  privacy: page('Privacy Policy', 'Last updated: July 2026', [
    {
      title: 'Information We Collect',
      body:
        'We collect information you provide when you use ELNADY:\n\n' +
        '• Account data (name, email, password — stored hashed)\n' +
        '• Profile information and preferences\n' +
        '• Learning progress and course activity\n' +
        '• Job applications and CV files you upload\n' +
        '• Media you upload (images, videos, audio, PDFs)\n' +
        '• Basic device and security logs (IP, login attempts)\n' +
        '• Push notification token if you enable notifications',
    },
    {
      title: 'How We Use Your Information',
      body:
        'We use your data to:\n\n' +
        '• Create and secure your account\n' +
        '• Deliver courses, content, tech news, and reels\n' +
        '• Process in-app job applications\n' +
        '• Send optional push notifications\n' +
        '• Protect the platform from abuse\n\n' +
        'We do not sell your personal data to third parties.',
    },
    {
      title: 'Who Can See Your Data',
      body:
        '• You — your account and activity\n' +
        '• ELNADY admins — to operate and support the app\n' +
        '• Job posters — applicants and CVs for their own jobs only',
    },
    {
      title: 'Where Data Is Stored',
      body:
        '• Database: MongoDB Atlas (cloud)\n' +
        '• Uploaded files: ELNADY servers on Railway\n\n' +
        'Data may be processed on servers outside your country with appropriate safeguards.',
    },
    {
      title: 'Third-Party Infrastructure',
      body:
        'We use hosting providers to run the app:\n\n' +
        '• MongoDB Atlas (database)\n' +
        '• Railway (API and file storage)\n' +
        '• Expo (app delivery and notifications)\n\n' +
        'These providers process data on our behalf to operate the service.',
    },
    {
      title: 'Data Security',
      body:
        '• Passwords are hashed with bcrypt\n' +
        '• HTTPS for app-to-server communication\n' +
        '• JWT authentication on protected APIs\n' +
        '• Rate limiting and account lockout on failed logins',
    },
    {
      title: 'Push Notifications',
      body:
        'We may send notifications about new content, courses, or important announcements. ' +
        'You can disable them in your device settings or inside the app.',
    },
    {
      title: 'Your Rights',
      body:
        'You may request to:\n\n' +
        '• Access or correct your personal data\n' +
        '• Delete your account and related data\n' +
        '• Opt out of push notifications\n\n' +
        `Contact us at ${CONTACT_EMAIL}`,
    },
    {
      title: "Children's Privacy",
      body:
        'ELNADY is not intended for children under 13. We do not knowingly collect data from children under 13. ' +
        'If we learn that we have, we will delete it promptly.',
    },
    {
      title: 'Policy Updates',
      body:
        'We may update this Privacy Policy. The latest version is always available at our public URL below. ' +
        'Last updated: July 2026.',
    },
    {
      title: 'Contact Us',
      body: `Email: ${CONTACT_EMAIL}\nPublic policy: ${PRIVACY_POLICY_URL}`,
    },
  ]),
  terms: page('Terms & Conditions', 'Last updated: July 2026', [
    {
      title: '1. Acceptance of Terms',
      body:
        'By using the ELNADY mobile application, you agree to these Terms & Conditions. ' +
        'If you do not agree, please do not use the app.',
    },
    {
      title: '2. The Service',
      body:
        'ELNADY provides:\n\n' +
        '• Educational courses and learning content\n' +
        '• Tech news and reels\n' +
        '• Job board with in-app applications\n' +
        '• Community / club features\n' +
        '• User accounts and admin tools',
    },
    {
      title: '3. Your Account',
      body:
        '• You must provide accurate registration information\n' +
        '• You are responsible for your password and account activity\n' +
        '• Do not share your account with others\n' +
        '• We may suspend or delete accounts that violate these terms',
    },
    {
      title: '4. Content & Intellectual Property',
      body:
        'ELNADY content (text, video, images, logos, software) is owned by ELNADY or licensed to us. ' +
        'You may not copy, resell, or redistribute it without written permission. ' +
        'Some videos may be hosted on third-party platforms (YouTube, Vimeo) subject to their terms.',
    },
    {
      title: '5. User-Generated Content',
      body:
        'When you upload content (images, videos, CVs, job posts):\n\n' +
        '• You confirm you have the right to publish it\n' +
        '• You must not upload illegal, abusive, or infringing content\n' +
        '• You grant ELNADY a license to store and display it to operate the service\n' +
        '• We may remove content that violates these terms',
    },
    {
      title: '6. Jobs & Applications',
      body:
        '• Job applications are processed in-app\n' +
        '• Job posters see applicants and CVs for their own listings only\n' +
        '• ELNADY is a technical platform and does not guarantee hiring outcomes\n' +
        '• You are responsible for the accuracy of your CV and application data',
    },
    {
      title: '7. Prohibited Uses',
      body:
        'You may not use ELNADY for:\n\n' +
        '• Illegal activity or fraud\n' +
        '• Harassment, hate speech, or abuse\n' +
        '• Unauthorized access or hacking attempts\n' +
        '• Misinformation or impersonation\n' +
        '• Commercial exploitation of content without permission',
    },
    {
      title: '8. Subscriptions & Payments',
      body:
        'Some features or courses may require payment. Pricing and subscription terms shown in the app apply when payments are enabled.',
    },
    {
      title: '9. Privacy Policy',
      body: `Your use is also governed by our Privacy Policy:\n${PRIVACY_POLICY_URL}`,
    },
    {
      title: '10. Termination',
      body:
        'We may modify or discontinue parts of the service for maintenance or improvement. ' +
        'We may terminate your account immediately for violations of these terms.',
    },
    {
      title: '11. Disclaimer',
      body:
        'The app is provided "as is". We do not guarantee error-free or uninterrupted service. ' +
        'Educational content is for general learning and is not professional or legal advice.',
    },
    {
      title: '12. Limitation of Liability',
      body:
        'ELNADY is not liable for indirect damages arising from use of the app, including loss of data, ' +
        'job opportunities, or profits, to the extent permitted by applicable law.',
    },
    {
      title: '13. Changes to Terms',
      body:
        'We may update these terms. The latest version is always available at our public URL below. ' +
        'Continued use after updates means you accept the revised terms. Last updated: July 2026.',
    },
    {
      title: '14. Contact',
      body: `Email: ${CONTACT_EMAIL}\nPublic terms: ${TERMS_URL}`,
    },
  ]),
  refund: page('Refund Policy', 'Last updated: July 2026', [
    {
      title: 'Free Content',
      body:
        'ELNADY offers free features (courses, news, jobs, and more) at no charge. ' +
        'Creating an account and using free features does not require payment, so refunds do not apply to unpaid use.',
    },
    {
      title: 'Paid Subscriptions & Courses',
      body:
        'When paid plans or courses are enabled:\n\n' +
        '• Price and duration are shown clearly before payment\n' +
        '• Access is activated after successful payment\n' +
        '• You may request a refund within 7 days if you have not substantially used the paid content (less than ~20% of lessons/features)\n' +
        '• After 7 days or heavy use, refunds are only considered for proven technical errors (e.g. double charge, access not granted)',
    },
    {
      title: 'How to Request a Refund',
      body:
        `1. Email ${CONTACT_EMAIL}\n` +
        '2. Include: account name, email, payment date, and reason\n' +
        '3. Attach payment receipt if available\n' +
        '4. We respond within 3–5 business days\n\n' +
        'Approved refunds are returned to the original payment method within 7–14 days, depending on the bank or payment provider.',
    },
    {
      title: 'Payment Processing',
      body:
        'In-app payments are processed through secure payment gateways (e.g. Paymob or app stores). ' +
        'ELNADY does not store your full card details — they are handled by the payment provider.',
    },
    {
      title: 'App Store / Google Play',
      body:
        'Purchases through Apple or Google follow their refund policies:\n\n' +
        '• Apple: reportaproblem.apple.com\n' +
        '• Google Play: play.google.com/store/account\n\n' +
        'ELNADY cannot override store refund decisions, but we can help with your request.',
    },
    {
      title: 'Non-Refundable Cases',
      body:
        '• Terms of service violations or account abuse\n' +
        '• Substantial use of paid content\n' +
        '• Requests after 7 days (except proven technical errors)\n' +
        '• Temporary free-service downtime (we fix issues without monetary compensation for free tiers)',
    },
    {
      title: 'Policy Updates',
      body:
        'We may update this policy when new paid plans launch. The latest version is always on our public URL below. Last updated: July 2026.',
    },
    {
      title: 'Contact',
      body: `Refund & billing: ${CONTACT_EMAIL}\nPublic policy: ${REFUND_POLICY_URL}`,
    },
  ]),
  about: page('About Us', 'Meet the ELNADY team', [
    {
      title: 'Brand name',
      body: 'ELNADY',
    },
    {
      title: 'Arabic name',
      body: 'النادي',
    },
    {
      title: 'Tagline',
      body: 'Your Learning Companion',
    },
    {
      title: 'Intro',
      body:
        'Empowering developers worldwide with comprehensive learning resources, expert guidance, and innovative educational tools.',
    },
    {
      title: 'Our Story',
      body:
        'ELNADY was born from a simple yet powerful vision: to democratize programming education and make quality learning resources accessible to everyone, regardless of their background or experience level.\n\nFounded in 2025 by a team of passionate developers and educators, we believe that with the right guidance, tools, and community support, anyone can become a successful developer and contribute to the tech world.',
    },
    {
      title: 'Our Mission',
      body:
        'To provide a comprehensive, accessible, and engaging learning platform that empowers individuals to master programming skills, advance their careers, and contribute to the global technology community.\n\nWe are committed to breaking down barriers to tech education and creating opportunities for learners from all walks of life.',
    },
    {
      title: 'Quality Education',
      body: 'We provide high-quality, up-to-date content created by industry experts.',
    },
    {
      title: 'Accessibility',
      body: 'Making programming education accessible to everyone, everywhere.',
    },
    {
      title: 'Community',
      body: 'Building a supportive community of learners and mentors.',
    },
    {
      title: 'Innovation',
      body: 'Continuously improving and innovating our learning experience.',
    },
    {
      title: 'Our Team',
      body:
        'ELNADY is built by a diverse team of passionate individuals who share a common goal: making programming education better for everyone.\n\nOur team includes:\n\n• Experienced software developers and engineers\n• Professional educators and curriculum designers\n• UX/UI designers focused on learning experience\n• Community managers and support specialists\n• Content creators and technical writers',
    },
    {
      title: 'Technology',
      body:
        'ELNADY is built using modern, cutting-edge technologies to ensure the best possible user experience:\n\n• React Native for cross-platform mobile development\n• Node.js and Express for robust backend services\n• MongoDB for scalable data storage\n• Real-time notifications and updates\n• Advanced analytics and progress tracking\n• Secure authentication and data protection',
    },
    {
      title: 'Our Achievements',
      body:
        '• 10K+ Active Learners\n• 500+ Learning Resources\n• 50+ Expert Contributors\n• 99% User Satisfaction',
    },
    {
      title: 'Our Future Vision',
      body:
        'We are constantly working on new features and improvements:\n\n• AI-powered personalized learning paths\n• Live coding sessions and workshops\n• Advanced project-based learning\n• Industry partnerships and certifications\n• Global community events and hackathons\n• Mobile-first learning experiences\n\nOur goal is to become the world\'s leading platform for programming education.',
    },
    {
      title: 'Get in Touch',
      body:
        `We would love to hear from you. Whether you have feedback, suggestions, or just want to say hello, we are here to listen.\n\nEmail: ${CONTACT_EMAIL}\nWebsite: www.elnadyapp.com\nSocial Media: @elnady`,
    },
    {
      title: 'Footer',
      body:
        'Thank you for being part of the ELNADY community!\n\nTogether, we are building the future of programming education.',
    },
  ]),
};

export function getLegalPageFallback(slug) {
  const fallback = LEGAL_PAGE_DEFAULTS[slug];
  if (!fallback) {
    return { title: '', subtitle: '', sections: [] };
  }
  return {
    title: fallback.title,
    subtitle: fallback.subtitle,
    sections: fallback.sections.map((section) => ({ ...section })),
  };
}
