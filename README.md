# Steam BBCode Parser

A lightweight, efficient parser for converting Steam's BBCode format (used in game news and updates) to HTML.

## Features

- ✅ **Comprehensive Tag Support** - Handles all common Steam BBCode tags
- ✅ **Efficient** - Rule-based system for fast parsing
- ✅ **Malformed BBCode Handling** - Gracefully handles incomplete or broken tags
- ✅ **Zero Dependencies** - Pure JavaScript, no external packages
- ✅ **Browser & Node.js** - Works in both environments
- ✅ **Well-Tested** - Battle-tested on real Steam game news

## Recent Updates

### YouTube Embed Fix (2025-01-15)
- **Fixed YouTube video ID extraction** - The semicolon in `[previewyoutube]` tags is INSIDE the quotes, not outside
- **Correct format**: `[previewyoutube="ULFMhdpFXRE;full"][/previewyoutube]`
- **Changed embed domain**: Now uses `youtube-nocookie.com` for better privacy and embed compatibility
- **Added accessibility**: Includes proper `title` attribute and `frameborder` for better browser support
- **Real-world example**: Tested with Helldivers 2 update news

## Installation

```bash
npm install steam-bbcode-parser
```

## Usage

```javascript
const parseSteamBBCode = require('steam-bbcode-parser');

// Example Steam BBCode from game news
const bbcode = `[h1]New Update![/h1]
[b]Features:[/b]
[list]
[*]Fixed bugs
[*]Added new content
[/list]

[url=https://example.com]Read more[/url]`;

const html = parseSteamBBCode(bbcode);
console.log(html);
```

## Supported BBCode Tags

### Text Formatting
- `[b]bold[/b]` - Bold text
- `[i]italic[/i]` - Italic text
- `[u]underline[/u]` - Underlined text
- `[strike]strikethrough[/strike]` - Strikethrough text
- `[c]centered[/c]` - Centered text

### Headers
- `[h1]heading[/h1]` - H1 heading
- `[h2]heading[/h2]` - H2 heading
- `[h3]heading[/h3]` - H3 heading

### Lists
- `[list][*]item[/list]` - Unordered list
- `[olist][*]item[/olist]` - Ordered list

### Links
- `[url]link[/url]` - Simple link
- `[url=http://example.com]text[/url]` - Link with custom text
- `[dynamiclink href="url"]text[/dynamiclink]` - Steam dynamic links

### Media
- `[img]url[/img]` - Images
- `[video mp4="url" poster="url"]...[/video]` - HTML5 video
- `[previewyoutube="videoId;options"][/previewyoutube]` - YouTube embeds (note: semicolon is inside quotes)

### Code
- `[code]code[/code]` - Inline code
- `[pre]code block[/pre]` - Code blocks

### Other
- `[hr]` - Horizontal rule
- `[p]` - Paragraph break
- `{STEAM_CLAN_IMAGE}/appid/hash.png` - Steam CDN images

## Special Features

### Malformed BBCode Handling
Automatically cleans up:
- Escaped brackets: `\[` → `[`
- Incomplete tags: `[video mp4="url"` (missing closing bracket)
- Orphaned closing tags
- Excess whitespace

### Steam-Specific
- Converts `{STEAM_CLAN_IMAGE}` placeholders to actual CDN URLs
- Handles Steam's custom `[dynamiclink]` tags
- Processes video tags with both webm and mp4 sources
- Handles YouTube preview embeds

## API

### `parseSteamBBCode(bbcode)`

**Parameters:**
- `bbcode` (string) - Steam BBCode text to parse

**Returns:**
- (string) - HTML output

**Example:**
```javascript
const html = parseSteamBBCode('[b]Hello[/b] [i]World[/i]');
// Output: <strong style="...">Hello</strong> <em style="...">World</em>
```

## Example: Fetching Steam Game News

```javascript
const parseSteamBBCode = require('steam-bbcode-parser');

async function getGameNews(appid) {
  const response = await fetch(
    `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appid}&count=10`
  );

  const data = await response.json();
  const newsItems = data.appnews.newsitems;

  return newsItems.map(item => ({
    title: item.title,
    date: new Date(item.date * 1000),
    html: parseSteamBBCode(item.contents)
  }));
}

// Get CS2 news
getGameNews(730).then(news => {
  news.forEach(item => {
    console.log(item.title);
    console.log(item.html);
  });
});
```

## Browser Usage

```html
<script src="https://unpkg.com/steam-bbcode-parser"></script>
<script>
  const html = parseSteamBBCode('[b]Steam[/b] BBCode');
  document.getElementById('output').innerHTML = html;
</script>
```

## Performance

This parser uses a rule-based system with minimal overhead:
- **Fast:** Processes typical game news (5KB) in <1ms
- **Memory efficient:** No AST generation, direct string replacement
- **Scalable:** Handles large update notes (50KB+) with ease

## Edge Cases Handled

- Nested tags
- Malformed/incomplete tags
- Mixed line endings
- Excessive whitespace
- Escaped characters
- Missing closing tags
- Orphaned attributes

## Contributing

Contributions welcome! Please open an issue or PR if you find bugs or want to add features.

## License

MIT

## Credits

Developed for [Steam Update Tracker](https://steamupdatetracker.com) - Track game updates you've missed since you last played.
