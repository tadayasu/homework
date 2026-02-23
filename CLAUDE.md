# 塾の宿題管理システム 仕様書

## プロジェクト概要

小学生（高学年：4〜6年生）の塾の宿題を管理するWebアプリ。
教科ごとに毎回異なる宿題が出されるため、子供が宿題の完了状況を把握しやすくする。

- **利用者**: 子供1人 ＋ 親（宿題の登録担当）
- **主な利用デバイス**: スマートフォン・タブレット
- **バックエンドDB**: Google Spreadsheet（Google Sheets API v4）
- **デプロイ**: Vercel（無料枠）

---

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | Next.js 14（App Router）+ TypeScript |
| スタイリング | Tailwind CSS |
| 認証 | NextAuth.js v5 + Google Provider |
| バックエンドDB | Google Spreadsheet（googleapis ライブラリ経由）|
| デプロイ | Vercel（無料枠） |

---

## 機能要件

### 子供の操作
- [ ] 宿題一覧を見る（未完了・完了でフィルタ可能）
- [ ] 期限が近い・期限切れの宿題をわかりやすく強調表示
- [ ] 宿題をタップして「完了」にする（もう一度タップで取り消し可能）
- [ ] 進捗状況を確認する（全体の何割が完了か）
- [ ] 過去の宿題履歴を見る

### 親の操作
- [ ] 宿題を新規登録する
- [ ] 登録済みの宿題を編集・削除する
- [ ] 子供と同じ画面も閲覧できる

### 共通
- [ ] Google アカウントでログイン（特定のGoogleアカウントのみ許可）
- [ ] スマートフォン・タブレット対応のレスポンシブUI

---

## 宿題データの項目

| フィールド | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | string | ○ | 一意のID（UUID） |
| subject | string | ○ | 教科（国語 / 算数 / 理科 / 社会 / 英語） |
| content | string | ○ | 宿題の内容（例：テキストp.10〜12） |
| page_number | string | △ | ページ・問題番号 |
| due_date | string | ○ | 提出期限（YYYY-MM-DD） |
| memo | string | △ | メモ・備考 |
| status | string | ○ | `pending` / `done` |
| created_at | string | ○ | 登録日時（ISO 8601） |
| completed_at | string | △ | 完了日時（ISO 8601） |

---

## 教科一覧

- 国語
- 算数
- 理科
- 社会
- 英語

※ 将来的に増減できるよう定数ファイルで管理する（ハードコーディング禁止）

---

## Google Spreadsheet 設計

### スプレッドシート構成

**シート名: `homeworks`**

| A: id | B: subject | C: content | D: page_number | E: due_date | F: memo | G: status | H: created_at | I: completed_at |
|------|-----------|-----------|---------------|------------|--------|----------|--------------|----------------|
| uuid | 算数 | テキストp.10〜12 | p.10-12 | 2026-03-01 | 丸つけも必要 | done | 2026-02-20T10:00:00Z | 2026-02-21T15:30:00Z |

- 1行目はヘッダー行
- データは2行目以降に追加
- APIは `googleapis` の `google.auth.GoogleAuth` + `sheets` を使用

### 環境変数（`.env.local`）

```
# Google OAuth（認証）
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Sheets API（サービスアカウント）
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SPREADSHEET_ID=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# アクセス許可するGoogleアカウントのメールアドレス（カンマ区切り）
ALLOWED_EMAILS=parent@example.com,child@example.com
```

---

## 画面設計

### 1. ホーム画面（`/`）
- 未完了の宿題一覧を教科別・期限順に表示
- 各宿題カードに「完了ボタン」（タップで完了/取消）
- 期限切れ：赤くハイライト
- 期限まで2日以内：オレンジでハイライト
- 上部に進捗バー（完了数 / 全体数）
- 「履歴を見る」ボタン → 履歴画面へ
- 親のみ「宿題を追加」ボタンを表示

### 2. 宿題追加・編集画面（`/homework/new`, `/homework/[id]/edit`）
- 親のみアクセス可能（子供がアクセスしたら403）
- 教科選択（セレクトボックス）
- 宿題内容（テキストエリア）
- ページ・問題番号（テキスト入力）
- 提出期限（日付ピッカー）
- メモ・備考（テキストエリア）
- 「登録する」「キャンセル」ボタン

