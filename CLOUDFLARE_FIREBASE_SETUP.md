# Cloudflare Pages × Firebase 連携ガイド

## 📋 概要

このガイドでは、Cloudflare PagesでWeddingMomentsアプリケーションをデプロイし、Firebaseと連携する手順を説明します。

## 🔑 必要な環境変数

Cloudflare Pagesのダッシュボードで以下の環境変数を設定してください。

### Firebase 設定

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Stripe 設定

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### その他の設定

```bash
# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev

# Node Version
NODE_VERSION=18
```

---

## 📝 Firebase設定値の取得方法

### 1. Firebase Console にアクセス

https://console.firebase.google.com/

### 2. プロジェクトを選択

既存の Firebase プロジェクトを選択します。

### 3. プロジェクト設定を開く

1. 左側メニューの⚙️（歯車アイコン）をクリック
2. 「プロジェクトの設定」を選択

### 4. Web アプリの構成を確認

「全般」タブで、下にスクロールして「マイアプリ」セクションを確認します。

#### 既にWebアプリが登録されている場合:
- 「Firebase SDK snippet」を選択
- 「構成」を選択
- 表示される `firebaseConfig` オブジェクトの値をコピー

#### まだWebアプリが登録されていない場合:
1. 「アプリを追加」をクリック
2. Webアイコン（</>）を選択
3. アプリのニックネーム: `WeddingMoments Web`
4. 「Firebase Hosting を設定する」はチェックを外す
5. 「アプリを登録」をクリック
6. 表示される設定値をコピー

### 5. 設定値の例

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

これを環境変数形式に変換:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🌐 Cloudflare Pages での環境変数設定手順

### 方法1: Cloudflare Dashboard（推奨）

1. **Cloudflare Dashboard にログイン**
   https://dash.cloudflare.com/

2. **Pages を選択**
   左側メニューから「Workers & Pages」→「Pages」を選択

3. **プロジェクトを選択**
   `project-7e948d37` または `weddingmoments` プロジェクトを選択

4. **Settings タブを開く**
   上部メニューから「Settings」をクリック

5. **Environment Variables を設定**
   - 左側メニューから「Environment variables」を選択
   - 「Add variable」をクリック
   - 上記の環境変数を1つずつ追加

   **重要**: 
   - Production と Preview の両方にチェックを入れる
   - 機密情報（API Key等）は「Encrypt」をチェック

6. **変数を追加後、再デプロイ**
   - 「Deployments」タブに移動
   - 最新のデプロイメントの「...」メニューから「Retry deployment」を選択

### 方法2: Wrangler CLI（上級者向け）

```bash
# Wrangler のインストール
npm install -g wrangler

# Cloudflare にログイン
wrangler login

# 環境変数を設定（1つずつ実行）
wrangler pages secret put NEXT_PUBLIC_FIREBASE_API_KEY
# プロンプトが表示されたら値を入力

# または、一括設定（.envファイルから）
wrangler pages secret bulk .env
```

---

## 🔧 Next.js × Cloudflare Pages 設定

### 1. next.config.js の確認

`wedding-moments-web/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages で動作するように設定
  output: 'export', // Static export
  // または
  // output: 'standalone', // Server-side rendering
  
  images: {
    unoptimized: true, // Cloudflare Pages では必須
  },
  
  // 環境変数の検証
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig
```

### 2. ビルドコマンドの設定

Cloudflare Pages の設定:

```
Build command: npm run build
Build output directory: out (static export の場合) または .next (SSR の場合)
Root directory: wedding-moments-web
Node version: 18
```

---

## 🚀 デプロイ手順

### 初回デプロイ

1. **GitHub リポジトリと連携**
   - Cloudflare Pages で「Create a project」
   - 「Connect to Git」を選択
   - GitHub アカウントを接続
   - `rasuta1125/wedding00` リポジトリを選択

2. **ビルド設定**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: out
   Root directory: wedding-moments-web
   ```

3. **環境変数を設定**
   上記の手順で環境変数を追加

4. **デプロイ開始**
   「Save and Deploy」をクリック

### 継続的デプロイ

GitHub の `main` ブランチにプッシュすると自動的にデプロイされます。

```bash
git push origin main
```

---

## ✅ 確認事項

### デプロイ後の確認

1. **環境変数が設定されているか**
   ```bash
   # ブラウザの開発者ツールで確認
   console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
   ```

2. **Firebaseに接続できるか**
   - ログイン機能をテスト
   - Firestoreからデータ取得をテスト

3. **Stripeが動作するか**
   - 決済フローをテスト

4. **PWAが動作するか**
   - Service Worker が登録されているか確認
   - オフライン動作を確認

### トラブルシューティング

#### Firebase接続エラー

**問題**: `Firebase: No Firebase App '[DEFAULT]' has been created`

**解決方法**:
1. 環境変数が正しく設定されているか確認
2. `NEXT_PUBLIC_` プレフィックスが付いているか確認
3. Cloudflare Pages を再デプロイ

#### ビルドエラー

**問題**: `Error: ENOENT: no such file or directory`

**解決方法**:
1. `Root directory` が `wedding-moments-web` に設定されているか確認
2. `package.json` が正しい場所にあるか確認

#### 画像が表示されない

**問題**: Next.js Image Optimization が動作しない

**解決方法**:
`next.config.js` に以下を追加:
```javascript
images: {
  unoptimized: true,
}
```

---

## 🔐 セキュリティ

### 環境変数の保護

1. **機密情報は必ず Encrypt する**
   - Stripe Secret Key
   - Firebase Admin SDK (使用する場合)

2. **公開鍵のみをフロントエンドに含める**
   - `NEXT_PUBLIC_*` プレフィックスの変数のみがクライアント側で利用可能
   - Secret Key は絶対に `NEXT_PUBLIC_` を付けない

3. **CORS設定**
   Firebase Console で Cloudflare Pages のドメインを許可:
   ```
   https://your-project.pages.dev
   https://your-custom-domain.com
   ```

---

## 📊 パフォーマンス最適化

Cloudflare Pages は自動的に以下を提供:

- ✅ Global CDN
- ✅ HTTP/3 サポート
- ✅ 自動HTTPS
- ✅ Brotli/Gzip圧縮
- ✅ Edge caching

追加の最適化:

```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Cloudflare での最適化
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

---

## 📧 サポート

問題が発生した場合:

1. Cloudflare Pages のビルドログを確認
2. Firebase Console でエラーログを確認
3. ブラウザの開発者ツールでネットワークエラーを確認

---

**作成日**: 2024-11-19  
**バージョン**: 1.0  
**対象プロジェクト**: WeddingMoments  
**Cloudflare Project**: project-7e948d37
