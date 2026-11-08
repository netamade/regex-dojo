// docs/SPEC.md の「ドリル問題データ（30問）」を解析して問題配列を返す
'use strict';
const fs = require('fs');
const path = require('path');

function parseSpec(specPath) {
  const text = fs.readFileSync(specPath || path.join(__dirname, '..', 'docs', 'SPEC.md'), 'utf8');
  const levels = { B: '基礎', M: '中級', A: '上級' };
  const re = /^\d+\. ([BMA]\d+) (.+?): instruction「(.+?)」 pos: (.+?) neg: (.+?) answer: (.+?) explanation「(.+)」$/;
  const out = [];
  for (const line of text.split('\n')) {
    const m = line.match(re);
    if (!m) continue;
    out.push({
      id: m[1], level: levels[m[1][0]], title: m[2], instruction: m[3],
      pos: m[4].split('／'), neg: m[5].split('／'), answer: m[6], explanation: m[7],
    });
  }
  return out;
}
module.exports = { parseSpec };
if (require.main === module) console.log(JSON.stringify(parseSpec(), null, 2));
