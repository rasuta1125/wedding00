# 📱 WeddingMoments - 結婚式フォトシェア & グッズECアプリ

結婚式の思い出を簡単に共有できる、iOS App + Web Appの統合アプリケーションです。

## 🎯 プロジェクト概要

WeddingMomentsは、結婚式写真共有とグッズEC機能を統合した革新的なアプリケーションです。

### 主な特徴

1. **QRコードで簡単参加** - ゲストはQRコードをスキャンするだけで参加可能（登録不要）
2. **リアルタイム写真共有** - 撮影した写真を即座にアップロード・共有
3. **グッズEC統合** - その場でフォトアルバムなどのグッズを注文
4. **iOS + Web対応** - 新郎新婦用iOSアプリ、ゲスト用Webアプリ

## 📦 プロジェクト構成

```
wedding-moments/
├── WeddingMoments-iOS/        # iOS App (新郎新婦用)
│   ├── WeddingMoments/
│   │   ├── Models/            # データモデル
│   │   ├── ViewModels/        # ビジネスロジック
│   │   ├── Views/             # UIコンポーネント
│   │   └── ...
│   └── README.md
│
├── wedding-moments-web/       # Web App (ゲスト用)
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # Reactコンポーネント
│   │   ├── lib/               # ユーティリティ
│   │   └── ...
│   └── README.md
│
└── 結婚式フォトシェア & グッズECアプリの完全仕様書.html
```

## 🛠️ 技術スタック

### iOS App
- **言語**: Swift 5.9+
- **UI Framework**: SwiftUI
- **最小対応**: iOS 15.6
- **Backend**: Firebase iOS SDK

### Web App
- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **Backend**: Firebase JS SDK

### 共通Backend
- **Firebase Services**:
  - Authentication (Apple Sign In, Google Sign In)
  - Firestore (NoSQLデータベース)
  - Storage (画像保存)
  - Functions (サーバーロジック)
  - Hosting (Web配信)
- **決済**: Stripe
- **メール**: SendGrid
- **画像最適化**: ImageKit/Cloudinary

## 🚀 クイックスタート

### iOS App

```bash
cd WeddingMoments-iOS
# Xcodeで開く
open WeddingMoments.xcodeproj
# Command + R でビルド & 実行
```

詳細は [WeddingMoments-iOS/README.md](WeddingMoments-iOS/README.md) を参照。

### Web App

```bash
cd wedding-moments-web
npm install
cp .env.local.example .env.local
# .env.localを編集してFirebase認証情報を設定
npm run dev
```

詳細は [wedding-moments-web/README.md](wedding-moments-web/README.md) を参照。

## 📱 主要機能

### 新郎新婦（ホスト）機能
- ✅ イベント作成・管理
- ✅ QRコード生成・共有
- ✅ 写真一覧・公開管理
- ✅ ゲスト数管理
- ✅ イベント設定（透かし、画質など）
- ✅ グッズ注文管理

### ゲスト機能
- ✅ QRコードでイベント参加
- ✅ 写真撮影・アップロード
- ✅ 写真ギャラリー閲覧
- ✅ グッズカタログ閲覧
- ✅ カート・注文機能
- ✅ 配送先情報入力

### グッズEC機能
- ✅ 商品カタログ
- ✅ カート管理
- ✅ オプション選択（サイズ、カバータイプなど）
- ✅ Stripe決済
- ✅ 注文追跡

## 🗄️ データベース設計

### Firestore Collections

- **users** - ユーザー情報（新郎新婦）
- **events** - イベント情報
- **photos** - 写真データ
- **products** - グッズ商品
- **orders** - 注文情報
- **guestSessions** - ゲストセッション（一時的）

詳細は仕様書の「3. データベース設計」セクションを参照。

## 🔐 セキュリティ

- Firebase Authentication（Apple/Google Sign In）
- Firestore Security Rules
- Storage Security Rules
- HTTPS通信
- 環境変数によるシークレット管理

## 🧪 テスト

### iOS App
```bash
# Xcodeでテストを実行
Command + U
```

### Web App
```bash
cd wedding-moments-web
npm run test
```

## 📊 開発ロードマップ

### Phase 1: MVP（完了）
- [x] iOS App基本構造
- [x] Web App基本構造
- [x] Firebase統合
- [x] 基本的な写真共有機能
- [x] グッズカタログ表示

### Phase 2: 決済統合（進行中）
- [ ] Stripe決済実装
- [ ] 注文管理機能
- [ ] メール通知

### Phase 3: 最適化（予定）
- [ ] 画像自動最適化
- [ ] PWAオフライン対応
- [ ] プッシュ通知
- [ ] パフォーマンス最適化

### Phase 4: 拡張機能（予定）
- [ ] 動画共有
- [ ] AIによる写真自動選別
- [ ] SNS連携
- [ ] 多言語対応

## 📝 開発ガイドライン

### コーディング規約
- iOS: Swift Style Guide準拠
- Web: ESLint + Prettier設定
- コメント: 日本語OK、重要な部分は英語でも
- 命名: わかりやすく、一貫性を保つ

### Git ワークフロー
1. 機能ブランチを作成: `git checkout -b feature/your-feature`
2. 変更をコミット: `git commit -m "Add: 機能説明"`
3. プッシュ: `git push origin feature/your-feature`
4. プルリクエストを作成

### コミットメッセージ規約
- `Add:` - 新機能追加
- `Fix:` - バグ修正
- `Update:` - 既存機能の更新
- `Refactor:` - リファクタリング
- `Docs:` - ドキュメント更新
- `Style:` - コードスタイルの変更
- `Test:` - テスト追加・修正

## 🐛 トラブルシューティング

### Firebase接続エラー
1. `.env.local` (Web) または `GoogleService-Info.plist` (iOS) を確認
2. Firebase Consoleでプロジェクト設定を確認
3. APIキーとBundle IDが一致しているか確認

### ビルドエラー
**iOS:**
```bash
# Xcodeでクリーンビルド
Command + Shift + K
```

**Web:**
```bash
# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

## 💰 コスト見積もり

### Firebase
- **Spark Plan (無料)**: 開発・テスト用
- **Blaze Plan (従量課金)**: 本番環境
  - Firestore: ~$2-10/月
  - Storage: ~$5-20/月
  - Functions: ~$5-30/月

### Stripe
- 手数料: 3.6% + ¥0 per transaction

### Hosting
- Firebase Hosting: 無料〜$0.15/GB
- または Vercel: 無料 (個人プロジェクト)

**想定月額**: $20-100 (初期ユーザー数: ~100イベント/月)

## 📄 ライセンス

Copyright © 2024 WeddingMoments. All rights reserved.

## 👥 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずIssueを開いて変更内容を議論してください。

## 📧 サポート

質問や問題がある場合は、GitHubのIssueを作成してください。

---

**開発状況**: MVP完成、決済統合進行中

**最終更新**: 2024-11-19
