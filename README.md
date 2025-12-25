# X Schedule Post System (XPilot)

X（旧Twitter）への投稿を予約管理するためのシステムです。
Next.js, Prisma (SQLite), Tailwind CSSを使用し、無料で運用可能な構成（Vercel等の利用を想定）で作られています。

## 機能

- **予約投稿**: 日時を指定して投稿を予約（15分刻み推奨）
- **一覧表示**: 投稿予定（Upcoming）と履歴（History）の確認
- **キャンセル**: 予約済み投稿の削除
- **自動投稿**: Cron機能（API）による自動投稿実行

## セットアップ手順

### 1. 必要な環境

- Node.js (v18以上推奨)
- X (Twitter) Developer Account (API Key取得用)

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
DATABASE_URL="file:./dev.db"

# X (Twitter) API Keys
TWITTER_API_KEY="your_api_key"
TWITTER_API_SECRET="your_api_key_secret"
TWITTER_ACCESS_TOKEN="your_access_token"
TWITTER_ACCESS_SECRET="your_access_token_secret"

# Cron Job用シークレット (任意)
CRON_SECRET="your_cron_secret"
```

### 4. データベースのセットアップ

```bash
npx prisma db push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 自動投稿の設定 (Cron)

本システムは `/api/cron` エンドポイントを定期的に叩くことで予約投稿を実行します。

- **ローカル開発時**: 手動で `http://localhost:3000/api/cron` にアクセスするか、cronコマンド等で定期実行してください。
- **本番環境 (Vercel)**: Vercel Cron Jobs を設定することで自動化可能です。

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (Prisma ORM)
- **Styling**: Tailwind CSS
- **Integration**: twitter-api-v2

## トラブルシューティング

- **DBエラー**: `.env` の `DATABASE_URL` が正しく設定されているか確認してください。
- **投稿失敗**: X APIの権限範囲（Read/Write）やCredentialsが正しいか確認してください。Free TierではAPI制限が厳しいため注意が必要です。
