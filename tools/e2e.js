// ブラウザでの動作確認（Playwright）: node tools/e2e.js
'use strict';
const path = require('path');
const { chromium, devices } = require('playwright');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
const shotDir = process.argv[2];
let failed = 0;
const check = (cond, msg) => { console.log((cond ? '  OK: ' : '  NG: ') + msg); if (!cond) failed++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (!r.url().startsWith('file://')) errors.push('外部リクエスト: ' + r.url()); });
  await page.goto(url);

  console.log('練習場');
  await page.fill('#pg-pattern', '〒(\\d{3})-(\\d{4})');
  check(await page.locator('#pg-output mark').count() === 1, 'プリセット1で郵便番号1件をハイライト');
  check((await page.textContent('#pg-count')).includes('1件'), '件数表示');
  check((await page.textContent('#pg-matches')).includes('グループ2'), 'キャプチャグループ一覧');
  await page.fill('#pg-pattern', '(');
  check(await page.isVisible('#pg-error'), '不正な正規表現でエラー表示（落ちない）');
  await page.fill('#pg-pattern', '^\\d');
  await page.click('#pg-presets button:nth-child(2)');
  const noM = await page.locator('#pg-output mark').count();
  await page.check('#flag-m');
  const withM = await page.locator('#pg-output mark').count();
  check(noM === 0 && withM === 0, '^\\d は日付プリセットの行頭（漢字）にマッチしない');
  await page.fill('#pg-pattern', 'png');
  await page.fill('#pg-text', 'a.PNG b.png');
  const noI = await page.locator('#pg-output mark').count();
  await page.check('#flag-i');
  check(noI === 1 && await page.locator('#pg-output mark').count() === 2, 'i フラグで大文字小文字を無視');
  await page.uncheck('#flag-g');
  check(await page.locator('#pg-output mark').count() === 1, 'g なしで最初の1件のみ');
  await page.check('#flag-g');
  await page.fill('#pg-pattern', 'x*');
  check((await page.textContent('#pg-count')).includes('件'), '空文字マッチでも固まらない');
  await page.fill('#pg-text', '<b>&amp;</b>');
  await page.fill('#pg-pattern', '<b>');
  check(await page.locator('#pg-output b').count() === 0, '入力文字列は HTML として解釈されない');

  console.log('ドリル');
  await page.click('nav button[data-mode="drill"]');
  await page.fill('#dr-input', 'ねこ');
  await page.click('#dr-check');
  check(await page.locator('#dr-pos li.fail').count() === 3, '不正解時に失敗した文字列を表示');
  check(await page.evaluate(() => { const r = document.getElementById('dr-result'); return r.firstElementChild && r.firstElementChild.matches('svg.fb-batsu') && r.querySelectorAll('.fb-mark').length === 1; }), '不正解時にバツをテキストより上に1つ表示');
  await page.fill('#dr-input', '[');
  await page.click('#dr-check');
  check(await page.isVisible('#dr-error'), '不正な正規表現でエラー表示');
  await page.click('#dr-hint');
  check((await page.textContent('#dr-hintbox')).includes('考え方のヒント') && !(await page.textContent('#dr-hintbox')).includes('模範解答：'), 'ヒント1段階目');
  await page.click('#dr-hint');
  check((await page.textContent('#dr-hintbox')).includes('解説'), 'ヒント2段階目で模範解答と解説');

  const problems = await page.evaluate(() => PROBLEMS);
  for (let i = 0; i < problems.length; i++) {
    await page.fill('#dr-input', problems[i].answer);
    await page.click('#dr-check');
    const cls = await page.getAttribute('#dr-result', 'class');
    if (!cls.includes('ok')) check(false, problems[i].id + ' が UI 上で正解にならない');
    if (i === 0) check(await page.evaluate(() => { const r = document.getElementById('dr-result'); return r.firstElementChild && r.firstElementChild.matches('svg.fb-hanamaru') && r.querySelectorAll('.fb-mark').length === 1 && r.textContent.includes('正解！'); }), '正解時に花丸をテキストより上に1つ表示');
    if (i === problems.length - 1) check(await page.evaluate(() => { const r = document.getElementById('dr-result'); return r.querySelector('svg.fb-hanamaru') && r.textContent.includes('最後の問題'); }), '最終問題でも花丸と「最後の問題」表示');
    if (i < problems.length - 1) await page.click('#dr-next');
  }
  check((await page.textContent('#score')) === '正解数 30/30', '模範解答を UI で入力して 30/30');
  await page.click('#dr-prev');
  check((await page.textContent('#dr-title')).startsWith('A9'), '前の問題に戻れる');
  const ls = await page.evaluate(() => Object.keys(localStorage));
  check(ls.every((k) => k.startsWith('regex:')), 'localStorage キーがすべて regex: 接頭辞: ' + ls.join(', '));
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('regex:attempts')).B1) === 2, '挑戦回数を保存（B1 = 2回）');
  await page.reload();
  check((await page.textContent('#score')) === '正解数 30/30', 'リロード後も進捗が残る');
  check(errors.length === 0, 'JS エラー・外部リクエストなし ' + errors.join(' / '));
  await page.close();

  console.log('スマホ表示（iPhone 13 / 幅320px）');
  for (const [name, opt] of [['iphone', devices['iPhone 13']], ['w320', { viewport: { width: 320, height: 640 } }]]) {
    const ctx = await browser.newContext(opt);
    const p = await ctx.newPage();
    await p.goto(url);
    for (const mode of ['play', 'drill', 'cheat']) {
      await p.click(`nav button[data-mode="${mode}"]`);
      if (mode === 'drill') { await p.evaluate(() => goTo(29)); await p.fill('#dr-input', 'abc'); await p.click('#dr-check'); await p.click('#dr-hint'); await p.click('#dr-hint'); }
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(over <= 0, `${name} ${mode}: 横スクロールなし (overflow=${over}px)`);
      if (shotDir && name === 'iphone') await p.screenshot({ path: path.join(shotDir, `${mode}.png`), fullPage: true });
    }
    await ctx.close();
  }
  await browser.close();
  if (failed) { console.log(`\n失敗 ${failed} 件`); process.exit(1); }
  console.log('\nE2E すべて合格');
})();
