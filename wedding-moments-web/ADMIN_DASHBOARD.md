# 管理者ダッシュボード

WeddingMoments 管理者ダッシュボードの完全ガイド

## 📋 概要

管理者ダッシュボードは、イベント、注文、ユーザーを一元管理するためのWebベースの管理画面です。

### 主な機能

- 📊 **ダッシュボード** - 全体統計の可視化
- 📦 **注文管理** - 注文一覧、ステータス更新、配送情報管理
- 🎉 **イベント統計** - イベントごとの詳細統計
- 👥 **ユーザー管理** - ユーザー一覧、検索

## 🚀 アクセス方法

### URL
```
https://your-domain.com/admin
```

### 認証
管理者ダッシュボードへのアクセスには Firebase Authentication が必要です。

**本番環境では、必ずアクセス制御を実装してください：**
1. Firebase Custom Claims で admin ロールを設定
2. Middleware でアクセス制限を実装
3. Firebase Security Rules で管理者権限をチェック

## 📱 画面構成

### 1. ダッシュボード (`/admin`)

**機能:**
- 総イベント数、アクティブイベント数
- 総注文数、総売上
- 総写真数
- 総ユーザー数
- 平均注文額
- イベント稼働率

**実装ファイル:**
- `src/app/admin/page.tsx`

### 2. 注文管理 (`/admin/orders`)

**機能:**
- 注文一覧表示（ステータス別フィルタリング）
- 注文詳細モーダル
  - 注文情報
  - 配送先情報
  - 注文内容・金額
- ステータス更新
  - 支払い待ち → 支払い済み → 制作中 → 発送済み → 配送完了
  - キャンセル
- 配送情報登録
  - 配送業者選択
  - 追跡番号入力
  - 発送済みステータス更新

**ステータス種類:**
- `pending` - 支払い待ち（灰色）
- `paid` - 支払い済み（青色）
- `processing` - 制作中（黄色）
- `shipped` - 発送済み（紫色）
- `delivered` - 配送完了（緑色）
- `cancelled` - キャンセル（赤色）

**実装ファイル:**
- `src/app/admin/orders/page.tsx`

**使用方法:**
1. フィルタータブで表示する注文をフィルタリング
2. 「詳細」ボタンで注文詳細モーダルを開く
3. ステータス更新ボタンでステータスを変更
4. 配送情報を入力して「発送済みに更新」

### 3. イベント統計 (`/admin/events`)

**機能:**
- イベント一覧表示
- イベントごとの統計
  - 写真数
  - ゲスト数
  - 注文数
  - 売上
- イベント詳細モーダル
  - 基本情報
  - 統計情報（グラフ表示）
  - イベント設定
  - QRコード表示

**実装ファイル:**
- `src/app/admin/events/page.tsx`

**使用方法:**
1. イベント一覧から統計を確認
2. 「詳細」ボタンでイベント詳細を表示
3. QRコードを確認・印刷

### 4. ユーザー管理 (`/admin/users`)

**機能:**
- ユーザー一覧表示
- ユーザー検索（メールアドレス、名前）
- ユーザー詳細表示
- 認証方法表示（Apple, Google, Email）

**実装ファイル:**
- `src/app/admin/users/page.tsx`

**注意事項:**
現在の実装では、イベントホストの情報のみを表示しています。
本番環境では、Firebase Admin SDK を使用して全ユーザー情報を取得してください。

## 🔐 セキュリティ

### 本番環境での実装要件

#### 1. Firebase Custom Claims

管理者ロールを設定:

```typescript
// Firebase Functions
import * as admin from 'firebase-admin'

export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Only super admin can set admin role
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized')
  }
  
  await admin.auth().setCustomUserClaims(data.uid, { admin: true })
  
  return { success: true }
})
```

#### 2. Middleware でアクセス制限

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Check authentication and admin claim
    // Redirect to login if not authenticated or not admin
    
    const isAuthenticated = checkAuth(request)
    const isAdmin = checkAdminClaim(request)
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

#### 3. Firebase Security Rules

