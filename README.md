# IdeaPilot

新規事業アイデアから、意思決定に使える 6 つの成果物（Executive Summary / Business Model / Decision Brief / 事業提案書 / MVP 仕様書 / 検証計画）を Gemini で一括生成する Web アプリです。

## Getting started

Requires Node.js 22.18+ (TypeScript is executed natively via type stripping).

```bash
npm install
cp .env.example .env   # GEMINI_API_KEY を設定
npm run dev            # http://localhost:3000
```

API キーがなければ AI はモック（`AI_BACKEND=mock`）で動きます。分析は進捗表示のあとサンプルレポート（「サンプルデータ」表示付き）を返すので、全画面の流れを Gemini なしで確認できます。

## Scripts

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Express + Vite (middleware mode) を watch 起動      |
| `npm run build`     | クライアントを `dist/` にビルド                     |
| `npm run build:vercel` | Vercel 用の `.vercel/output` を生成（下記）      |
| `npm start`         | 本番モードで起動（`dist/` を配信）                  |
| `npm run typecheck` | `tsc --noEmit`                                      |
| `npm test`          | `node --test` でユニットテストを実行                |

## Project structure

```
shared/            client/server 共通（zod スキーマ・型・入力検証・SSE イベント型）
server/
  ai/              Gemini クライアント、プロンプト、6 ステップの分析パイプライン
  http/            API ルート (/api/health, /api/clarify, /api/analyze) と SSE ヘルパー
  ai/mock.ts       AI モック（AI_BACKEND=mock）
  app.ts           Express アプリ（dev: Vite middleware / prod: static）
  vercel.ts        Vercel Function のエントリ（API のみ）
scripts/
  build-vercel.ts  Build Output API v3 の出力を生成
src/
  components/      ui/（Button・Badge 等のプリミティブ）, layout/（TopNav・履歴）
  features/        idea-input / analysis / report / export の各画面
  hooks/           useReports（localStorage 永続化）
  lib/             API クライアント、SSE パーサー、Markdown 変換、storage
```

- ドメインの型は `shared/schema.ts` の zod スキーマから推論しています。同じスキーマから Gemini の `responseJsonSchema` を生成し、レスポンスも同スキーマで検証します。
- `shared/` は `#shared/*`（package.json `imports`）で参照します。Node・Vite・TypeScript のいずれでも追加設定なしで解決されます。
- 分析は `POST /api/analyze` が Server-Sent Events で進捗を返します。クライアント切断時は Gemini 呼び出しを中断します。

## Deploy (Vercel)

`vercel.json` のビルドコマンド `npm run build:vercel` が [Build Output API v3](https://vercel.com/docs/build-output-api/v3) の `.vercel/output` を生成し、Vercel はそれをそのまま使います。

| パス | 配信 |
| --- | --- |
| `/api/*` | `server/vercel.ts` を esbuild で 1 ファイルに束ねた Node.js 22 Function（`maxDuration` 300 秒、レスポンスストリーミング有効） |
| それ以外 | `dist/` の静的ファイル（CDN）、該当なしは `index.html`（SPA） |

### 初回セットアップ

1. Vercel で GitHub リポジトリを Import する（Framework Preset・Build/Output の設定は `vercel.json` が優先されるので変更不要）。
2. 環境変数は不要。`GEMINI_API_KEY` を入れなければ AI はモックで動く。
3. デプロイ後、`/api/health` が `{"ok":true,"aiBackend":"mock",...}` を返すことを確認する。

### 本物の Gemini に切り替えるとき

Environment Variables に `GEMINI_API_KEY`（必要なら `AI_BACKEND=gemini`）を設定して再デプロイする。認証がないため URL を知っていれば誰でも API を呼べる点に注意（Vercel の Deployment Protection やレート制限を検討）。

ローカルで Vercel と同じ出力を確認するには `npm run build:vercel` を実行する（`vercel build` は不要）。
