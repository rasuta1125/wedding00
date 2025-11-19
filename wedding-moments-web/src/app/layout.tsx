import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp'
})

export const metadata: Metadata = {
  title: 'WeddingMoments - 結婚式写真共有',
  description: 'QRコードで簡単参加、写真をリアルタイムで共有',
  manifest: '/manifest.json',
  themeColor: '#ec4899',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
