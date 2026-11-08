# regex-dojo

正規表現の練習サイト（練習場・ドリル30問・チートシート）。`index.html` 単体で動作します（仕様: `docs/SPEC.md`）。

## 検証

```bash
node tools/verify-drill.js   # 問題データが SPEC.md と一致し、模範解答が全問 pos/neg を満たすか
node tools/e2e.js            # Playwright によるブラウザ動作確認（要 playwright）
```
