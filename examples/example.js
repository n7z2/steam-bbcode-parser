const parseSteamBBCode = require('../index.js');

// Example Steam BBCode from game news
const exampleBBCode = `[h1]Major Update Released![/h1]

[b]New Features:[/b]
[list]
[*]Fixed critical bugs
[*]Added new game mode
[*]Improved performance
[/list]

[h2]Details[/h2]
Check out the [url=https://steamcommunity.com]full changelog[/url] for more information.

[img]https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg[/img]

[video mp4="https://clan.fastly.steamstatic.com/images/3381077/75e8fef8d0e0846f0dfa4e392ddfef0f0ab559e7.mp4" poster="https://clan.fastly.steamstatic.com/images/3381077/ca2c415dbeb92d7a7e6a01851f59a117553ae8de.png" autoplay="true" controls="false"][/video]

[i]Thank you for playing![/i]`;

console.log('=== Input BBCode ===');
console.log(exampleBBCode);
console.log('\n=== Output HTML ===');

const html = parseSteamBBCode(exampleBBCode);
console.log(html);

// Example with malformed BBCode
const malformedExample = `\\[ MAPS ]
[b]New map added
[url=https://example.com]Link without closing tag
no image https://example.com/image.png`;

console.log('\n=== Malformed BBCode Example ===');
console.log('Input:', malformedExample);
console.log('\nOutput:', parseSteamBBCode(malformedExample));
