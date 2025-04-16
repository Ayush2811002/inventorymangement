"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { db } from "@/components/utils/firebaseConfig"
import { ref, get, remove, update } from "firebase/database"
import Swal from "sweetalert2"
import { handleViewInvoice } from "@/components/utils/invoiceUtils"
import {
  PlusCircle,
  Eye,
  Edit,
  Trash,
  Search,
  Calendar,
  Filter,
  X,
  ArrowUpDown,
  Download,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"

type Invoice = {
  id: string
  billTo: string
  billingAddress: string
  gstin: string
  invoiceDate: string
  billingDate: string
  invoiceNumber: number
  paidOn?: string
  paymentStatus: string
  products?: {
    qty: number
    hsnCode: string
    price: number
    description: string
  }[]
  shippingAddress: string
  grandTotal?: number
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Invoice | "amount"
    direction: "asc" | "desc"
  } | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  useEffect(() => {
    fetchInvoices()
  }, [])

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  applyFilters()
}, [invoices, searchQuery, statusFilter, dateRange, sortConfig, activeTab])

  // Reset selected invoices when filtered invoices change
  useEffect(() => {
    setSelectedInvoices([])
  }, [filteredInvoices])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const snapshot = await get(ref(db, "invoices"))
      const data = snapshot.val()

      if (data && typeof data === "object") {
        const invoicesData: Invoice[] = Object.entries(data).map(([id, invoiceData]) => {
          const invoice = { ...(invoiceData as Invoice), id }
          interface Taxes {
            grandTotal?: number
          }

          const grandTotal = (invoice as unknown as { taxes?: Taxes })?.taxes?.grandTotal ?? 0

          return {
            ...invoice,
            grandTotal,
            billingDate: invoice.billingDate || "N/A",
          }
        })

        setInvoices(invoicesData)
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      Swal.fire("Error", "Failed to fetch invoices.", "error")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...invoices]

    // Apply tab filter
    if (activeTab !== "all") {
      result = result.filter((invoice) => invoice.paymentStatus === activeTab)
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter((invoice) => invoice.billTo.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((invoice) => invoice.paymentStatus === statusFilter)
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate)
        const isWithinDateRange =
          (!dateRange.from || invoiceDate >= new Date(dateRange.from)) &&
          (!dateRange.to || invoiceDate <= new Date(dateRange.to))
        return isWithinDateRange
      })
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === "amount") {
          const aAmount = a.products ? a.products.reduce((total, p) => total + p.qty * p.price, 0) : 0
          const bAmount = b.products ? b.products.reduce((total, p) => total + p.qty * p.price, 0) : 0

          return sortConfig.direction === "asc" ? aAmount - bAmount : bAmount - aAmount
        } else {
          const aValue = a[sortConfig.key] || ""
          const bValue = b[sortConfig.key] || ""

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1
          }
          return 0
        }
      })
    }

    setFilteredInvoices(result)
  }

  const handleSort = (key: keyof Invoice | "amount") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This invoice will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })

    if (confirm.isConfirmed) {
      try {
        await remove(ref(db, `invoices/${id}`))
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
        Swal.fire("Deleted!", "Invoice has been removed.", "success")
      } catch (error) {
        console.error("Error deleting invoice:", error)
        Swal.fire("Error", "Failed to delete invoice.", "error")
      }
    }
  }
// const handleBulkExportPDF = async () => {
//   if (selectedInvoices.length === 0) {
//     Swal.fire("No Invoices Selected", "Please select at least one invoice to export.", "info");
//     return;
//   }

//   for (const invoiceId of selectedInvoices) {
//     try {
//       // Fetch invoice data from Firebase for each selected invoice
//       const snapshot = await get(ref(db, `invoices/${invoiceId}`));
//       const invoice = snapshot.val();

//       if (!invoice) {
//         console.warn(`Invoice with ID ${invoiceId} not found.`);
//         continue; // Skip if the invoice is not found
//       }

//       // Convert the invoice data to a URL-friendly string for query params
//       const invoiceDataString = encodeURIComponent(JSON.stringify(invoice));

//       // Open a new window for each invoice, displaying the invoice PDF preview
//       const newWindow = window.open(
//         `/view-invoice?data=${invoiceDataString}`,
//         "_blank",
//         "width=800,height=600"
//       );

//       if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
//         Swal.fire({
//           icon: "warning",
//           title: "Popup Blocked",
//           text: "Please allow popups for this site in your browser settings.",
//         });
//         break; // Stop the loop if popups are blocked
//       }

