/**
 * Steam BBCode to HTML Parser
 * Efficiently converts Steam's BBCode format to HTML using a rule-based system
 */

// Simple tag replacements (pattern -> replacement)
const SIMPLE_RULES = [
  // Pre-cleanup
  [/\\\[/g, '['],
  [/\\\]/g, ']'],
  [/\b(?:no\s+(?:image|vids?)\s+)/gi, ''],

  // Headers
  [/\[h1\]([\s\S]*?)\[\/h1\]/gi, '<h2 style="font-size: 2rem; font-weight: bold; margin: 1.5rem 0 0.75rem 0; color: #ffffff;">$1</h2>'],
  [/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<h3 style="font-size: 1.75rem; font-weight: bold; margin: 1.5rem 0 0.75rem 0; color: #ffffff;">$1</h3>'],
  [/\[h3\]([\s\S]*?)\[\/h3\]/gi, '<h4 style="font-size: 1.5rem; font-weight: bold; margin: 1.5rem 0 0.75rem 0; color: #e5e7eb;">$1</h4>'],

  // Lists
  [/\[list\]/gi, '<ul style="margin: 0.75rem 0; padding-left: 2rem; list-style-type: disc;">'],
  [/\[\/list\]/gi, '</ul>'],
  [/\[olist\]/gi, '<ol style="margin: 0.75rem 0; padding-left: 2rem;">'],
  [/\[\/olist\]/gi, '</ol>'],
  [/\[\*\]/gi, '<li style="margin: 0.5rem 0; line-height: 1.6;">'],
  [/\[\/\*\]/gi, '</li>'],
  [/\[\*\/\]/gi, '</li>'],

  // Paragraphs
  [/\[p\s+[^\]]*\]/gi, '<br>'],
  [/\[p\]/gi, '<br>'],
  [/\[\/p\]/gi, ''],
  [/<li[^>]*>\s*<br>/gi, m => m.replace('<br>', '')],

  // Horizontal rules
  [/\[hr\]\[\/hr\]/gi, '<hr style="border: none; border-top: 1px solid #374151; margin: 1.5rem 0;" />'],
  [/\[hr\]/gi, '<hr style="border: none; border-top: 1px solid #374151; margin: 1.5rem 0;" />'],
  [/\[\/hr\]/gi, ''],

  // Text formatting
  [/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong style="font-weight: 700; color: #ffffff;">$1</strong>'],
  [/\[i\]([\s\S]*?)\[\/i\]/gi, '<em style="font-style: italic;">$1</em>'],
  [/\[u\]([\s\S]*?)\[\/u\]/gi, '<u style="text-decoration: underline; text-decoration-thickness: 1.5px;">$1</u>'],
  [/\[strike\]([\s\S]*?)\[\/strike\]/gi, '<s style="opacity: 0.7;">$1</s>'],
  [/\[c\]([\s\S]*?)\[\/c\]/gi, '<div style="text-align: center; font-style: italic; opacity: 0.8; margin: 0.5rem 0;">$1</div>'],

  // Links
  [/\[url=["']([^"']+)["']\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$2</a>'],
  [/\[url=([^\]]+?)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$2</a>'],
  [/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$1</a>'],

  // Dynamic links
  [/\[dynamiclink\s+href=["']([^"']+)["']\]([\s\S]*?)\[\/dynamiclink\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$2</a>'],
  [/\[dynamiclink\s+href=([^\]]+?)\]([\s\S]*?)\[\/dynamiclink\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$2</a>'],
  [/\[dynamiclink\s+href=["']([^"']+)["']\s*\/?]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$1</a>'],
  [/\[dynamiclink\s+href=([^\]]+?)\s*\/?]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">$1</a>'],

  // Code blocks
  [/\[code\]([\s\S]*?)\[\/code\]/gi, '<code style="background: #374151; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem;">$1</code>'],
  [/\[pre\]([\s\S]*?)\[\/pre\]/gi, '<pre style="background: #374151; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; font-size: 0.875rem;">$1</pre>'],

  // Steam placeholders
  [/\{STEAM_CLAN_IMAGE\}\/(\d+)\/([a-f0-9]+\.(png|jpg|jpeg|gif))/gi, (m, appid, img) => `https://clan.cloudflare.steamstatic.com/images/${appid}/${img}`],

  // Line breaks
  [/\n\n+/g, '<br><br>'],
  [/\n/g, '<br>']
];

// Cleanup rules (run at the end)
const CLEANUP_RULES = [
  [/\[img\s+src=["']/gi, ''],
  [/\[carousel\]/gi, ''],
  [/\[\/carousel\]/gi, ''],
  [/\[video[^\]]*\]/gi, ''],
  [/\[\/video\]/gi, ''],
  [/\[["']/g, ''],
  [/["']\s*\]/g, ''],
  [/['"]\s*$/gm, ''],
  [/\[\]/g, ''],
  [/\]\s*$/gm, ''],
  [/\[\/[^\]]*\]/gi, ''],
  [/\s{3,}/g, ' '],
  [/(<br>\s*){3,}/g, '<br><br>']
];

// Complex handlers that need custom logic
function handleYouTubeEmbeds(text) {
  return text
    .replace(/\[previewyoutube="([^"]+)";[^\]]*\][\s\S]*?\[\/previewyoutube\]/gi, (m, id) =>
      `<div class="youtube-embed" style="margin: 1.5rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0.5rem; background: #1a1a1a;"><iframe src="https://www.youtube.com/embed/${id}?autoplay=0&rel=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`)
    .replace(/\[previewyoutube=([^;\]]+);[^\]]*\]/gi, (m, id) =>
      `<div class="youtube-embed" style="margin: 1.5rem 0; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0.5rem; background: #1a1a1a;"><iframe src="https://www.youtube.com/embed/${id}?autoplay=0&rel=0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`);
}

function handleVideoEmbeds(text) {
  return text.replace(/\[video\s+([^\]]+?)\][\s\S]*?\[\/video\]/gi, (match, attrs) => {
    const extract = (pattern) => (attrs.match(pattern) || [])[1] || '';
    const webm = extract(/webm=["']([^"']+)["']/i);
    const mp4 = extract(/mp4=["']([^"']+)["']/i);
    const poster = extract(/poster=["']([^"']+)["']/i);
    const autoplay = /autoplay=["']?true["']?/i.test(attrs);
    const controls = !/controls=["']?false["']?/i.test(attrs);

    let html = '<video preload="metadata" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; background: #000;"';
    if (poster) html += ` poster="${poster}"`;
    if (autoplay) html += ' autoplay muted loop playsinline';
    if (controls) html += ' controls';
    html += '>';
    if (mp4) html += `<source src="${mp4}" type="video/mp4">`;
    if (webm) html += `<source src="${webm}" type="video/webm">`;
    html += 'Your browser does not support the video tag.</video>';
    return html;
  });
}

function handleImages(text) {
  return text
    .replace(/\[img\]([\s\S]*?)(?:\[\/img\]|(?=\[)|$)/gi, (m, content) => {
      const url = (content.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/i) || [])[1];
      return url ? `<img src="${url}" alt="Steam content" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; display: block;" />` : '';
    })
    .replace(/\[img\s+src=["']([^"']+)["']\s*\/?]/gi, '<img src="$1" alt="Steam content" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; display: block;" />')
    .replace(/\[img=([^\]]+)\]/gi, '<img src="$1" alt="Steam content" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; display: block;" />')
    .replace(/\[img[\s\S]*?\]/gi, '')
    .replace(/\[\/img\]/gi, '');
}

/**
 * Main parser function
 * @param {string} bbcode - Steam BBCode text
 * @returns {string} - HTML output
 */
function parseSteamBBCode(bbcode) {
  let result = bbcode;

  // Apply simple rules
  SIMPLE_RULES.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  // Apply complex handlers
  result = handleYouTubeEmbeds(result);
  result = handleVideoEmbeds(result);
  result = handleImages(result);

  // Final cleanup
  CLEANUP_RULES.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

module.exports = parseSteamBBCode;
module.exports.parseSteamBBCode = parseSteamBBCode;
module.exports.default = parseSteamBBCode;
