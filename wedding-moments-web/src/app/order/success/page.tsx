'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!orderId) {
      router.push('/shop')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/shop')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [orderId, router])

  if (!orderId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ご注文ありがとうございます！
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            決済が完了しました
          </p>
          
          <p className="text-gray-500">
            注文番号: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Package className="w-8 h-8 text-pink-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                次のステップ
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">1.</span>
                  <span>注文確認メールを送信しました</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">2.</span>
                  <span>商品の制作を開始します（3-5営業日）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">3.</span>
                  <span>発送完了後、追跡番号をメールでお知らせします</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500">4.</span>
                  <span>通常2-3日でお届けします</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 mb-4">
              ご注文に関するお問い合わせは、注文番号を明記の上、
              <a href="mailto:support@weddingmoments.app" className="text-pink-500 hover:underline ml-1">
                support@weddingmoments.app
              </a>
              までご連絡ください。
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors text-center flex items-center justify-center gap-2"
          >
            <span>ショップに戻る</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            href="/"
            className="flex-1 px-6 py-3 border-2 border-pink-500 text-pink-500 rounded-lg font-semibold hover:bg-pink-50 transition-colors text-center"
          >
            ホームに戻る
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {countdown}秒後にショップに戻ります...
        </p>
      </div>
    </div>
  )
}
