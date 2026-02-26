# designpattern

Gemini 3.1 Pro と GLM-5 の2つのAIを使って、プロンプトからHTMLデザインを複数パターン生成するCLIツール。

1回のコマンドで両方のAIに同時にリクエストし、結果をシャッフルして出力します。
どのデザインがどのAIによるものかは分からないようになっているため、純粋にデザインの良し悪しで比較・選定できます。

## インストール

```bash
npm install -g @aimasaou/designpattern
```

開発中はリポジトリのルートで:

```bash
npm link
```

## セットアップ

Gemini と Z.AI の2つのAPIキーが必要です。

```bash
designpattern login          # 両方のAPIキーをまとめて設定
designpattern login gemini   # Gemini のみ設定
designpattern login zai      # Z.AI のみ設定
```

環境変数 `GEMINI_API_KEY` / `ZAI_API_KEY` が設定されている場合はそちらが優先されます。

## 使い方

### HTMLデザインを生成する

```bash
designpattern gen "モダンなランディングページ"
```

デフォルトで4件（Gemini 3.1 Pro x2、GLM-5 x2）を並列生成し、シャッフルして保存します。

件数を変更する場合:

```bash
designpattern gen "ポートフォリオサイト" -n 6    # Gemini x3, GLM-5 x3
designpattern gen "お問い合わせフォーム" -n 2    # Gemini x1, GLM-5 x1
```

### 生成履歴を確認する

```bash
designpattern list
designpattern list -n 10   # 表示件数を指定
```

### 過去の生成結果を表示する

```bash
designpattern show <id>
```

ブラウザで確認する場合:

```bash
open .designpattern/1.html
```

### 同じプロンプトで再生成する

```bash
designpattern regen <id>
designpattern regen <id> -n 2
```

## データの保存先

| 種類 | パス |
|------|------|
| 生成HTML | `.designpattern/{id}.html` (カレントディレクトリ) |
| 履歴メタデータ | `.designpattern/history.json` |
| APIキー | `~/.config/designpattern/credentials.json` |

## License

MIT
