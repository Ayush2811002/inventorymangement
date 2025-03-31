// "use client";

// import "@/app/globals.css";
// import { Inter } from "next/font/google";
// import { Toaster } from "@/components/ui/toaster";
// import Sidebar from "@/components/Sidebar";
// import Header from "@/components/Header";
// import { useState } from "react";
// import { usePathname } from "next/navigation";

// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
//   const pathname = usePathname(); // Get the current route

//   // Hide Sidebar & Header only on /view-invoice
//   const isInvoicePage = pathname === "/view-invoice";

//   return (
//     <html lang="en" className="dark">
//       <body
//         className={`${inter.className} bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-h-screen`}
//       >
//         <div className="flex h-screen overflow-hidden">
//           {!isInvoicePage && (
//             <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
//           )}
//           <div className="flex-1 flex flex-col overflow-hidden relative">
//             {!isInvoicePage && <Header toggleSidebar={toggleSidebar} />}
//             <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out">
//               <div className="max-w-7xl mx-auto">{children}</div>
//             </main>
//           </div>
//         </div>
//         <Toaster />
//       </body>
//     </html>
//   );
// }
import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/auth-provider"
import RootLayoutContent from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white min-h-screen`}
      >
        <AuthProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

