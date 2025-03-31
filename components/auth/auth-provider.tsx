"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/components/utils/firebaseConfig"

type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })

        // If on login page, redirect to dashboard
        if (pathname === "/login") {
          router.push("/")
        }
      } else {
        setUser(null)

        // If not on login page, redirect to login
        if (pathname !== "/login") {
          router.push("/login")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

