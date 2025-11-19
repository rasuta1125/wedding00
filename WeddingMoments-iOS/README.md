# WeddingMoments iOS App

結婚式写真共有 & グッズECアプリのiOS版（新郎新婦用）

## 📱 概要

WeddingMomentsは、結婚式の思い出を簡単に共有できるiOSアプリです。

### 主な機能

- **イベント管理**: 結婚式イベントの作成・管理
- **QRコード生成**: ゲスト招待用QRコードの生成
- **写真共有**: リアルタイムで写真をアップロード・閲覧
- **グッズ購入**: フォトアルバムなどのグッズ注文
- **セキュア認証**: Apple Sign In / Google Sign In

## 🛠️ 技術スタック

- **言語**: Swift 5.9+
- **UI Framework**: SwiftUI
- **最小対応**: iOS 15.6
- **Backend**: Firebase
  - Authentication
  - Firestore
  - Storage
  - Functions
- **決済**: Stripe

## 📦 依存関係

- **Firebase iOS SDK** (v10.0+)
  - Authentication
  - Firestore
  - Storage
  - Functions
- **Stripe iOS SDK** (v23.0+)
  - StripePaymentSheet
- Kingfisher (画像キャッシング、予定)

## 🚀 セットアップ

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd WeddingMoments-iOS
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. iOSアプリを追加
3. `GoogleService-Info.plist`をダウンロード
4. プロジェクトのルートに配置

### 3. Xcodeで開く

```bash
open WeddingMoments.xcodeproj
```

### 4. 依存関係のインストール

Swift Package Managerで自動的にインストールされます。

#### 必要なパッケージ:

1. **Firebase iOS SDK**
   - URL: `https://github.com/firebase/firebase-ios-sdk`
   - Products: FirebaseAuth, FirebaseFirestore, FirebaseStorage, FirebaseFunctions

2. **Stripe iOS SDK**
   - URL: `https://github.com/stripe/stripe-ios`
   - Version: 23.0.0 以上
   - Product: StripePaymentSheet

#### パッケージの追加方法:

1. Xcode で **File > Add Package Dependencies...** を選択
2. 上記のURLを入力して検索
3. 必要なProductsを選択してプロジェクトに追加

詳細は [`STRIPE_INTEGRATION.md`](./STRIPE_INTEGRATION.md) を参照してください。

### 5. ビルド & 実行

1. Xcodeでターゲットデバイスを選択
2. `Command + R` でビルド & 実行

## 📁 プロジェクト構造

```
WeddingMoments/
├── WeddingMomentsApp.swift       # アプリエントリーポイント
├── ContentView.swift              # メインコンテンツビュー
├── Models/                        # データモデル
│   ├── Event.swift
│   ├── Photo.swift
│   ├── Product.swift
│   └── Order.swift
├── ViewModels/                    # ビジネスロジック
│   ├── AuthViewModel.swift
│   ├── EventViewModel.swift
│   ├── PhotoViewModel.swift
│   └── ShopViewModel.swift
├── Views/                         # UI画面
│   ├── Auth/
│   │   └── SignInView.swift
│   ├── Event/
│   │   ├── EventListView.swift
│   │   ├── EventDetailView.swift
│   │   ├── CreateEventView.swift
│   │   ├── QRCodeView.swift
│   │   └── EventSettingsView.swift
│   ├── Photo/
│   │   ├── PhotoGridView.swift
│   │   ├── CameraView.swift
│   │   └── PhotoDetailView.swift
│   └── Shop/
│       ├── ProductListView.swift
│       ├── ProductDetailView.swift
│       ├── CartView.swift
│       ├── CheckoutView.swift
│       └── OrderSuccessView.swift
├── Services/                      # 外部サービス連携
│   └── StripeService.swift
└── Utilities/                     # ユーティリティ関数
```

## 🔐 認証設定

### Apple Sign In

1. Apple Developer Portalで以下を設定:
   - App ID に "Sign In with Apple" Capability を追加
   - Xcode の Signing & Capabilities で "Sign In with Apple" を有効化

2. Firebase Consoleで:
   - Authentication > Sign-in method > Apple を有効化

### Google Sign In

1. Google Cloud Consoleで OAuth 2.0 クライアントIDを作成
2. Firebase Consoleで Google Sign-in を設定
3. `GoogleService-Info.plist` を最新版に更新

## 💳 Stripe決済設定

### 1. Stripe SDK の設定

アプリ起動時にStripe APIキーを設定:

```swift
// WeddingMomentsApp.swift
import StripePaymentSheet

init() {
    STPAPIClient.shared.publishableKey = "pk_test_..." // Your publishable key
}
```

### 2. Info.plist の更新

カメラアクセス権限を追加（カードスキャン用）:

```xml
<key>NSCameraUsageDescription</key>
<string>カメラを使用してカード情報をスキャンします</string>
```

### 3. テスト用カード

開発時は以下のテストカードを使用:
- 成功: `4242 4242 4242 4242`
- 失敗: `4000 0000 0000 9995`

詳細は [`STRIPE_INTEGRATION.md`](./STRIPE_INTEGRATION.md) を参照してください。

## 🧪 テスト

```bash
# ユニットテストの実行
Command + U

# UIテストの実行
# Test Navigatorから実行
```

## 📝 開発ガイドライン

### コーディング規約

- SwiftUIのベストプラクティスに従う
- MVVM アーキテクチャを採用
- async/await を使用した非同期処理
- Combine を使用したリアクティブプログラミング

### Git ワークフロー

1. 機能ブランチを作成: `git checkout -b feature/your-feature`
2. 変更をコミット: `git commit -m "Add: 機能説明"`
3. プッシュ: `git push origin feature/your-feature`
4. プルリクエストを作成

## 🐛 トラブルシューティング

### Firebase接続エラー

- `GoogleService-Info.plist` が正しく配置されているか確認
- Bundle Identifierが一致しているか確認

### ビルドエラー

- Xcodeのクリーンビルド: `Command + Shift + K`
- Derived Dataの削除: `Xcode > Preferences > Locations > Derived Data`

## 📄 ライセンス

Copyright © 2024 WeddingMoments. All rights reserved.

## 👥 開発者

AI Developer Team

## 📧 サポート

質問や問題がある場合は、Issue を作成してください。
