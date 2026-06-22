'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserContextType {
  userData: any
  loading: boolean
}

const UserContext = createContext<UserContextType>({ userData: null, loading: true })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (!user) {
        setUserData(null)
        setLoading(false)
        return
      }
      // Escuchar cambios en tiempo real
      const unsubSnap = onSnapshot(doc(db, 'users', user.uid), snap => {
        if (snap.exists()) {
          setUserData({ uid: user.uid, ...snap.data() })
        }
        setLoading(false)
      })
      return () => unsubSnap()
    })
    return () => unsubAuth()
  }, [])

  return (
    <UserContext.Provider value={{ userData, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
