# WeddingMoments Web App

結婚式写真共有 & グッズECアプリのWeb版（ゲスト用）

## 🌐 概要

WeddingMomentsのWeb版は、ゲストがQRコードをスキャンしてイベントに参加し、写真を共有できるPWA対応のWebアプリケーションです。

### 主な機能

- **QRコード参加**: アプリのインストール不要、ブラウザで即座に参加
- **写真アップロード**: 撮影した写真をその場でアップロード
- **リアルタイム表示**: 他のゲストがアップロードした写真をリアルタイムで閲覧
- **グッズ注文**: フォトアルバムなどのグッズを注文
- **PWA対応**: オフライン機能とホーム画面追加

## 🛠️ 技術スタック

- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **Backend**: Firebase
  - Firestore (データベース)
  - Storage (画像保存)
  - Functions (サーバーロジック)
- **決済**: Stripe
- **状態管理**: Zustand (オプション)

## 📦 依存関係

主要パッケージ:
- `next`: ^14.2.0
- `react`: ^18.3.0
- `firebase`: ^10.12.0
- `@stripe/stripe-js`: ^3.0.0
- `tailwindcss`: ^3.4.0

## 🚀 セットアップ

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd wedding-moments-web
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成:

```bash
cp .env.local.example .env.local
```

以下の環境変数を設定:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 📁 プロジェクト構造

```
wedding-moments-web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── page.tsx             # ホームページ
│   │   ├── join/
│   │   │   └── [eventId]/
│   │   │       └── page.tsx     # ゲスト参加ページ
│   │   └── api/                 # APIルート（オプション）
│   ├── components/              # Reactコンポーネント
│   │   ├── PhotoGallery.tsx
│   │   ├── UploadButton.tsx
│   │   └── ...
│   ├── lib/                     # ユーティリティ・設定
│   │   └── firebase.ts
│   ├── hooks/                   # カスタムフック
│   └── types/                   # TypeScript型定義
│       └── index.ts
├── public/                      # 静的ファイル
│   ├── manifest.json
│   └── icons/
├── tailwind.config.js
├── next.config.js
└── package.json
```

## 🔥 Firebase設定

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
    }
    
    match /photos/{photoId} {
      allow read: if true;
      allow create: if request.auth != null || 
                       request.resource.data.uploaderType == 'guest';
    }
    
    match /products/{productId} {
      allow read: if true;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/photos/{photoId} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

## 🎨 カスタマイズ

### テーマカラーの変更

`tailwind.config.js`で primary カラーを変更:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // カスタムカラーパレット
      },
    },
  },
}
```

### PWA設定

`public/manifest.json`を編集:

```json
{
  "name": "WeddingMoments",
  "short_name": "WM",
  "theme_color": "#ec4899",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [...]
}
```

## 🧪 テスト

```bash
# ユニットテストの実行
npm run test

# E2Eテストの実行
npm run test:e2e
```

## 🚀 デプロイ

### Vercel

```bash
npm run build
vercel deploy
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## 📱 PWA機能

- オフライン対応
- ホーム画面に追加
- プッシュ通知（予定）

## 🐛 トラブルシューティング

### 画像が表示されない

1. Firebase Storage RulesとCORS設定を確認
2. `next.config.js`の`remotePatterns`を確認

### Firestoreエラー

1. `.env.local`の環境変数を確認
2. Firebase Rulesの読み取り権限を確認

## 📄 ライセンス

Copyright © 2024 WeddingMoments. All rights reserved.

## 👥 開発者

AI Developer Team

## 📧 サポート

質問や問題がある場合は、Issue を作成してください。

---

**開発中の機能:**
- [ ] グッズショップページ
- [ ] カート機能
- [ ] Stripe決済統合
- [ ] PWA オフライン機能
- [ ] プッシュ通知
