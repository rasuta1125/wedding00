'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Package } from 'lucide-react'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      let q = query(
        collection(db, 'products'),
        where('isActive', '==', true)
      )

      if (selectedCategory) {
        q = query(q, where('category', '==', selectedCategory))
      }

      const snapshot = await getDocs(q)
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[]

      productsData.sort((a, b) => a.sortOrder - b.sortOrder)
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'album', name: 'フォトアルバム', icon: '📖' },
    { id: 'frame', name: 'フォトフレーム', icon: '🖼️' },
    { id: 'mug', name: 'マグカップ', icon: '☕' },
    { id: 'keychain', name: 'キーホルダー', icon: '🔑' },
    { id: 'calendar', name: 'カレンダー', icon: '📅' },
    { id: 'card', name: 'グリーティングカード', icon: '💌' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <h1 className="font-bold text-xl">WeddingMoments</h1>
            </Link>
            
            <Link 
              href="/shop/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Cart badge would go here */}
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Package className="w-16 h-16 mx-auto text-pink-500 mb-4" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            グッズショップ
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            結婚式の思い出を素敵なグッズに残しませんか？<br />
            フォトアルバムからマグカップまで、豊富なラインナップをご用意しています。
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                selectedCategory === null
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              すべて
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">商品が見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id}
                href={`/shop/products/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-pink-500">
                        ¥{product.basePrice.toLocaleString()}
                      </p>
                      
                      {product.stockQuantity !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.stockQuantity > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stockQuantity > 0 ? '在庫あり' : '在庫切れ'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">カスタムオーダーも承ります</h3>
          <p className="mb-6">
            特別なご要望やオリジナルデザインのグッズ制作も可能です。<br />
            お気軽にお問い合わせください。
          </p>
          <a 
            href="mailto:support@weddingmoments.app"
            className="inline-block px-8 py-3 bg-white text-pink-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            お問い合わせ
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 WeddingMoments. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
