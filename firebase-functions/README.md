# WeddingMoments Firebase Functions

バックエンドAPIとサーバーレス処理を提供するFirebase Functions

## 📁 構造

```
firebase-functions/
├── src/
│   ├── api/                    # API endpoints
│   │   ├── events.ts          # イベント管理API
│   │   ├── photos.ts          # 写真管理API
│   │   └── orders.ts          # 注文管理API
│   ├── utils/                  # ユーティリティ
│   │   ├── config.ts          # 設定管理
│   │   ├── helpers.ts         # ヘルパー関数
│   │   ├── qrcode.ts          # QRコード生成
│   │   └── email.ts           # メール送信
│   ├── types/                  # TypeScript型定義
│   │   └── index.ts
│   └── index.ts               # エントリーポイント
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 セットアップ

### 1. 依存関係のインストール

```bash
cd firebase-functions
npm install
```

### 2. 環境変数の設定

Firebase Consoleで以下の環境変数を設定:

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.webhook_secret="whsec_..." \
  sendgrid.api_key="SG..." \
  sendgrid.from_email="noreply@weddingmoments.app" \
  app.web_url="https://weddingmoments.app"
```

### 3. ローカルエミュレーター

```bash
# Firebase CLIのインストール
npm install -g firebase-tools

# ログイン
firebase login

# エミュレーターの起動
npm run serve
```

## 📡 API エンドポイント

### イベント管理

#### `createEvent(data)`
新しいイベントを作成

**Request:**
```typescript
{
  eventName: string
  eventDate: string  // ISO 8601 format
  eventLocation?: string
  guestLimit: number
  autoPublish?: boolean
  publishTime?: string  // HH:mm format
}
```

**Response:**
```typescript
{
  success: boolean
  eventId?: string
  qrCodeUrl?: string
  qrToken?: string
  error?: string
}
```

#### `updateEvent(data)`
イベント情報を更新

#### `deleteEvent(data)`
イベントをアーカイブ（論理削除）

### 写真管理

#### `publishPhotos(data)`
イベントの全写真を公開

**Request:**
```typescript
{
  eventId: string
}
```

**Response:**
```typescript
{
  success: boolean
  publishedCount: number
}
```

#### `downloadAlbum(data)`
写真アルバムのダウンロードURLを生成

#### `autoPublishPhotos`
スケジュール実行：翌日自動公開（毎日0時）

### 注文管理

#### `createOrder(data)`
新しい注文を作成し、Stripe PaymentIntentを生成

**Request:**
```typescript
{
  eventId: string
  items: [{
    productId: string
    quantity: number
    selectedOptions: [{
      optionId: string
      value: string
    }]
  }]
  shippingInfo: {
    name: string
    email: string
    phone: string
    postalCode: string
    prefecture: string
    city: string
    address1: string
    address2?: string
  }
}
```

**Response:**
```typescript
{
  success: boolean
  orderId?: string
  clientSecret?: string  // Stripe PaymentIntent client secret
  error?: string
}
```

#### `stripeWebhook`
Stripe webhookイベント処理

- `payment_intent.succeeded`: 支払い成功時
- `payment_intent.payment_failed`: 支払い失敗時

#### `updateShippingStatus(data)`
配送状況を更新

**Request:**
```typescript
{
  orderId: string
  trackingNumber: string
}
```

## 🔐 セキュリティ

### 認証
- Firebase Authenticationによる認証
- `context.auth`でユーザー認証チェック
- イベントオーナー権限の検証

### Stripe Webhook
- Webhook署名検証
- 環境変数でシークレット管理

### メール送信
- SendGrid APIキー管理
- 送信元メール検証

## 🧪 テスト

### ユニットテスト
```bash
npm run test
```

### Functionのローカルテスト
```bash
# エミュレーターを起動
npm run serve

# Functions Shell
npm run shell

# 関数を手動実行
> createEvent({eventName: "Test Event", eventDate: "2025-01-25", guestLimit: 100})
```

## 🚀 デプロイ

### すべてのFunctionsをデプロイ
```bash
npm run deploy
```

### 特定のFunctionのみデプロイ
```bash
firebase deploy --only functions:createEvent
```

### 本番環境への注意事項
1. 環境変数が正しく設定されているか確認
2. Stripe本番キーに切り替え
3. SendGrid本番APIキーを使用
4. CORS設定を確認

## 📊 モニタリング

### ログの確認
```bash
npm run logs

# 特定の関数のログ
firebase functions:log --only createEvent
```

### Firebase Consoleでの監視
- Functions > ダッシュボード
- 実行回数、エラー率、実行時間を監視

## 🐛 トラブルシューティング

### デプロイエラー
```bash
# ビルドエラーをチェック
npm run build

# Node.jsバージョンを確認
node --version  # 18以上必要
```

### 環境変数エラー
```bash
# 設定を確認
firebase functions:config:get

# 設定をクリア
firebase functions:config:unset stripe.secret_key
```

### Webhook署名エラー
- Stripe Dashboardでwebhook署名シークレットを確認
- ローカルテストでは`stripe listen --forward-to`を使用

## 📝 開発ガイドライン

### 新しいAPIの追加
1. `src/api/`に新しいファイルを作成
2. 関数を実装
3. `src/index.ts`でエクスポート
4. TypeScript型を`src/types/index.ts`に追加
5. READMEを更新

### エラーハンドリング
```typescript
throw new functions.https.HttpsError(
  'invalid-argument',  // code
  'Error message'      // message
);
```

### ログ出力
```typescript
console.log("Info message");
console.error("Error message");
```

## 💰 コスト最適化

- 実行時間を最小化
- 不要なデータ読み取りを避ける
- バッチ処理を活用
- キャッシュを利用

## 📄 ライセンス

Copyright © 2024 WeddingMoments. All rights reserved.
