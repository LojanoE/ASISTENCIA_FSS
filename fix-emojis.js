const fs = require('fs');
let c = fs.readFileSync('script.js', 'utf8');

// Fix Ã + U+201C (left double quote) → Ó
c = c.replace(/\u00C3\u201C/g, '\u00D3');

// Fix â€" → — (em dash): â (U+00E2) + € (U+20AC) + " or " (U+201C or U+201D)
c = c.replace(/\u00E2\u20AC\u201C/g, '\u2014');
c = c.replace(/\u00E2\u20AC\u201D/g, '\u2014');
c = c.replace(/\u00E2\u20AC\u2013/g, '\u2014');

// Fix two-char mojibake pairs
const pairs = [
    ['\u00C3\u00B3', '\u00F3'],   // Ã³ → ó
    ['\u00C3\u00B1', '\u00F1'],   // Ã± → ñ
    ['\u00C3\u00AD', '\u00ED'],   // Ã­ → í (soft-hyphen)
    ['\u00C3\u00A1', '\u00E1'],   // Ã¡ → á
    ['\u00C3\u00A9', '\u00E9'],   // Ã© → é
    ['\u00C3\u00BA', '\u00FA'],   // Ãº → ú
    ['\u00C2\u00BF', '\u00BF'],   // Â¿ → ¿
    ['\u00C2\u00A1', '\u00A1'],   // Â¡ → ¡
];
for (const [bad, good] of pairs) {
    c = c.split(bad).join(good);
}

// Fix pin emoji 📍 double-encoded: ð (U+00F0) + Ÿ (U+0178) + U+201C + U+008D
c = c.replace(/\u00F0\u0178\u201C\u008D/g, '\u{1F4CD}');

fs.writeFileSync('script.js', c, 'utf8');
console.log('Mojibake fixes applied.');

// Verify key lines
const result = fs.readFileSync('script.js', 'utf8');
const rl = result.split('\n');
const check = [0,33,66,73,84,123,216,296,300,307,339,504,544,590,624,649,681,694,716,729,812,830,904];
for (const i of check) {
    if (i < rl.length) console.log((i+1) + ': ' + rl[i].trim().substring(0, 80));
}