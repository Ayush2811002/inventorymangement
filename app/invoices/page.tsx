"use client";

import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { db } from "@/components/utils/firebaseConfig";
import { ref, get, remove, update } from "firebase/database";
import Swal from "sweetalert2";
import { handleViewInvoice } from "@/components/utils/invoiceUtils";

type Invoice = {
  id: string;
  billTo: string;
  billingAddress: string;
  gstin: string;
  invoiceDate: string;
  invoiceNumber: number;
  paidOn?: string;
  paymentStatus: string;
  products?: {
    qty: number;
  hsnCode: string; // ✅ Correct

    price: number;
    description: string;
  }[]; // Match the expected type
  shippingAddress: string;
  grandTotal?: number; // ✅ Add this
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  // const router = useRouter();
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const snapshot = await get(ref(db, "invoices"));
        const data = snapshot.val();

        if (data && typeof data === "object") {
          // const today = new Date();
          const invoicesData: Invoice[] = Object.entries(data).map(
            ([id, invoiceData]) => {
              const invoice = { ...(invoiceData as Invoice), id };
              // const invoiceDate = new Date(invoice.invoiceDate);
              // Extract grandTotal from taxes if it exists
              // Ensure grandTotal is fetched safely from taxes
              // const grandTotal = (invoice as any)?.taxes?.grandTotal ?? 0;
              interface Taxes {
  grandTotal?: number;
}

              const grandTotal = (invoice as unknown as { taxes?: Taxes })?.taxes?.grandTotal ?? 0;

              // Check if the invoice is overdue
              // if (invoice.paymentStatus === "due" && today > invoiceDate) {
              //   invoice.paymentStatus = "overdue";
              //   update(ref(db, `invoices/${id}`), { paymentStatus: "overdue" }); // Update Firebase
              // }
              return { ...invoice, grandTotal };
            }
          );

          setInvoices(invoicesData);
        } else {
          setInvoices([]);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This invoice will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirm.isConfirmed) {
      try {
        await remove(ref(db, `invoices/${id}`));
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
        Swal.fire("Deleted!", "Invoice has been removed.", "success");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        Swal.fire("Error", "Failed to delete invoice.", "error");
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    if (!selectedInvoice) return;

    const { name, value } = e.target;

    // If payment status is changed to "pending", clear paidOn date

    if (name === "paymentStatus" && value === "pending") {
      setSelectedInvoice({
        ...selectedInvoice,
        paymentStatus: value,
        paidOn: "",
      });
    } else {
      setSelectedInvoice({ ...selectedInvoice, [name]: value });
    }
  };

  const handleUpdate = async () => {
    if (!selectedInvoice) return;

    // const today = new Date();
    const invoiceDate = new Date(selectedInvoice.invoiceDate);
    const paidOn = selectedInvoice.paidOn
      ? new Date(selectedInvoice.paidOn)
      : null;

    // Validate Paid On Date
    if (paidOn && paidOn < invoiceDate) {
      Swal.fire(
        "Error",
        "Paid date cannot be before the invoice date!",
        "error"
      );
      return;
    }

    // Check if the invoice is overdue (more than 1 day past invoice date & still due)
    // const isOverdue =
    //   selectedInvoice.paymentStatus === "due" && today > invoiceDate;
    // const updatedStatus = isOverdue ? "overdue" : selectedInvoice.paymentStatus;

    try {
      // Replace updatedStatus with selectedInvoice.paymentStatus in the update function
      await update(ref(db, `invoices/${selectedInvoice.id}`), {
        paymentStatus: selectedInvoice.paymentStatus, // Previously used updatedStatus
        paidOn: selectedInvoice.paidOn || "N/A",
      });

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id
            ? {
                ...inv,
                paymentStatus: selectedInvoice.paymentStatus,
                paidOn: selectedInvoice.paidOn,
              }
            : inv
        )
      );

      Swal.fire("Updated!", "Invoice updated successfully.", "success");
    } catch (error) {
      console.error("Error updating invoice:", error);
      Swal.fire("Error", "Failed to update invoice.", "error");
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white">Invoices</h1>
        <Link href="/invoices/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-300 p-4">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="text-center text-gray-300 p-4">No invoices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-900">
                  <TableHead className="text-gray-400">Invoice ID</TableHead>
                  <TableHead className="text-gray-400">Client Name</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">Grand Total</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Paid On</TableHead>
                  <TableHead className="text-gray-400">Invoice Date</TableHead>
                  <TableHead className="text-gray-400 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-700">
                    <TableCell className="text-white">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {invoice.billTo}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      ₹
                      {invoice.products
                        ? invoice.products
                            .reduce((total, p) => total + p.qty * p.price, 0)
                            .toFixed(2)
                        : "0.00"}
                    </TableCell>
                    <TableCell className="text-gray-300 font-semibold">
                      ₹ {invoice.grandTotal?.toFixed(2) || "0.00"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold 
          ${
            invoice.paymentStatus === "paid"
              ? "bg-green-500 text-green-100"
              : invoice.paymentStatus === "overdue"
              ? "bg-red-500 text-red-100"
              : "bg-yellow-500 text-yellow-100"
          }
        `}
                      >
                        {invoice.paymentStatus}
                      </span>
                    </TableCell>

                    <TableCell className="text-gray-300">
                      {invoice.paidOn || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {invoice.invoiceDate}
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-blue-500"
                        onClick={() => handleViewInvoice(invoice.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        className="bg-yellow-500"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

{showModal && selectedInvoice && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={() => setShowModal(false)} // Clicking on overlay closes modal
  >
    <div
      className="bg-gray-900 p-6 rounded-lg w-96"
      onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicked inside
    >
      <h2 className="text-xl font-bold text-white mb-4">Edit Invoice</h2>
      <select
        name="paymentStatus"
        value={selectedInvoice.paymentStatus}
        onChange={handleChange}
        className="w-full mb-3 p-2 bg-gray-800 text-white"
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
      </select>
      <input
        type="date"
        name="paidOn"
        min={selectedInvoice.invoiceDate}
        value={selectedInvoice.paidOn || ""}
        onChange={handleChange}
        className="w-full mb-3 p-2 bg-gray-800 text-white"
        disabled={selectedInvoice.paymentStatus === "pending"} // Disable if pending
      />

      <div className="flex justify-between">
        <Button onClick={() => setShowModal(false)} className="bg-red-500">
          Cancel
        </Button>
        <Button onClick={handleUpdate} className="bg-blue-500">
          Save
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
