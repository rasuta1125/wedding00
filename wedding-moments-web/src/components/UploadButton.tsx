'use client'

import { useState, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'
import { Camera, Upload, Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface UploadButtonProps {
  eventId: string
  guestToken: string
}

export default function UploadButton({ eventId, guestToken }: UploadButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload to Firebase Storage
      const fileName = `${Date.now()}_${selectedFile.name}`
      const storageRef = ref(storage, `events/${eventId}/photos/${fileName}`)
      
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          alert('アップロードに失敗しました')
          setUploading(false)
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          // Create Firestore document
          await addDoc(collection(db, 'photos'), {
            eventId,
            uploadedBy: guestToken,
            uploaderType: 'guest',
            originalUrl: downloadURL,
            thumbnailUrl: downloadURL, // TODO: Generate thumbnails
            mediumUrl: downloadURL,
            imageMetadata: {
              width: 0, // TODO: Get actual dimensions
              height: 0,
              size: selectedFile.size,
              format: selectedFile.type.split('/')[1],
            },
            isPublished: false,
            uploadedAt: serverTimestamp(),
          })

          // Reset state
          setSelectedFile(null)
          setPreviewUrl(null)
          setUploadProgress(0)
          setUploading(false)
          setShowModal(false)
          
          alert('写真をアップロードしました！')
        }
      )
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('アップロードに失敗しました')
      setUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
      >
        <Camera className="w-5 h-5" />
        <span className="hidden sm:inline">写真をアップロード</span>
      </button>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">写真をアップロード</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!selectedFile ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-pink-500 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">クリックして写真を選択</p>
                  <p className="text-sm text-gray-400 mt-2">または</p>
                  <p className="text-sm text-gray-400">ドラッグ&ドロップ</p>
                </button>
              </div>
            ) : (
              <div>
                {previewUrl && (
                  <div className="mb-4 relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {uploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                      <span className="text-gray-600">アップロード中...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      {Math.round(uploadProgress)}%
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleUpload}
                      className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      アップロード
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
