import { Metadata } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '管理者ダッシュボード | WeddingMoments',
  description: 'WeddingMoments 管理者ダッシュボード',
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              WeddingMoments 管理
            </h1>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              サイトに戻る
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
            >
              📊 ダッシュボード
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
            >
              📦 注文管理
            </Link>
            <Link
              href="/admin/events"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
            >
              🎉 イベント統計
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
            >
              👥 ユーザー管理
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
