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

# X OAuth 2.0 Client Keys
X_CLIENT_ID="your_client_id"
X_CLIENT_SECRET="your_client_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-5.5"

# Basic Authentication (Optional)
# 設定するとアプリ全体にBasic認証がかかります（/api/cronを除く）
BASIC_AUTH_USER="admin"
BASIC_AUTH_PASSWORD="your_secure_password"

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
2. 画面右上の**Xアカウントを連携**ボタンから、OAuth 2.0でXアカウントを連携します（複数アカウント連携可能）。
3. **AI下書き**で投稿テーマを任意入力し、投稿案を生成します。
4. 使いたい案の「本文に入れる」を押し、投稿文を必要に応じて編集します。
5. 投稿先アカウントと投稿日時を指定して予約します。

AI生成案は自動では予約・投稿されません。誤投稿を防ぐため、必ずユーザーの確認と予約操作を挟みます。

## X Developer Portal の設定

このアプリは、ユーザー自身または他のユーザーのXアカウントで投稿するために **OAuth 2.0 Authorization Code Flow with PKCE** を使います。

1. X Developer Portalで対象Appを開き、`Settings` の `User authentication settings` を開きます。
2. App permissionsを `Read and write` または必要に応じて `Read, write, and Direct message` に変更します。
3. Type of Appで `Web App, Automated App or Bot` を選択します。
4. App infoの Callback URI / Redirect URL に `http://localhost:3000/api/auth/twitter/callback` （本番の場合は本番のURL）を設定します。
5. 保存すると `Client ID` と `Client Secret` が発行されるので、これらを `.env` の `X_CLIENT_ID` / `X_CLIENT_SECRET` に設定します。
6. Vercelに設定する場合は、Project SettingsのEnvironment Variablesに同様の変数を登録し、再デプロイします。

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