```javascript
// firestore.rules
match /orders/{orderId} {
  allow read, write: if request.auth != null && 
    request.auth.token.admin == true;
}

match /events/{eventId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    (resource.data.hostUserId == request.auth.uid || 
     request.auth.token.admin == true);
}
```

## 🛠️ 開発環境セットアップ

### 1. 管理者アカウント作成

```bash
# Firebase CLI でユーザーに admin claim を付与
firebase functions:shell

# Functions Shell で実行
> setAdminRole({ uid: 'USER_UID', isAdmin: true })
```

### 2. 環境変数設定

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### 3. 開発サーバー起動

```bash
cd wedding-moments-web
npm run dev
```

管理者ダッシュボードにアクセス:
```
http://localhost:3000/admin
```

## 📊 統計情報の取得

### Firebase Functions API

管理者ダッシュボードは以下の Firebase Functions を使用します:

#### `getDashboardStats`
全体統計を取得

```typescript
const result = await functions.httpsCallable('getDashboardStats')()
// Returns: events, orders, photos statistics
```

#### `getOrders`
注文一覧を取得（フィルタリング可能）

```typescript
const result = await functions.httpsCallable('getOrders')({
  status: 'paid', // optional
  limit: 100      // optional
})
```

#### `getEventStats`
イベント統計を取得

```typescript
const result = await functions.httpsCallable('getEventStats')({
  eventId: 'event123' // optional
})
```

#### `updateOrderStatus`
注文ステータスを更新

```typescript
const result = await functions.httpsCallable('updateOrderStatus')({
  orderId: 'order123',
  status: 'shipped'
})
```

#### `getUsers`
ユーザー一覧を取得（Admin SDK使用）

```typescript
const result = await functions.httpsCallable('getUsers')({
  limit: 1000 // optional
})
```

## 🎨 UI/UX

### デザインシステム

- **カラースキーム**: Pink primary, Gray secondary
- **レスポンシブ**: モバイル、タブレット、デスクトップ対応
- **コンポーネント**: Tailwind CSS
- **アイコン**: Emoji + SVG

### レイアウト

```
┌─────────────────────────────────────────┐
│  Header (WeddingMoments 管理)           │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Content                │
│ - Dashboard                             │
│ - Orders │  (Dynamic content based on   │
│ - Events │   selected menu)             │
│ - Users  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

## 📝 今後の拡張

### Phase 5 - 予定機能

1. **リアルタイムダッシュボード**
   - WebSocket によるリアルタイム更新
   - 新規注文の通知

2. **高度な分析**
   - 売上グラフ（日別、月別）
   - 人気商品ランキング
   - コンバージョン率

3. **エクスポート機能**
   - CSV エクスポート
   - PDF レポート生成

4. **バルク操作**
   - 複数注文の一括更新
   - 一括メール送信

5. **権限管理**
   - ロールベースアクセス制御（RBAC）
   - 管理者、スタッフ、閲覧者などの権限レベル

## 🐛 トラブルシューティング

### 管理者ダッシュボードにアクセスできない

**原因:**
- 認証されていない
- Admin claim が設定されていない

**解決方法:**
1. Firebase Console でユーザーを確認
2. Functions Shell で admin claim を設定
3. ブラウザのキャッシュをクリア

### 統計情報が表示されない

**原因:**
- Firebase Functions がデプロイされていない
- Firestore データが存在しない

**解決方法:**
1. `firebase deploy --only functions` で Functions をデプロイ
2. テストデータを作成

### 注文ステータスが更新できない

**原因:**
- Security Rules で権限がない
- Functions のエラー

**解決方法:**
1. Firebase Console の Functions ログを確認
2. Security Rules を確認
3. ブラウザの開発者ツールでエラーを確認

## 📧 サポート

問題が発生した場合は、以下を確認してください:

1. Firebase Console のログ
2. ブラウザの開発者ツール（Console）
3. Network タブでAPIリクエストを確認

## 🔗 関連ドキュメント

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**バージョン**: 1.0  
**最終更新**: 2024-11-19  
**作成者**: AI Developer Team
