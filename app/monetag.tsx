'use client'
import { useEffect } from 'react'

export default function Monetag() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Monetag SW registered'))
        .catch(err => console.log('SW error:', err))
    }
  }, [])
  return null
}
