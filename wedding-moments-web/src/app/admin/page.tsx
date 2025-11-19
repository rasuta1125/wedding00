'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalOrders: number
  totalRevenue: number
  totalPhotos: number
  totalUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPhotos: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Fetch events
      const eventsSnapshot = await getDocs(collection(db, 'events'))
      const totalEvents = eventsSnapshot.size
      const activeEvents = eventsSnapshot.docs.filter(
        doc => doc.data().status === 'active'
      ).length

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'))
      const totalOrders = ordersSnapshot.size
      const totalRevenue = ordersSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amounts?.grandTotal || 0),
        0
      )

      // Fetch photos
      const photosSnapshot = await getDocs(collection(db, 'photos'))
      const totalPhotos = photosSnapshot.size

      // Fetch users (assuming users collection exists)
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const totalUsers = usersSnapshot.size
        
        setStats({
          totalEvents,
          activeEvents,
          totalOrders,
          totalRevenue,
          totalPhotos,
          totalUsers,
        })
      } catch (error) {
        // If users collection doesn't exist, just set other stats
        setStats({
          totalEvents,
          activeEvents,
          totalOrders,
          totalRevenue,
          totalPhotos,
          totalUsers: 0,
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        ダッシュボード
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="総イベント数"
          value={stats.totalEvents}
          subtitle={`アクティブ: ${stats.activeEvents}`}
          icon="🎉"
          color="blue"
        />
        <StatCard
          title="総注文数"
          value={stats.totalOrders}
          subtitle={`売上: ¥${stats.totalRevenue.toLocaleString()}`}
          icon="📦"
          color="green"
        />
        <StatCard
          title="総写真数"
          value={stats.totalPhotos}
          subtitle="アップロード済み"
          icon="📸"
          color="purple"
        />
        <StatCard
          title="総ユーザー数"
          value={stats.totalUsers}
          subtitle="登録済みユーザー"
          icon="👥"
          color="pink"
        />
        <StatCard
          title="平均注文額"
          value={stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
          subtitle="¥ per order"
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="イベント稼働率"
          value={stats.totalEvents > 0 ? Math.round((stats.activeEvents / stats.totalEvents) * 100) : 0}
          subtitle="%"
          icon="📈"
          color="indigo"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          最近のアクティビティ
        </h2>
        <p className="text-gray-600">
          詳細な統計情報は各セクションからご確認ください。
        </p>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'indigo'
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}
