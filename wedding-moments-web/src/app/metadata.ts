import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: {
    default: 'WeddingMoments - 結婚式写真共有アプリ',
    template: '%s | WeddingMoments',
  },
  description: '結婚式の思い出を簡単に共有。ゲストが撮影した写真をリアルタイムで共有し、フォトアルバムグッズも購入できる結婚式写真共有アプリです。',
  keywords: [
    '結婚式',
    '写真共有',
    'フォトアルバム',
    'ウェディング',
    '結婚',
    '写真',
    'アルバム',
    'グッズ',
    'QRコード',
    'スマホアプリ',
  ],
  authors: [{ name: 'WeddingMoments Team' }],
  creator: 'WeddingMoments',
  publisher: 'WeddingMoments',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://weddingmoments.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName: 'WeddingMoments',
    title: 'WeddingMoments - 結婚式写真共有アプリ',
    description: '結婚式の思い出を簡単に共有。ゲストが撮影した写真をリアルタイムで共有し、フォトアルバムグッズも購入できる結婚式写真共有アプリです。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WeddingMoments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeddingMoments - 結婚式写真共有アプリ',
    description: '結婚式の思い出を簡単に共有。ゲストが撮影した写真をリアルタイムで共有し、フォトアルバムグッズも購入できる結婚式写真共有アプリです。',
    images: ['/og-image.png'],
    creator: '@weddingmoments',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export const shopMetadata: Metadata = {
  title: 'グッズショップ',
  description: '結婚式の思い出をフォトアルバムやグッズに。高品質な商品を多数取り揃えています。',
  openGraph: {
    title: 'グッズショップ | WeddingMoments',
    description: '結婚式の思い出をフォトアルバムやグッズに。高品質な商品を多数取り揃えています。',
  },
}

export const adminMetadata: Metadata = {
  title: '管理者ダッシュボード',
  description: 'WeddingMoments 管理者専用ページ。注文管理、イベント統計、ユーザー管理が行えます。',
  robots: {
    index: false,
    follow: false,
  },
}

// Generate structured data for SEO
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WeddingMoments',
    description: '結婚式の思い出を簡単に共有。ゲストが撮影した写真をリアルタイムで共有し、フォトアルバムグッズも購入できる結婚式写真共有アプリです。',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web, iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }
}