### 3. 履歴画面（`/history`）
- 完了済みの宿題一覧（完了日時の降順）
- 教科・期間でフィルタ可能

### 4. ログイン画面（`/login`）
- 「Googleでログイン」ボタン
- 許可されたGoogleアカウント以外はログイン後にエラーメッセージ表示

---

## アクセス制御

| 機能 | 子供 | 親 |
|------|------|-----|
| 宿題一覧・詳細閲覧 | ○ | ○ |
| 宿題を完了にする | ○ | ○ |
| 宿題を登録・編集・削除 | ✕ | ○ |
| 履歴閲覧 | ○ | ○ |

- 親・子供の区別は `ALLOWED_EMAILS` に加えて `PARENT_EMAILS` 環境変数で管理する
- 子供が管理機能URLに直接アクセスした場合は403を返す

---

## ディレクトリ構成

```
homework/
├── CLAUDE.md
├── .env.local               # 環境変数（gitignore）
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # ホーム（宿題一覧）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── homework/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       └── homeworks/
│   │           ├── route.ts           # GET（一覧）/ POST（新規作成）
│   │           └── [id]/
│   │               └── route.ts       # PUT（更新）/ DELETE（削除）
│   ├── components/
│   │   ├── HomeworkCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SubjectBadge.tsx
│   │   └── HomeworkForm.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth設定
│   │   ├── sheets.ts          # Google Sheets APIラッパー
│   │   └── constants.ts       # 教科一覧などの定数
│   └── types/
│       └── homework.ts        # 型定義
```

---

## 実装方針・コーディング規約

### 基本方針
- TypeScript を使用し、型安全を徹底する
- `any` 型の使用は禁止。不明な場合は `unknown` を使いガード関数で型を絞る
- コンポーネントは小さく保ち、1ファイル1責務を原則とする
- APIルートはServer Componentsから呼ばず、APIエンドポイントを通じてデータを取得する

### Google Sheets API
- スプレッドシートへのアクセスはサービスアカウントで行う（ユーザーの認証とは別）
- `src/lib/sheets.ts` に全てのSpreadsheet操作を集約する
- レート制限に注意（無料枠：100リクエスト/100秒/プロジェクト）
- IDはUUIDv4で生成し、Spreadsheet側でのオートインクリメントに依存しない

### 認証
- NextAuth.js を使用したGoogle OAuth認証
- `ALLOWED_EMAILS` 環境変数で許可メールを管理（コードに直書き禁止）
- セッションにはユーザーのメールアドレスと役割（parent / child）を含める

### エラーハンドリング
- APIルートは適切なHTTPステータスコードを返す
- クライアント側はエラー時にユーザーフレンドリーなメッセージを表示する
- Google Sheets APIエラーはログに記録し、フォールバック処理を行う

### テスト方針
- ユニットテスト: `src/lib/` 以下のユーティリティ関数（Jest）
- E2Eテスト: 主要フロー（Playwright）- 最低限でよい
- テストは必ず実際の機能を検証すること（`expect(true).toBe(true)` 禁止）
- Google Sheets API はモックを使用してテストする

---

## セットアップ手順

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 初期設定手順
1. Google Cloud Console でプロジェクト作成
2. Google Sheets API を有効化
3. OAuthクライアントIDを作成（Webアプリケーション）
4. サービスアカウントを作成し、JSONキーをダウンロード
5. Google Spreadsheetを作成し、サービスアカウントのメールを「編集者」として共有
6. スプレッドシートの1行目にヘッダーを手動で設定
7. `.env.local` に各種環境変数を設定
8. Vercel にデプロイし、環境変数を設定

---

## 非機能要件

- **パフォーマンス**: ホーム画面は2秒以内に表示される
- **モバイル対応**: iPhone SE（375px）〜 iPad（768px）を基準にデザイン
- **コスト**: 無料枠内に収める（Vercel無料枠 + Google Sheets API 無料枠）
- **セキュリティ**: 許可されたGoogleアカウント以外はアクセス不可
- **言語**: UI はすべて日本語
