// index.html に埋め込まれたドリル30問を検証する
//  1. index.html の問題データが docs/SPEC.md と一字一句一致すること
//  2. 模範解答（フラグなし RegExp の test()）が pos 全件に true、neg 全件に false を返すこと
//  3. 全問にヒントがあること
// 使い方: node tools/verify-drill.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { parseSpec } = require('./spec-problems');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const block = html.match(/\/\*PROBLEMS:BEGIN\*\/([\s\S]*?)\/\*PROBLEMS:END\*\//);
if (!block) { console.error('index.html に問題データが見つかりません'); process.exit(1); }
const hintsSrc = html.match(/const HINTS = (\{[\s\S]*?\n\});/);
const ctx = {};
vm.runInNewContext(block[1] + '\nthis.PROBLEMS = PROBLEMS;' + (hintsSrc ? '\nthis.HINTS = ' + hintsSrc[1] + ';' : ''), ctx);
const problems = ctx.PROBLEMS;
const hints = ctx.HINTS || {};

let failed = 0;
const fail = (msg) => { failed++; console.log('  NG: ' + msg); };

// 1. 仕様書との一致
const spec = parseSpec();
console.log('仕様書との一致チェック');
try {
  assert.strictEqual(problems.length, 30, '問題数が30ではありません');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(problems)), spec);
  console.log('  OK: 30問すべて docs/SPEC.md と一致');
} catch (e) { fail(e.message.split('\n')[0]); }

// 2. 模範解答の検証
console.log('\n模範解答の検証（new RegExp(answer) / フラグなし / test()）');
console.log('| ID | 模範解答 | pos | neg | 結果 |');
console.log('|---|---|---|---|---|');
let total = 0, okCount = 0;
for (const p of problems) {
  const re = new RegExp(p.answer);
  const posOk = p.pos.filter((s) => re.test(s) === true);
  const negOk = p.neg.filter((s) => re.test(s) === false);
  total += p.pos.length + p.neg.length;
  okCount += posOk.length + negOk.length;
  const ok = posOk.length === p.pos.length && negOk.length === p.neg.length;
  console.log(`| ${p.id} | \`${p.answer.replace(/\|/g, '\\|')}\` | ${posOk.length}/${p.pos.length} | ${negOk.length}/${p.neg.length} | ${ok ? 'OK' : 'NG'} |`);
  if (!ok) {
    p.pos.filter((s) => !re.test(s)).forEach((s) => fail(`${p.id}: pos "${s}" にマッチしない`));
    p.neg.filter((s) => re.test(s)).forEach((s) => fail(`${p.id}: neg "${s}" にマッチしてしまう`));
  }
  if (!hints[p.id]) fail(`${p.id}: ヒントがありません`);
}
console.log(`\n判定 ${okCount}/${total} 件が期待どおり`);

// 4. 外部リソースを読み込んでいないこと
if (/<(script|link|img|iframe)[^>]+(src|href)=/i.test(html) || /@import|url\(/i.test(html)) fail('外部リソースの参照があります');

if (failed) { console.log(`\n失敗 ${failed} 件`); process.exit(1); }
console.log('\nすべての検証に合格しました');
