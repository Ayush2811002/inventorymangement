import type React from "react"
export default function ViewInvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white text-black w-full min-h-screen flex items-center justify-center p-4 print:p-0">
      <div className="invoice-container w-full max-w-[210mm] print:max-w-full print:w-full print:m-0 print:p-0">
        {children}
      </div>
    </div>
  )
}

