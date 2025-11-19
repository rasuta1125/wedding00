import Link from 'next/link'
import { Camera, Heart, ShoppingBag, QrCode } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Heart className="w-20 h-20 mx-auto text-pink-500" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Wedding<span className="text-pink-500">Moments</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            QRコードで簡単参加<br />
            結婚式の思い出をみんなで共有
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/join/demo" 
              className="px-8 py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              QRコードでゲスト参加
            </Link>
            
            <a 
              href="#features" 
              className="px-8 py-4 border-2 border-pink-500 text-pink-500 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              機能を見る
            </a>
          </div>
        </div>
        
        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
          <FeatureCard
            icon={<QrCode className="w-12 h-12 text-pink-500" />}
            title="簡単参加"
            description="QRコードをスキャンするだけ。アプリのインストールや登録は不要です。"
          />
          
          <FeatureCard
            icon={<Camera className="w-12 h-12 text-pink-500" />}
            title="写真共有"
            description="撮った写真をその場でアップロード。みんなの写真をリアルタイムで見られます。"
          />
          
          <FeatureCard
            icon={<ShoppingBag className="w-12 h-12 text-pink-500" />}
            title="グッズ注文"
            description="お気に入りの写真でフォトアルバムやグッズを注文できます。"
          />
        </div>
        
        {/* How It Works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            使い方
          </h2>
          
          <div className="space-y-8">
            <StepCard
              number="1"
              title="QRコードをスキャン"
              description="結婚式会場でQRコードを見つけてスキャンするだけで参加できます"
            />
            
            <StepCard
              number="2"
              title="写真を撮影・アップロード"
              description="撮った写真をその場でアップロード。新郎新婦や他のゲストと共有"
            />
            
            <StepCard
              number="3"
              title="思い出を形に"
              description="お気に入りの写真でフォトアルバムやグッズを注文"
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 WeddingMoments. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-6 bg-white p-6 rounded-xl shadow-md">
      <div className="flex-shrink-0 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