//       // Optional: small delay to avoid triggering popup blockers (you can adjust delay)
//       await new Promise((res) => setTimeout(res, 300));

//     } catch (error) {
//       console.error(`Error fetching invoice ${invoiceId}:`, error);
//     }
//   }
// };
// const handleBulkExportPDF = async () => {
//   if (selectedInvoices.length === 0) {
//     Swal.fire("No Invoices Selected", "Please select at least one invoice to export.", "info");
//     return;
//   }

//   try {
//     const invoiceDataArray = [];

//     for (const invoiceId of selectedInvoices) {
//       const snapshot = await get(ref(db, `invoices/${invoiceId}`));
//       const invoice = snapshot.val();

//       if (!invoice) {
//         console.warn(`Invoice with ID ${invoiceId} not found.`);
//         continue;
//       }

//       invoiceDataArray.push(invoice);
//     }

//     if (invoiceDataArray.length === 0) {
//       Swal.fire("No Valid Invoices", "None of the selected invoices could be loaded.", "warning");
//       return;
//     }

//     // Encode the full array
//     const dataString = encodeURIComponent(JSON.stringify(invoiceDataArray));

// // Open just one window with all invoices
// const newWindow = window.open(
//   `/view-invoice/bulk?data=${dataString}`,
//   "_blank",
//   "width=1000,height=700"
// );



//     if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
//       Swal.fire({
//         icon: "warning",
//         title: "Popup Blocked",
//         text: "Please allow popups for this site in your browser settings.",
//       });
//     }

//   } catch (error) {
//     console.error("Error during bulk invoice export:", error);
//   }
// };
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);

const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
const paginatedInvoices = filteredInvoices.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) return

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `${selectedInvoices.length} invoice(s) will be permanently deleted!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    })
    if (confirm.isConfirmed) {
      try {
        // Create an array of promises for each delete operation
        const deletePromises = selectedInvoices.map((id) => remove(ref(db, `invoices/${id}`)))

        // Execute all delete operations in parallel
        await Promise.all(deletePromises)

        // Update local state
        setInvoices((prev) => prev.filter((invoice) => !selectedInvoices.includes(invoice.id)))
        setSelectedInvoices([])

        Swal.fire("Deleted!", `${selectedInvoices.length} invoice(s) have been removed.`, "success")
      } catch (error) {
        console.error("Error deleting invoices:", error)
        Swal.fire("Error", "Failed to delete invoices.", "error")
      }
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedInvoices.length === 0) return

    const confirm = await Swal.fire({
      title: "Update Status",
      text: `Change status to "${status}" for ${selectedInvoices.length} invoice(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update them!",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    })

    if (confirm.isConfirmed) {
      try {
        const today = new Date().toISOString().split("T")[0]
        const updateData =
          status === "paid" ? { paymentStatus: status, paidOn: today } : { paymentStatus: status, paidOn: "N/A" }

        // Create an array of promises for each update operation
        const updatePromises = selectedInvoices.map((id) => update(ref(db, `invoices/${id}`), updateData))

        // Execute all update operations in parallel
        await Promise.all(updatePromises)

        // Update local state
        setInvoices((prev) =>
          prev.map((invoice) => {
            if (selectedInvoices.includes(invoice.id)) {
              return { ...invoice, ...updateData }
            }
            return invoice
          }),
        )

        setSelectedInvoices([])

        Swal.fire("Updated!", `${selectedInvoices.length} invoice(s) have been updated.`, "success")
      } catch (error) {
        console.error("Error updating invoices:", error)
        Swal.fire("Error", "Failed to update invoices.", "error")
      }
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowModal(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (!selectedInvoice) return

    const { name, value } = e.target

    if (name === "paymentStatus" && value === "pending") {
      setSelectedInvoice({
        ...selectedInvoice,
        paymentStatus: value,
        paidOn: "",
      })
    } else {
      setSelectedInvoice({ ...selectedInvoice, [name]: value })
    }
  }

  const handleUpdate = async () => {
    if (!selectedInvoice) return

    const invoiceDate = new Date(selectedInvoice.invoiceDate)
    const paidOn = selectedInvoice.paidOn ? new Date(selectedInvoice.paidOn) : null

    // Validate Paid On Date
    if (paidOn && paidOn < invoiceDate) {
      Swal.fire("Error", "Paid date cannot be before the invoice date!", "error")
      return
    }

    try {
      await update(ref(db, `invoices/${selectedInvoice.id}`), {
        paymentStatus: selectedInvoice.paymentStatus,
        paidOn: selectedInvoice.paidOn || "N/A",
      })

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id
            ? {
                ...inv,
                paymentStatus: selectedInvoice.paymentStatus,
                paidOn: selectedInvoice.paidOn,
              }
            : inv,
        ),
      )

      Swal.fire("Updated!", "Invoice updated successfully.", "success")
    } catch (error) {
      console.error("Error updating invoice:", error)
      Swal.fire("Error", "Failed to update invoice.", "error")
    }

    setShowModal(false)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateRange({ from: "", to: "" })
    setSortConfig(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500 text-green-100"
      case "overdue":
        return "bg-red-500 text-red-100"
      default:
        return "bg-yellow-500 text-yellow-100"
    }
  }

  const calculateAmount = (invoice: Invoice) => {
    return invoice.products ? invoice.products.reduce((total, p) => total + p.qty * p.price, 0) : 0
  }

  const toggleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map((invoice) => invoice.id))
    }
  }

  const toggleSelectInvoice = (id: string) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter((invoiceId) => invoiceId !== id))
    } else {
      setSelectedInvoices([...selectedInvoices, id])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">Invoices</CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Manage and track all your customer invoices
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchInvoices}
                      className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh invoices</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Link href="/invoices/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-800 px-6">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  All Invoices
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="paid"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Paid
                </TabsTrigger>
                <TabsTrigger
                  value="overdue"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400"
                >
                  Overdue
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search by client name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-gray-300">
                        <div className="p-2">
                          <p className="text-xs font-medium mb-2">Payment Status</p>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800">
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <div className="p-2">
                          <p className="text-xs font-medium mb-2">Date Range</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <Input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) =>
                                  setDateRange({
                                    ...dateRange,
                                    from: e.target.value,
                                  })
                                }
                                className="h-8 bg-gray-800 border-gray-700"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <Input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) =>
                                  setDateRange({
                                    ...dateRange,
                                    to: e.target.value,
                                  })
                                }
                                className="h-8 bg-gray-800 border-gray-700"
                              />
                            </div>
                          </div>
                        </div>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                          onClick={clearFilters}
                          className="text-gray-300 focus:text-white focus:bg-gray-800"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear Filters
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800 text-gray-300">
                        <DropdownMenuItem className="focus:text-white focus:bg-gray-800">
                          Export as CSV
                        </DropdownMenuItem>
               <DropdownMenuItem
  // onClick={handleBulkExportPDF}
  className="text-green-400 focus:text-green-300 focus:bg-gray-800"
