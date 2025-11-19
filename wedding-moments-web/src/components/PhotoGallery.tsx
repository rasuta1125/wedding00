'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Photo } from '@/types'
import Image from 'next/image'
import { Loader2, ImageIcon } from 'lucide-react'

interface PhotoGalleryProps {
  eventId: string
  publishedOnly?: boolean
}

export default function PhotoGallery({ eventId, publishedOnly = true }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    // Real-time listener for photos
    let q = query(
      collection(db, 'photos'),
      where('eventId', '==', eventId),
      orderBy('uploadedAt', 'desc')
    )

    if (publishedOnly) {
      q = query(
        collection(db, 'photos'),
        where('eventId', '==', eventId),
        where('isPublished', '==', true),
        orderBy('uploadedAt', 'desc')
      )
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          uploadedAt: (data.uploadedAt as Timestamp).toDate(),
          publishedAt: data.publishedAt ? (data.publishedAt as Timestamp).toDate() : undefined,
        } as Photo
      })
      
      setPhotos(photosData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching photos:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [eventId, publishedOnly])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">まだ写真がアップロードされていません</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <Image
              src={photo.thumbnailUrl}
              alt="Wedding photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full">
            <Image
              src={selectedPhoto.mediumUrl}
              alt="Wedding photo"
              width={selectedPhoto.imageMetadata.width}
              height={selectedPhoto.imageMetadata.height}
              className="w-full h-auto rounded-lg"
            />
            
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
            
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {new Date(selectedPhoto.uploadedAt).toLocaleString('ja-JP')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedPhoto.imageMetadata.width} × {selectedPhoto.imageMetadata.height} px
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
