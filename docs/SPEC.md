# 正規表現 練習サイト 基本設計 v1

## 目的
正規表現を「読める・書ける」ようになるための練習サイト。自由に試せる練習場と、自動判定のドリルを用意する。対象は初学者〜中級者。日本語UI。

## 構成（3モード）
1. **練習場（サンドボックス）**
   - 正規表現の入力欄、フラグのチェックボックス（g / i / m）、テスト文字列のテキストエリア
   - 入力のたびにリアルタイムでマッチ部分をハイライト表示し、マッチ件数と各マッチ（全体＋キャプチャグループ）の一覧を表示
   - 正規表現が間違っている場合はエラー内容を表示（落とさない）
   - サンプルテキストを数種類プリセット（メール・日付・電話番号などを含む文章）
2. **ドリル（書く形式・30問）**
   - 課題文と「マッチさせたい文字列」「マッチさせてはいけない文字列」の一覧を提示し、学習者が正規表現を入力
   - 判定：JavaScript の RegExp（フラグなし）で test() する。マッチさせたい全件が true、マッチさせてはいけない全件が false なら正解
   - 全体一致が必要な問題は課題文に明記し、模範解答は ^〜$ で囲む
   - 1件ずつ「どの文字列で失敗したか」を表示する（学習者が直せるように）
   - ヒントボタン（考え方のヒント→模範解答の順に段階表示）、模範解答には解説を付ける
   - 正解したら記録し、次の問題へ進める。前の問題にも戻れる
3. **チートシート**
   - 記法の一覧（文字クラス、量指定子、アンカー、グループ・選択、先読み・後読み、エスケープ等）を「記法／意味／例」の表で表示

## 進捗保存
- localStorage（接頭辞 `regex:`）にドリルの正解済み問題IDと挑戦回数を保存
- 画面上部に「正解数 ○/30」を表示。XPやレベルは v1 では入れない（必要なら後付け）

## 技術条件
- 単一の index.html（CSS・JS・問題データすべて内包）で完結させる。外部CDN・外部フォント・外部ライブラリは使わない
- スマホでも使えるレイアウト（タップ領域は大きめ、横スクロールなし）
- 問題データは JS の配列として埋め込む（下記の30問をそのまま使う。文字列の改変禁止）
- GitHub Pages で公開する前提（相対パスのみ）

## ドリル問題データ（30問）
判定は部分一致（test）が基本。instruction に「全体が」とある問題だけ全体一致。

### 基礎（B）
1. B1 リテラル: instruction「『猫』という文字を含む文字列にマッチさせてください」 pos: 猫が好き／野良猫です／猫 neg: 犬が好き／ねこ／ネコ answer: 猫 explanation「文字はそのまま書けば、その文字にマッチします」
2. B2 数字: instruction「数字が1文字以上続く部分にマッチさせてください」 pos: abc123／注文番号9876／a1 neg: abc／あいうえお／--- answer: \d+ explanation「\d は数字1文字、+ は直前の要素の1回以上の繰り返しです」
3. B3 行頭: instruction「行の先頭が『第』で始まる文字列にマッチさせてください」 pos: 第3章 テキスト／第1回 neg: 次は第2章／あ第 answer: ^第 explanation「^ は行の先頭を表します」
4. B4 行末: instruction「『円』で終わる文字列にマッチさせてください」 pos: 合計は500円／100円 neg: 円安ドル高／500ドル answer: 円$ explanation「$ は行の末尾を表します」
5. B5 ドット: instruction「a と c の間に任意の1文字が入る部分（a○c）にマッチさせてください」 pos: abc／aXc／a5c neg: ac／abbc／xyz answer: a.c explanation「. は改行以外の任意の1文字です」
6. B6 文字クラス: instruction「a、b、c のどれか1文字にマッチさせてください」 pos: cat／cab／box neg: ABC／xyz／あいう answer: [abc] explanation「[ ] の中に文字を並べると、その中のどれか1文字にマッチします」
7. B7 回数指定: instruction「数字がちょうど3文字続く部分にマッチさせてください」 pos: a123b／123／x999y neg: 12／a1b2／なし answer: \d{3} explanation「{3} は直前の要素がちょうど3回という意味です」
8. B8 プラス: instruction「g の後に o が1回以上続く部分にマッチさせてください」 pos: go／goo／gooo neg: g／ga／ooo answer: go+ explanation「+ は1回以上。0回でもよい場合は * を使います」
9. B9 疑問符: instruction「color と colour の両方にマッチさせてください」 pos: color／colour neg: colr／colouur answer: colou?r explanation「? は直前の要素が0回か1回（あってもなくてもよい）という意味です」
10. B10 単語文字: instruction「英数字とアンダースコアの並びにマッチさせてください」 pos: user_01／abc neg: あいうえお／！！！ answer: \w+ explanation「\w は英数字とアンダースコア。日本語の文字は含まれません」