>
  Export as PDF
</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Active filters display */}
                {(searchQuery || statusFilter !== "all" || dateRange.from || dateRange.to) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400">Active filters:</span>
                    {searchQuery && (
                      <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-300">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery("")} className="ml-2 text-gray-400 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-300">
                        Status: {statusFilter}
                        <button onClick={() => setStatusFilter("all")} className="ml-2 text-gray-400 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {(dateRange.from || dateRange.to) && (
                      <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-300">
                        Date: {dateRange.from || "Any"} to {dateRange.to || "Any"}
                        <button
                          onClick={() => setDateRange({ from: "", to: "" })}
                          className="ml-2 text-gray-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 h-7 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
                

                {/* Bulk actions */}
                {selectedInvoices.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-md border border-gray-700">
                    <span className="text-sm text-gray-300 mr-2">
                      {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? "s" : ""} selected
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                          Bulk Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusUpdate("paid")}
                          className="text-green-400 focus:text-green-300 focus:bg-gray-800"
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusUpdate("pending")}
                          className="text-yellow-400 focus:text-yellow-300 focus:bg-gray-800"
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkStatusUpdate("overdue")}
                          className="text-red-400 focus:text-red-300 focus:bg-gray-800"
                        >
                          Mark as Overdue
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                          onClick={handleBulkDelete}
                          className="text-red-500 focus:text-red-400 focus:bg-gray-800"
                        >
                          Delete Selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInvoices([])}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}

                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    {loading ? (
                      <div className="p-4 space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-full bg-gray-800" />
                          </div>
                        ))}
                      </div>
                    ) : filteredInvoices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-full bg-gray-800 p-3 mb-4">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No invoices found</h3>
                        <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                        >
                          Clear filters
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-900">
                            <TableHead className="w-[50px]">
                              <Checkbox
                                checked={
                                  selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0
                                }
                                onCheckedChange={toggleSelectAll}
                                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                            </TableHead>
                            <TableHead
                              className="text-gray-400 cursor-pointer"
                              onClick={() => handleSort("invoiceNumber")}
                            >
                              <div className="flex items-center">
                                Invoice ID
                                {sortConfig && sortConfig.key === "invoiceNumber" && (
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort("billTo")}>
                              <div className="flex items-center">
                                Client Name
                                {sortConfig && sortConfig.key === "billTo" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                              </div>
                            </TableHead>
                            <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort("amount")}>
                              <div className="flex items-center">
                                Amount
                                {sortConfig && sortConfig.key === "amount" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                              </div>
                            </TableHead>
                            <TableHead
                              className="text-gray-400 cursor-pointer"
                              onClick={() => handleSort("grandTotal")}
                            >
                              <div className="flex items-center">
                                Grand Total
                                {sortConfig && sortConfig.key === "grandTotal" && (
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                )}
                              </div>
                            </TableHead>
                            <TableHead
                              className="text-gray-400 cursor-pointer"
                              onClick={() => handleSort("paymentStatus")}
                            >
                              <div className="flex items-center">
                                Status
                                {sortConfig && sortConfig.key === "paymentStatus" && (
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="text-gray-400 cursor-pointer" onClick={() => handleSort("paidOn")}>
                              <div className="flex items-center">
                                Paid On
                                {sortConfig && sortConfig.key === "paidOn" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                              </div>
                            </TableHead>
                            <TableHead
                              className="text-gray-400 cursor-pointer"
                              onClick={() => handleSort("invoiceDate")}
                            >
                              <div className="flex items-center">
                                Invoice Date
                                {sortConfig && sortConfig.key === "invoiceDate" && (
                                  <ArrowUpDown className="ml-2 h-4 w-4" />
                                )}
                              </div>
                            </TableHead>
                            <TableHead className="text-gray-400 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                  {paginatedInvoices.map((invoice) => (

                            <TableRow key={invoice.id} className="border-gray-800 hover:bg-gray-800">
                              <TableCell>
                                <Checkbox
                                  checked={selectedInvoices.includes(invoice.id)}
                                  onCheckedChange={() => toggleSelectInvoice(invoice.id)}
                                  className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-white">{invoice.invoiceNumber}</TableCell>
                              <TableCell className="text-gray-300">{invoice.billTo}</TableCell>
                              <TableCell className="text-gray-300">₹{calculateAmount(invoice).toFixed(2)}</TableCell>
                              <TableCell className="text-gray-300 font-semibold">
                                ₹{invoice.grandTotal?.toFixed(2) || "0.00"}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(invoice.paymentStatus)}`}>
                                  {invoice.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">{invoice.paidOn || "N/A"}</TableCell>
                              <TableCell className="text-gray-300">{invoice.invoiceDate}</TableCell>
                              <TableCell>
                                <div className="flex justify-center space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-gray-700"
                                          onClick={() => handleViewInvoice(invoice.id)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View Invoice</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-gray-700"
                                          onClick={() => handleEdit(invoice)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit Invoice</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-gray-700"
                                          onClick={() => handleDelete(invoice.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Invoice</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                    )}
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
  <div className="flex items-center gap-2">
    <span>Rows per page:</span>
    <select
      className="bg-gray-800 text-white border border-gray-700 px-2 py-1 rounded"
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // reset to first page when page size changes
      }}
    >
      {[5, 10, 25, 50].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  </div>
  <div className="flex items-center gap-2">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700 disabled:opacity-50"
    >
      Previous
    </button>
    <span>
      Page {currentPage} of {totalPages}
    </span>
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700 disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t border-gray-800 px-6 py-4">
          <div className="flex justify-between items-center w-full text-sm text-gray-400">
            <div>
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={clearFilters}
              >
                Reset View
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the payment status and paid date for this invoice.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Payment Status</label>
                <Select
                  value={selectedInvoice.paymentStatus}
                  onValueChange={(value) =>
                   handleChange({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: { name: "paymentStatus", value },
  } as any)
}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Paid Date</label>
                <Input
                  type="date"
                  name="paidOn"
                  min={selectedInvoice.invoiceDate}
                  value={selectedInvoice.paidOn || ""}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700"
                  disabled={selectedInvoice.paymentStatus !== "paid"}
                />
                {selectedInvoice.paymentStatus !== "paid" && (
      <p className="text-xs text-gray-500">Set status to &quot;Paid&quot; to enable date selection</p>

                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

