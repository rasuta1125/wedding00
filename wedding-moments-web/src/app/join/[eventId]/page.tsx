'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Event } from '@/types'
import { Heart, Loader2, AlertCircle } from 'lucide-react'
import PhotoGallery from '@/components/PhotoGallery'
import UploadButton from '@/components/UploadButton'
import { ErrorBoundary, ErrorDisplay } from '@/components/ErrorBoundary'
import { PageLoader, PhotoGridSkeleton } from '@/components/LoadingStates'

export const dynamicParams = true

export default function JoinEventPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = params.eventId as string
  const token = searchParams.get('token')
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestToken, setGuestToken] = useState<string | null>(null)

  useEffect(() => {
    const joinEvent = async () => {
      try {
        // Verify event exists
        const eventRef = doc(db, 'events', eventId)
        const eventSnap = await getDoc(eventRef)
        
        if (!eventSnap.exists()) {
          setError('イベントが見つかりません')
          setLoading(false)
          return
        }
        
        const eventData = eventSnap.data() as Event
        
        // Verify QR token
        if (!token || token !== eventData.qrToken) {
          setError('無効な招待リンクです')
          setLoading(false)
          return
        }
        
        // Check event status
        if (eventData.status === 'archived') {
          setError('このイベントは終了しました')
          setLoading(false)
          return
        }
        
        // Check guest limit
        if (eventData.currentGuestCount >= eventData.guestLimit) {
          setError('ゲスト人数の上限に達しました')
          setLoading(false)
          return
        }
        
        // Generate guest token (in production, this should be done via API)
        const generatedToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setGuestToken(generatedToken)
        
        // Store token in localStorage
        localStorage.setItem(`guestToken_${eventId}`, generatedToken)
        
        setEvent({ ...eventData, id: eventSnap.id })
        setLoading(false)
      } catch (err) {
        console.error('Error joining event:', err)
        setError('イベントへの参加に失敗しました')
        setLoading(false)
      }
    }
    
    if (eventId && token) {
      joinEvent()
    } else {
      setError('無効なリンクです')
      setLoading(false)
    }
  }, [eventId, token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">イベントに参加中...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            ホームに戻る
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-500" />
              <div>
                <h1 className="font-bold text-lg text-gray-900">{event.eventName}</h1>
                <p className="text-sm text-gray-500">{event.eventDate}</p>
              </div>
            </div>
            
            <UploadButton eventId={eventId} guestToken={guestToken || ''} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Event Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {event.eventName}
          </h2>
          
          <div className="space-y-2 text-gray-600">
            <p>📅 {event.eventDate}</p>
            {event.eventLocation && <p>📍 {event.eventLocation}</p>}
            <p>👥 参加中: {event.currentGuestCount} / {event.guestLimit} 名</p>
          </div>
          
          {!event.photosPublishedAt && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                📸 写真は後日公開されます
              </p>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            写真ギャラリー
          </h3>
          
          <PhotoGallery 
            eventId={eventId} 
            publishedOnly={!event.photosPublishedAt}
          />
        </div>
        
        {/* Shop Link */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">思い出をカタチに</h3>
          <p className="mb-4">お気に入りの写真でフォトアルバムやグッズを注文できます</p>
          <a 
            href="/shop"
            className="inline-block px-6 py-3 bg-white text-pink-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            グッズを見る
          </a>
        </div>
      </main>
    </div>
  )
}
