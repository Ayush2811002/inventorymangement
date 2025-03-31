"use client"

import Link from "next/link"
import { Home, FileText, PlusCircle, BarChart, Package } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/invoices", icon: FileText, label: "Invoices" },
    { href: "/invoices/new", icon: PlusCircle, label: "New Invoice" },
    { href: "/reports", icon: BarChart, label: "Reports" },
    { href: "/stock", icon: Package, label: "Stock" },
  ]

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
          bg-gray-900 text-gray-100 w-64 space-y-6 py-7 px-2 fixed md:static
          inset-y-0 left-0 transform z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-transform duration-200 ease-in-out
        `}
      >
        <nav className="space-y-2">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={handleLinkClick}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded transition duration-200 ${
                isActive(href) ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(href) ? "text-white" : ""}`} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
