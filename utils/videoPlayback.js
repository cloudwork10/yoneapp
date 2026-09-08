function normalizeUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function extractYouTubeId(url) {
  const value = normalizeUrl(url);
  const match =
    value.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
    ) || value.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
  return match?.[1] || null;
}

function extractVimeoId(url) {
  const value = normalizeUrl(url);
  const match =
    value.match(/player\.vimeo\.com\/video\/(\d+)/i) ||
    value.match(/vimeo\.com\/(?:video\/)?(\d+)/i) ||
    value.match(/vimeo\.com\/(?:channels\/[^/]+|groups\/[^/]+\/videos|ondemand\/[^/]+|album\/\d+\/video)\/(\d+)/i);
  return match?.[1] || null;
}

function extractVimeoPrivacyHash(url) {
  const value = normalizeUrl(url);
  const queryHash = value.match(/[?&]h=([a-zA-Z0-9]+)/i);
  if (queryHash?.[1]) return queryHash[1];
  const pathHash = value.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/i);
  return pathHash?.[1] || null;
}

function extractGoogleDriveId(url) {
  const value = normalizeUrl(url);
  const match =
    value.match(/drive\.google\.com\/file\/d\/([^/]+)/i) ||
    value.match(/[?&]id=([^&]+)/i);
  return match?.[1] || null;
}

function extractTikTokId(url) {
  const value = normalizeUrl(url);
  const match = value.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i) || value.match(/\/video\/(\d+)/i);
  return match?.[1] || null;
}

function extractDailymotionId(url) {
  const value = normalizeUrl(url);
  const match = value.match(/dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/i);
  return match?.[1] || null;
}

function extractInstagramCode(url) {
  const value = normalizeUrl(url);
  const match = value.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  return match?.[1] || null;
}

function extractFacebookVideoHref(url) {
  const value = normalizeUrl(url);
  if (/facebook\.com|fb\.watch/i.test(value)) return value;
  return '';
}

/** Vimeo embed URL with branding stripped as much as the API allows. */
export function buildVimeoEmbedUrl(url) {
  const id = extractVimeoId(url);
  if (!id) return '';

  const params = new URLSearchParams();
  const privacyHash = extractVimeoPrivacyHash(url);
  if (privacyHash) params.set('h', privacyHash);

  params.set('autoplay', '1');
  params.set('title', '0');
  params.set('byline', '0');
  params.set('portrait', '0');
  params.set('playsinline', '1');
  params.set('badge', '0');
  params.set('pip', '0');
  params.set('dnt', '1');
  params.set('transparent', '0');

  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

function buildIframeHtml(src) {
  const safeSrc = String(src || '').replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>
    * { margin: 0; padding: 0; background: #000; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe
    src="${safeSrc}"
    title="Video"
    referrerpolicy="strict-origin-when-cross-origin"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    allowfullscreen
  ></iframe>
</body>
</html>`;
}

/** True when the URL should play inside a WebView (YouTube, Vimeo, Drive, social). */
export function needsWebView(url) {
  const value = normalizeUrl(url);
  if (!value) return false;

  return (
    /youtube\.com|youtu\.be/i.test(value) ||
    /vimeo\.com|player\.vimeo\.com/i.test(value) ||
    /drive\.google\.com/i.test(value) ||
    /player\.cloudinary\.com/i.test(value) ||
    /facebook\.com|fb\.watch/i.test(value) ||
    /instagram\.com/i.test(value) ||
    /tiktok\.com/i.test(value) ||
    /dailymotion\.com/i.test(value) ||
    /twitch\.tv/i.test(value) ||
    /\/embed\//i.test(value)
  );
}

/** Convert a share/watch URL into an embeddable player URL. */
export function convertToEmbedUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return '';

  const youtubeId = extractYouTubeId(value);
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1&autoplay=1`;
  }

  const vimeoEmbed = buildVimeoEmbedUrl(value);
  if (vimeoEmbed) return vimeoEmbed;

  const driveId = extractGoogleDriveId(value);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  const tiktokId = extractTikTokId(value);
  if (tiktokId) {
    return `https://www.tiktok.com/embed/v2/${tiktokId}`;
  }

  const dailymotionId = extractDailymotionId(value);
  if (dailymotionId) {
    return `https://www.dailymotion.com/embed/video/${dailymotionId}`;
  }

  const instagramCode = extractInstagramCode(value);
  if (instagramCode) {
    return `https://www.instagram.com/p/${instagramCode}/embed`;
  }

  if (/facebook\.com|fb\.watch/i.test(value)) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(value)}&show_text=0&autoplay=1`;
  }

  if (/player\.cloudinary\.com/i.test(value)) {
    return value;
  }

  if (/\/embed\//i.test(value)) {
    return value;
  }

  return value;
}

/** Best WebView source — iframe HTML for YouTube/Vimeo/social, URI for Drive/others. */
export function getWebViewSource(url) {
  const value = normalizeUrl(url);
  if (!value) return null;

  const youtubeId = extractYouTubeId(value);
  if (youtubeId) {
    return {
      html: buildIframeHtml(convertToEmbedUrl(value)),
      baseUrl: 'https://www.youtube-nocookie.com',
    };
  }

  const vimeoId = extractVimeoId(value);
  if (vimeoId) {
    return {
      html: buildIframeHtml(buildVimeoEmbedUrl(value)),
      baseUrl: 'https://player.vimeo.com',
    };
  }

  if (extractTikTokId(value)) {
    return { html: buildIframeHtml(convertToEmbedUrl(value)), baseUrl: 'https://www.tiktok.com' };
  }
  if (extractDailymotionId(value)) {
    return { html: buildIframeHtml(convertToEmbedUrl(value)), baseUrl: 'https://www.dailymotion.com' };
  }
  if (extractInstagramCode(value)) {
    return { html: buildIframeHtml(convertToEmbedUrl(value)), baseUrl: 'https://www.instagram.com' };
  }
  if (extractFacebookVideoHref(value)) {
    return { html: buildIframeHtml(convertToEmbedUrl(value)), baseUrl: 'https://www.facebook.com' };
  }

  return { uri: convertToEmbedUrl(value) };
}

/** Block YouTube/TikTok/Facebook app schemes so playback stays in the WebView. */
export function keepPlaybackInWebView(request) {
  const url = String(request?.url || '');
  if (!url || url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) {
    return true;
  }
  if (/^(youtube|vnd\.youtube|intent|fb|instagram|tiktok|snssdk|vimeo):/i.test(url)) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}

/** Direct stream URLs that expo-av can play natively. */
export function isDirectVideoUrl(url) {
  const value = normalizeUrl(url);
  if (!value) return false;

  return (
    /\.(mp4|m3u8|webm|mov)(\?|$)/i.test(value) ||
    /gtv-videos-bucket|cloudinary|uploads\/videos|cloudflarestream/i.test(value)
  );
}
