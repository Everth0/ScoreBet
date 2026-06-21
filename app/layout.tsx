import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Monetag from './monetag'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScoreBet — Apuesta. Acumula. Gana.',
  description: 'Predice resultados deportivos, gana puntos y canjealos por premios reales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script
          src="https://quge5.com/88/tag.min.js"
          data-zone="252033"
          async
          data-cfasync="false"
        />
      </head>
      <body className={inter.className} style={{margin:0, background:'#0A0E1A'}}>
        <AuthProvider>
          <Monetag />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
