"use client"

import { useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulating an API call to get the user
    setTimeout(() => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }, 1000)
  }, [])

  const login = (email: string, password: string) => {
    // Simulating an API call for login
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        if (email === "user@example.com" && password === "password") {
          const user = { id: "1", name: "John Doe", email: "user@example.com" }
          localStorage.setItem("user", JSON.stringify(user))
          setUser(user)
          resolve(user)
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 1000)
    })
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return { user, loading, login, logout }
}

