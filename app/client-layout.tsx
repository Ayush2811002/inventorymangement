// "use client"

// import type React from "react"

// import "@/app/globals.css"
// import { Inter } from "next/font/google"
// import Sidebar from "@/components/Sidebar"
// import Header from "@/components/Header"
// import { useState } from "react"
// import { usePathname } from "next/navigation"
// import { useAuth } from "@/components/auth/auth-provider"
// import LoadingScreen from "@/components/LoadingScreen"

// const inter = Inter({ subsets: ["latin"] })

// function RootLayoutContent({ children }: { children: React.ReactNode }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
//   const pathname = usePathname()
//   const { user, loading } = useAuth()

//   // Hide Sidebar & Header on login page or view-invoice
//   const isInvoicePage = pathname === "/view-invoice"
//   const isLoginPage = pathname === "/login"
//   const shouldShowNavigation = !isInvoicePage && !isLoginPage && user

//   if (loading) {
//     return <LoadingScreen />
//   }

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {shouldShowNavigation && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
//       <div className="flex-1 flex flex-col overflow-hidden relative">
//         {shouldShowNavigation && <Header toggleSidebar={toggleSidebar} />}
//         <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out">
//           <div className="max-w-7xl mx-auto">{children}</div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default RootLayoutContent

"use client"

import type React from "react"

import "@/app/globals.css"
import { Inter } from "next/font/google"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import LoadingScreen from "@/components/LoadingScreen"

const inter = Inter({ subsets: ["latin"] })

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const prevPathnameRef = useRef(pathname)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false // Prevent loading screen on first load
      return
    }
    if (prevPathnameRef.current !== pathname) {
      setIsPageLoading(true)
      setTimeout(() => setIsPageLoading(false), 500) // Simulating a short delay
      prevPathnameRef.current = pathname
    }
  }, [pathname])

  // Hide Sidebar & Header on login page or view-invoice
  const isInvoicePage = pathname === "/view-invoice"
  const isLoginPage = pathname === "/login"
  const shouldShowNavigation = !isInvoicePage && !isLoginPage && user

  if (loading) {
    return <LoadingScreen />
  }

  if (isPageLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {shouldShowNavigation && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {shouldShowNavigation && <Header toggleSidebar={toggleSidebar} />}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default RootLayoutContent