### 中級（M）
1. M1 選択: instruction「『犬』または『猫』を含む文字列にマッチさせてください」 pos: 犬が好き／猫が好き／犬も猫も neg: 鳥が好き／うさぎ answer: 犬|猫 explanation「| は『または』です」
2. M2 郵便番号: instruction「郵便番号の形式（数字3桁-数字4桁）にマッチさせてください」 pos: 123-4567／〒100-0001 neg: 12-34567／1234-567／1234567 answer: \d{3}-\d{4} explanation「ハイフンはそのまま書けます。桁数は { } で指定します」
3. M3 日付形式: instruction「YYYY/MM/DD の形式（4桁/2桁/2桁）にマッチさせてください」 pos: 2026/11/08／1999/01/31 neg: 2026-11-08／26/11/08／2026/1/8 answer: \d{4}/\d{2}/\d{2} explanation「/ は正規表現ではそのまま書けます」
4. M4 拡張子: instruction「.png か .jpg で終わる文字列にマッチさせてください」 pos: photo.png／a.jpg／x.y.png neg: photo.gif／a.png.bak／photo.PNG answer: \.(png|jpg)$ explanation「. は『任意の1文字』という特別な意味があるので、文字としてのドットは \. と書きます。(png|jpg) はグループ化した選択です」
5. M5 否定クラス: instruction「数字以外で始まる文字列にマッチさせてください」 pos: a123／あ1 neg: 1abc／9 answer: ^\D explanation「\D は数字以外の1文字。大文字にすると否定の意味になります（\d↔\D、\w↔\W、\s↔\S）。[^0-9] でも同じです」
6. M6 単語境界: instruction「独立した単語としての cat にマッチさせてください」 pos: my cat is／cat! neg: catalog／scat answer: \bcat\b explanation「\b は単語の境界（単語文字とそれ以外の境目）です」
7. M7 グループの繰り返し: instruction「文字列全体が ab の繰り返しだけでできているものにマッチさせてください」 pos: ab／abab／ababab neg: aba／aabb／ba answer: ^(ab)+$ explanation「( ) でグループ化すると、+ などの量指定子をまとめて適用できます」
8. M8 メール簡易: instruction「メールアドレスらしい形式（○○@○○.○○）にマッチさせてください」 pos: tanaka@example.co.jp／a.b@c-d.com neg: @example.com／tanaka@example／tanaka@@x.com answer: [^\s@]+@[^\s@]+\.[^\s@]+ explanation「[^\s@] は『空白と @ 以外の文字』。[^ ] は否定の文字クラスです」
9. M9 時刻形式: instruction「HH:MM の形式（2桁:2桁）にマッチさせてください」 pos: 09:30／23:59 neg: 9:30／12-30／ab:cd answer: \d{2}:\d{2} explanation「: はそのまま書けます」
10. M10 カラーコード: instruction「# の後に16進数6桁が続くカラーコードにマッチさせてください」 pos: #FF5733／#00ff00 neg: #FF573／#GGGGGG／FF5733 answer: #[0-9A-Fa-f]{6} explanation「文字クラスの中では範囲（0-9、A-F、a-f）を並べて書けます」

