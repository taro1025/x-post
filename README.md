# X Auto Operation Tool (XPilot)

AIを活用してXの運用を支援する自動運用ツールです。
Webサイトとして提供しつつ、将来的なiOSアプリ対応も見据えて開発します。
Next.js, Prisma (Postgres), Tailwind CSSを使用し、Vercel等で運用できる構成で作られています。

## 機能

- **ネタのストック**: 投稿アイデアや素材を管理
- **ネタの自動収集**: AI活用を前提にした投稿候補の収集
- **アプリ情報管理**: iOSアプリのターゲット・価値訴求・URLを保存
- **ポストのAI生成**: OpenAI APIでX向け投稿案を3件生成
- **確認後の予約**: 生成案は下書きとして表示し、ユーザーが編集・予約したものだけを投稿キューに登録
- **予約投稿**: 日時を指定して投稿を予約（15分刻み推奨）
- **一覧表示**: 投稿予定（Upcoming）と履歴（History）の確認
- **キャンセル**: 予約済み投稿の削除
- **自動投稿**: Cron機能（API）による自動投稿実行
- **単一アカウント運用**: 初期版では環境変数で設定した1つのXアカウントへ投稿

## 開発方針

- toC向けアプリとして、品質とUXに妥協しない
- WebとiOSアプリの両方を見据え、モバイルで扱いやすい体験を重視する
- YAGNI原則に従い、必要な機能から段階的に実装する

## セットアップ手順

### 1. 必要な環境

- Node.js (v18以上推奨)
- X Developer Account (API Key取得用)

### 2. インストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成（`.env.example`を参考にしてください）。

```bash
cp .env.example .env
```

`.env.local` または `.env` に以下の情報を入力してください。

```ini
DATABASE_URL="postgresql://user:password@host:5432/xpost?sslmode=require"

# X API Keys
X_API_KEY="your_api_key"
X_API_SECRET="your_api_key_secret"
X_ACCESS_TOKEN="your_access_token"
X_ACCESS_SECRET="your_access_token_secret"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-5.5"

# Cron Job用シークレット (任意)
CRON_SECRET="your_cron_secret"
```

Vercelで使う場合、`DATABASE_URL` はNeon、Supabase、Prisma PostgresなどのPostgres接続URLを設定してください。SQLiteはVercelの本番永続DBとして使いません。

### 4. データベースのセットアップ

```bash
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 基本的な使い方

1. **アプリ情報**に、広めたいiOSアプリの名前・ターゲット・価値訴求・URLを保存します。
2. **AI下書き**で投稿テーマを任意入力し、投稿案を生成します。
3. 使いたい案の「本文に入れる」を押し、投稿文を必要に応じて編集します。
4. 投稿日時を指定して予約します。

AI生成案は自動では予約・投稿されません。誤投稿を防ぐため、必ずユーザーの確認と予約操作を挟みます。

## X Developer Portal の設定

このアプリは、自分のXアカウントとして投稿するために OAuth 1.0a User Context の `API Key and Secret` と `Access Token and Secret` を使います。`Bearer Token` は公開データの読み取り向けなので、投稿には使いません。

1. X Developer Portalで対象Appを開き、`Settings` の `User authentication settings` を開きます。
2. App permissionsを `Read and write` に変更します。投稿だけなら `Read, write, and DMs` は不要です。
3. `Keys and tokens` を開き、`Consumer Keys` の `API Key and Secret` を `X_API_KEY` / `X_API_SECRET` に設定します。
4. `Authentication Tokens` の `Access Token and Secret` を再生成し、`X_ACCESS_TOKEN` / `X_ACCESS_SECRET` に設定します。
5. 画面に `Created with Read Only permissions` と出ているトークンは投稿に使えません。権限変更後に必ずAccess Token and Secretを再生成してください。
6. Vercelに設定する場合は、Project SettingsのEnvironment Variablesに同じ4つの `X_*` 変数を登録し、再デプロイします。

## 自動投稿の設定 (Cron)

本システムは `/api/cron` エンドポイントを定期的に叩くことで予約投稿を実行します。

- **ローカル開発時**: 手動で `http://localhost:3000/api/cron` にアクセスするか、cronコマンド等で定期実行してください。
- **本番環境 (Vercel)**: `vercel.json` で15分ごとに `/api/cron` を実行します。HobbyプランではCronの実行回数に制限があるため、15分ごとの運用はPro以上または外部Cronを使ってください。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Postgres (Prisma ORM)
- **Styling**: Tailwind CSS
- **Integration**: X API via twitter-api-v2
- **AI**: OpenAI Responses API

## トラブルシューティング

- **DBエラー**: `.env` の `DATABASE_URL` が正しく設定されているか確認してください。
- **AI生成失敗**: `OPENAI_API_KEY` が設定されているか、`OPENAI_MODEL` が利用可能なモデルか確認してください。
- **投稿失敗**: X APIの権限が `Read and write` か、`X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_SECRET` が正しいか確認してください。
