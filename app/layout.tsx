import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScoreBet — Apuesta. Acumula. Gana.',
  description: 'Predice resultados deportivos, gana puntos y canjealos por premios reales.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className} style={{margin:0, background:'#0A0E1A'}}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
