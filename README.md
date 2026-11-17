# IdeaPilot

新規事業アイデアから、意思決定に使える 6 つの成果物（Executive Summary / Business Model / Decision Brief / 事業提案書 / MVP 仕様書 / 検証計画）を Gemini で一括生成する Web アプリです。

## Getting started

Requires Node.js 22.18+ (TypeScript is executed natively via type stripping).

```bash
npm install
cp .env.example .env   # GEMINI_API_KEY を設定
npm run dev            # http://localhost:3000
```

API キーがなくても「サンプル結果を見る」で全画面を確認できます。

## Scripts

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Express + Vite (middleware mode) を watch 起動      |
| `npm run build`     | クライアントを `dist/` にビルド                     |
| `npm start`         | 本番モードで起動（`dist/` を配信）                  |
| `npm run typecheck` | `tsc --noEmit`                                      |
| `npm test`          | `node --test` でユニットテストを実行                |

## Project structure

```
shared/            client/server 共通（zod スキーマ・型・入力検証・SSE イベント型）
server/
  ai/              Gemini クライアント、プロンプト、6 ステップの分析パイプライン
  http/            API ルート (/api/health, /api/clarify, /api/analyze) と SSE ヘルパー
  app.ts           Express アプリ（dev: Vite middleware / prod: static）
src/
  components/      ui/（Button・Badge 等のプリミティブ）, layout/（TopNav・履歴）
  features/        idea-input / analysis / report / export の各画面
  hooks/           useReports（localStorage 永続化）
  lib/             API クライアント、SSE パーサー、Markdown 変換、storage
```

- ドメインの型は `shared/schema.ts` の zod スキーマから推論しています。同じスキーマから Gemini の `responseJsonSchema` を生成し、レスポンスも同スキーマで検証します。
- `shared/` は `#shared/*`（package.json `imports`）で参照します。Node・Vite・TypeScript のいずれでも追加設定なしで解決されます。
- 分析は `POST /api/analyze` が Server-Sent Events で進捗を返します。クライアント切断時は Gemini 呼び出しを中断します。
