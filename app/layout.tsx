import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import ServiceShutdownOverlay from '@/components/ServiceShutdownOverlay'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
})

export const metadata: Metadata = {
  title: 'PDF 한국어 맞춤법 검사기 - Apps in Toss에서 이용하세요',
  description: '웹 서비스는 종료되었습니다. PDF 한국어 맞춤법 검사는 Toss 앱의 pdfgrammercheckorean 미니앱에서 이용할 수 있습니다.',
  keywords: 'PDF 맞춤법 검사, 한국어 맞춤법, Apps in Toss, Toss 미니앱, pdfgrammercheckorean',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'PDF 한국어 맞춤법 검사기 - Apps in Toss 전용',
    description: '웹 서비스는 종료되었습니다. Toss 앱의 pdfgrammercheckorean 미니앱에서 이용해 주세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://pdfgrammercheckorean.site',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="naver-site-verification" content="2af240779ebe3a2abbd5ed659a0d8f22589b1054" />
        <meta name="monetag" content="b944860eaf94597da148ab864a6904b3" />

        {/* Google Analytics (GA4) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-PJFYER4MDV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PJFYER4MDV');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4224113972571264"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google IMA SDK for Video Ads */}
        <Script
          src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={notoSansKr.className}>
        <ServiceShutdownOverlay />
        {children}
      </body>
    </html>
  )
}
