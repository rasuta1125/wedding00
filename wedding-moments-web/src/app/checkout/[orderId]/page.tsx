'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import CheckoutForm from '@/components/CheckoutForm'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real implementation, you would fetch the order details
    // and get the client secret from your backend
    
    // For now, we'll get it from localStorage (set during order creation)
    const secret = localStorage.getItem(`order_${orderId}_secret`)
    
    if (secret) {
      setClientSecret(secret)
    } else {
      setError('注文情報が見つかりません')
    }
    
    setLoading(false)
  }, [orderId])

  const handleSuccess = () => {
    // Clear the stored secret
    localStorage.removeItem(`order_${orderId}_secret`)
    
    // Redirect to success page
    router.push(`/order/success?orderId=${orderId}`)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            ショップに戻る
          </button>
        </div>
      </div>
    )
  }

  const options = {
    clientSecret: clientSecret!,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#ec4899',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            お支払い
          </h1>
          <p className="text-gray-600">
            注文番号: {orderId}
          </p>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {clientSecret && (
            <Elements stripe={getStripe()} options={options}>
              <CheckoutForm 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="inline-block mr-2">🔒</span>
            すべての取引は暗号化されて安全に処理されます
          </p>
        </div>
      </div>
    </div>
  )
}
