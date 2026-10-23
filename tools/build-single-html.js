// Bygger en fristående Turnering.html med CSS och JS inbakade.
// Filen kan öppnas direkt i valfri webbläsare, även utan internet.
// Användning: node tools/build-single-html.js [webbmapp] [utfil]
const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || path.join(__dirname, '..', 'web');
const out = process.argv[3] || 'Turnering.html';
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

// </script> i koden skulle avsluta script-taggen i förtid
const safeJs = (js) => js.replace(/<\/script/gi, '<\\/script');
const iconUri = 'data:image/svg+xml;base64,' + Buffer.from(read('icons/icon.svg')).toString('base64');

let html = read('index.html');
const replaceOnce = (needle, replacement) => {
  if (!html.includes(needle)) throw new Error('Hittade inte: ' + needle);
  html = html.replace(needle, () => replacement);
};

// Typsnitten bakas in som data-URL:er, och preload-länkarna till filerna tas bort
const fontUri = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(dir, 'fonts', f)).toString('base64');
const css = read('styles.css').replace(/url\(fonts\/([\w-]+\.woff2)\)/g, (m, f) => `url(${fontUri(f)})`);
html = html.replace(/ *<link rel="preload" href="fonts\/[^"]+"[^>]*>\n/g, '');
replaceOnce('<link rel="stylesheet" href="styles.css">', `<style>\n${css}\n</style>`);
replaceOnce('<script src="logic.js"></script>', `<script>\n${safeJs(read('logic.js'))}\n</script>`);
replaceOnce('<script src="stages.js"></script>', `<script>\n${safeJs(read('stages.js'))}\n</script>`);
replaceOnce('<script src="stats.js"></script>', `<script>\n${safeJs(read('stats.js'))}\n</script>`);
replaceOnce('<script src="vendor/anthropic-sdk.js"></script>', `<script>\n${safeJs(read('vendor/anthropic-sdk.js'))}\n</script>`);
replaceOnce('<script src="app.js"></script>', `<script>\n${safeJs(read('app.js'))}\n</script>`);
replaceOnce('<link rel="icon" href="icons/icon.svg" type="image/svg+xml">', `<link rel="icon" href="${iconUri}" type="image/svg+xml">`);
replaceOnce('<link rel="manifest" href="manifest.webmanifest">\n', '');
replaceOnce('<link rel="apple-touch-icon" href="icons/icon-192.png">\n', '');

fs.writeFileSync(out, html);
console.log(`Skrev ${out} (${Math.round(html.length / 1024)} kB)`);
