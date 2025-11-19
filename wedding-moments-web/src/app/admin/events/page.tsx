'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Event } from '@/types'

interface EventStats {
  event: Event
  photoCount: number
  guestCount: number
  orderCount: number
  revenue: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventStats | null>(null)

  useEffect(() => {
    fetchEventsWithStats()
  }, [])

  const fetchEventsWithStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all events
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc')
      )
      const eventsSnapshot = await getDocs(eventsQuery)
      
      // Fetch stats for each event
      const eventsWithStats = await Promise.all(
        eventsSnapshot.docs.map(async (eventDoc) => {
          const event = { id: eventDoc.id, ...eventDoc.data() } as Event
          
          // Count photos
          const photosQuery = query(collection(db, 'photos'))
          const photosSnapshot = await getDocs(photosQuery)
          const photoCount = photosSnapshot.docs.filter(
            doc => doc.data().eventId === event.id
          ).length
          
          // Count guest sessions
          const sessionsQuery = query(collection(db, 'guestSessions'))
          const sessionsSnapshot = await getDocs(sessionsQuery)
          const guestCount = sessionsSnapshot.docs.filter(
            doc => doc.data().eventId === event.id
          ).length
          
          // Count orders and revenue
          const ordersQuery = query(collection(db, 'orders'))
          const ordersSnapshot = await getDocs(ordersQuery)
          const eventOrders = ordersSnapshot.docs.filter(
            doc => doc.data().eventId === event.id
          )
          const orderCount = eventOrders.length
          const revenue = eventOrders.reduce(
            (sum, doc) => sum + (doc.data().amounts?.grandTotal || 0),
            0
          )
          
          return {
            event,
            photoCount,
            guestCount,
            orderCount,
            revenue,
          }
        })
      )
      
      setEvents(eventsWithStats)
    } catch (error) {
      console.error('Error fetching events with stats:', error)
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">イベント統計</h1>
        <button
          onClick={fetchEventsWithStats}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          🔄 更新
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">総イベント数</div>
          <div className="text-3xl font-bold text-gray-900">{events.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">総写真数</div>
          <div className="text-3xl font-bold text-gray-900">
            {events.reduce((sum, e) => sum + e.photoCount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">総ゲスト数</div>
          <div className="text-3xl font-bold text-gray-900">
            {events.reduce((sum, e) => sum + e.guestCount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">総売上</div>
          <div className="text-3xl font-bold text-gray-900">
            ¥{events.reduce((sum, e) => sum + e.revenue, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  イベント名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  写真数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ゲスト数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  売上
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    イベントがありません
                  </td>
                </tr>
              ) : (
                events.map((eventStats) => (
                  <tr key={eventStats.event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {eventStats.event.eventName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {eventStats.event.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eventStats.photoCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eventStats.guestCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eventStats.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ¥{eventStats.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        eventStats.event.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : eventStats.event.status === 'ended'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {eventStats.event.status === 'active' ? 'アクティブ' :
                         eventStats.event.status === 'ended' ? '終了' : '準備中'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eventStats.event.createdAt && (
                        new Date((eventStats.event.createdAt as any).toDate()).toLocaleDateString('ja-JP')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedEvent(eventStats)}
                        className="text-pink-600 hover:text-pink-900 font-medium"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          eventStats={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

interface EventDetailModalProps {
  eventStats: EventStats
  onClose: () => void
}

function EventDetailModal({ eventStats, onClose }: EventDetailModalProps) {
  const { event, photoCount, guestCount, orderCount, revenue } = eventStats

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">イベント詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Event Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">イベント名</span>
                  <span className="font-medium">{event.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">イベントID</span>
                  <span className="font-mono text-xs">{event.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ステータス</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : event.status === 'ended'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.status === 'active' ? 'アクティブ' :
                     event.status === 'ended' ? '終了' : '準備中'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">作成日</span>
                  <span>
                    {event.createdAt && new Date((event.createdAt as any).toDate()).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">統計情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{photoCount}</div>
                  <div className="text-sm text-blue-800">写真数</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{guestCount}</div>
                  <div className="text-sm text-purple-800">ゲスト数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{orderCount}</div>
                  <div className="text-sm text-green-800">注文数</div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-600">
                    ¥{revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-pink-800">売上</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">イベント設定</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">最大ゲスト数</span>
                  <span>{event.settings?.maxGuests || '無制限'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">自動公開</span>
                  <span>{event.settings?.autoPublish ? '有効' : '無効'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">透かし</span>
                  <span>{event.settings?.enableWatermark ? '有効' : '無効'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">画質設定</span>
                  <span className="capitalize">{event.settings?.photoQuality || 'high'}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {event.qrCodeUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">QRコード</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                  <img
                    src={event.qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