### 上級（A）
1. A1 先読み: instruction「直後に『円』が続く数字の並びにマッチさせてください」 pos: 500円／あと100円です neg: 500ドル／円500 answer: \d+(?=円) explanation「(?=…) は肯定先読み。『後に…が続く位置』まで含めて条件にできます（円そのものはマッチに含まれません）」
2. A2 後読み: instruction「¥ の直後にある金額（数字とカンマの並び）にマッチさせてください」 pos: ¥1,000／価格は¥500 neg: 1,000円／$500 answer: (?<=¥)[\d,]+ explanation「(?<=…) は肯定後読み。『前に…がある位置』を条件にできます」
3. A3 後方参照: instruction「同じ単語が空白をはさんで2回繰り返される部分にマッチさせてください」 pos: the the／go go neg: the a／go went answer: \b(\w+) \1\b explanation「\1 は1番目のグループでマッチした文字列そのものを指します（後方参照）」
4. A4 同じ数字3つ: instruction「同じ数字が3つ続く部分にマッチさせてください」 pos: 111／あ222い neg: 112／121／12 answer: (\d)\1\1 explanation「後方参照を使うと『同じ内容の繰り返し』を表せます」
5. A5 パスワード条件: instruction「文字列全体が、英字と数字の両方を含み、4文字以上であるものにマッチさせてください」 pos: abc1／a1b2c3 neg: abcd／1234／a1 answer: ^(?=.*[A-Za-z])(?=.*\d).{4,}$ explanation「^ の直後に先読みを置くと『全体に対する条件』として使えます」
6. A6 携帯番号: instruction「文字列全体が 0 で始まる携帯電話番号の形式（0XX-XXXX-XXXX）にマッチさせてください」 pos: 090-1234-5678／080-0000-1111 neg: 09012345678／90-1234-5678／090-1234-567 answer: ^0\d{2}-\d{4}-\d{4}$ explanation「全体一致は ^ と $ で囲みます」
7. A7 月の検証: instruction「YYYY/MM/DD の形式で、月が01〜12のものにマッチさせてください」 pos: 2026/11/08／2026/01/31 neg: 2026/13/01／2026/00/10 answer: \d{4}/(0[1-9]|1[0-2])/\d{2} explanation「月は 0[1-9]（01〜09）か 1[0-2]（10〜12）のどちらか、と選択で表せます」
8. A8 引用部分: instruction「ダブルクオートで囲まれた部分にマッチさせてください」 pos: 彼は"行く"と言った／say "hi" neg: 彼は行くと言った／'hi' answer: "[^"]*" explanation「"[^"]*" は『" の後に " 以外が続き、" で閉じる』という形です」
9. A9 カンマ区切り: instruction「文字列全体が3桁ごとのカンマ区切り数値であるものにマッチさせてください」 pos: 1,000,000／999／12,345 neg: 1,00／1000,000／,123 answer: ^\d{1,3}(,\d{3})*$ explanation「先頭は1〜3桁、その後に『,＋3桁』が0回以上続く、と分解します」
10. A10 URL: instruction「http:// または https:// で始まるURLにマッチさせてください」 pos: https://example.com/path／http://a.jp neg: ftp://example.com／example.com／https:// answer: ^https?://[^\s/]+\.[^\s/]+ explanation「s? で s はあってもなくてもよい、と表せます」

## 作業の進め方（実装担当への指示）
- この仕様どおりに index.html を作り、プルリクエストを作成するところまで（マージはしない）
- 30問すべてについて、模範解答が pos 全件にマッチし neg 全件にマッチしないことを、自動テストか手作業で確認してから PR にすること
- 既存の学習サイト（SKILL QUEST 等）と運用を揃えるため、ファイル名は index.html、リポジトリ直下に置く
