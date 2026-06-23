import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { UserProvider } from '@/context/UserContext'
import InstallPWA from '@/components/InstallPWA'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScoreBet — Apuesta. Acumula. Gana.',
  description: 'Predice resultados deportivos, gana puntos y canjealos por premios reales. 100% gratis.',
  keywords: ['apuestas', 'deportes', 'puntos', 'premios', 'mundial 2026', 'futbol'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ScoreBet',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.scorebet.space',
    title: 'ScoreBet — Apuesta. Acumula. Gana.',
    description: 'Predice resultados deportivos y gana premios reales gratis.',
    siteName: 'ScoreBet',
    images: [{
      url: 'https://www.scorebet.space/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ScoreBet',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreBet — Apuesta. Acumula. Gana.',
    description: 'Predice resultados deportivos y gana premios reales gratis.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#00FF88',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ScoreBet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className} style={{margin:0, background:'#0A0E1A'}}>
        <AuthProvider>
          <UserProvider>
            <InstallPWA />
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
