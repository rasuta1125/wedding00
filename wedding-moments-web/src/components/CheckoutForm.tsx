'use client'

import { useState, FormEvent } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface CheckoutFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function CheckoutForm({ onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
        },
      })

      if (error) {
        setMessage(error.message || '決済処理中にエラーが発生しました')
        onError?.(error.message || '決済エラー')
      } else {
        onSuccess?.()
      }
    } catch (err: any) {
      setMessage('予期しないエラーが発生しました')
      onError?.(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {message && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full px-6 py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? '処理中...' : '支払いを確定する'}
      </button>

      <p className="text-xs text-center text-gray-500">
        このサイトはStripeによって保護されています
      </p>
    </form>
  )
}
