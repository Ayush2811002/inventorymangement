"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, push, get, query, orderByKey } from "firebase/database";
import { db } from "@/components/utils/firebaseConfig"; // Adjust import path
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function NewInvoicePage() {
  // const [invoiceNumber, setInvoiceNumber] = useState(1); // Auto-incremented invoice number
  const [invoiceNumber, setInvoiceNumber] = useState<string>(""); 

  const [billTo, setBillTo] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
    const [Phoneno, setPhoneno] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
   const [SPhoneno, setSPhoneno] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  // const [discount, setDiscount] = useState<number>(0);

  const [gstin, setGstin] = useState("");
  // const [invoiceDate] = useState(new Date().toISOString().split("T")[0]); // Auto-fetch date
  const [invoiceDate, setInvoiceDate] = useState(() => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // Adjust for local timezone
  const formattedDate = today.toISOString().split("T")[0];
  console.log("📅 Adjusted Invoice Date:", formattedDate);
  return formattedDate;
});


  const [paymentStatus, setPaymentStatus] = useState("Pending"); // Default to "due"
  const [paidOn, setPaidOn] = useState(""); // Empty initially

  type Product = {
    description: string;
    hsnCode: string; // <-- Add this field
    qty: number;
    price: number; // 👈 Change this to a number
  };

  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const [sgst, setSgst] = useState(false);
  const [cgst, setCgst] = useState(false);
  const [igst, setIgst] = useState(false);

  const [sgstRate, setSgstRate] = useState(2.5);
  const [cgstRate, setCgstRate] = useState(2.5);
  const [igstRate, setIgstRate] = useState(5);
  // const [freightCharges, setFreightCharges] = useState(0);

  const totalAmount = products.reduce(
    (total, product) => total + product.qty * product.price,
    0
  );

  const sgstAmount = sgst ? totalAmount * (sgstRate / 100) : 0;
  const cgstAmount = cgst ? totalAmount * (cgstRate / 100) : 0;
  const igstAmount = igst ? totalAmount * (igstRate / 100) : 0;
  const totalTax = sgstAmount + cgstAmount + igstAmount;
  // const grandTotal = totalAmount + totalTax + freightCharges - discount;
  const grandTotal = totalAmount + totalTax;

  // // Fetch the last invoice number and auto-increment

  interface Invoice {
  invoiceNumber: string;
  // Add other fields if needed (e.g., billTo, invoiceDate, etc.)
}

// useEffect(() => {
//   const fetchLastInvoiceNumber = async () => {
//     try {
//       const invoicesRef = query(ref(db, "invoices"), orderByKey());
//       const snapshot = await get(invoicesRef);

//       let newInvoiceNumber = 1; // Default if no invoices exist
//       if (snapshot.exists()) {
//            const invoices = Object.values(snapshot.val()) as Invoice[]; // ✅ Typecasting Fix
//         const lastInvoice = invoices[invoices.length - 1]; // Get last invoice

//         if (lastInvoice && typeof lastInvoice.invoiceNumber === "string") {
//   const lastNumber = parseInt(lastInvoice.invoiceNumber.split("/").pop() || "0", 10);
//   newInvoiceNumber = lastNumber + 1;
// } else {
//   console.warn("Invalid invoiceNumber format:", lastInvoice?.invoiceNumber);
// }
//       }

//       // Generate formatted invoice number
//       const now = new Date();
//       const year = now.getFullYear();
//       const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
//       const formattedInvoiceNumber = `SSE/${year}/${month}-${String(newInvoiceNumber).padStart(4, "0")}`;
// console.log("Generated Invoice Number:", formattedInvoiceNumber); // Debugging
//       setInvoiceNumber(formattedInvoiceNumber);
//     } catch (error) {
//       console.error("Error fetching invoice number:", error);
//     }
//   };

//   fetchLastInvoiceNumber();
// }, []);
// useEffect(() => {
//   const fetchLastInvoiceNumber = async () => {
//     try {
//       const invoicesRef = query(ref(db, "invoices"), orderByKey());
//       const snapshot = await get(invoicesRef);

//       let newInvoiceNumber = 1; // Default if no invoices exist

//       // Get current year and month
//       const now = new Date();
//       const currentYear = now.getFullYear();
//       const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month

//       if (snapshot.exists()) {
//         const invoices = Object.values(snapshot.val()) as Invoice[];
//         const lastInvoice = invoices[invoices.length - 1]; // Get last invoice

//         if (lastInvoice && typeof lastInvoice.invoiceNumber === "string") {
//           const lastInvoiceParts = lastInvoice.invoiceNumber.split("/");
//           const lastYear = parseInt(lastInvoiceParts[1], 10); // Extract year
//           const lastMonth = lastInvoiceParts[2].split("-")[0]; // Extract month

//           if (lastYear === currentYear && lastMonth === currentMonth) {
//             // Same month → Increment the last invoice number
//             const lastNumber = parseInt(lastInvoiceParts[2].split("-")[1], 10) || 0;
//             newInvoiceNumber = lastNumber + 1;
//           } else {
//             // New month → Restart series from 0001
//             newInvoiceNumber = 1;
//           }
//         } else {
//           console.warn("Invalid invoiceNumber format:", lastInvoice?.invoiceNumber);
//         }
//       }

//       // Generate formatted invoice number
//       const formattedInvoiceNumber = `SSE/${currentYear}/${currentMonth}-${String(newInvoiceNumber).padStart(4, "0")}`;
//       console.log("Generated Invoice Number:", formattedInvoiceNumber); // Debugging
//       setInvoiceNumber(formattedInvoiceNumber);
//     } catch (error) {
//       console.error("Error fetching invoice number:", error);
//     }
//   };

//   fetchLastInvoiceNumber();
// }, []);
useEffect(() => {
  const fetchLastInvoiceNumber = async () => {
    try {
      const invoicesRef = query(ref(db, "invoices"), orderByKey());
      const snapshot = await get(invoicesRef);

      let newInvoiceNumber = 1; // Default if no invoices exist

      // Get current date and financial year
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-based month (Jan = 1, ..., Dec = 12)

      // Calculate financial year
      const financialYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
      const financialYearEnd = financialYearStart + 1;
      const financialYear = `${financialYearStart}-${financialYearEnd.toString().slice(-2)}`; // Format: 2024-25

      if (snapshot.exists()) {
        const invoices = Object.values(snapshot.val()) as Invoice[];
        const lastInvoice = invoices[invoices.length - 1]; // Get last invoice

        if (lastInvoice && typeof lastInvoice.invoiceNumber === "string") {
          const lastInvoiceParts = lastInvoice.invoiceNumber.split("/");
          const lastFY = lastInvoiceParts[1]; // Extract financial year
          const lastMonth = lastInvoiceParts[2].split("-")[0]; // Extract month

          if (lastFY === financialYear && lastMonth === String(currentMonth).padStart(2, "0")) {
            // Same financial year & month → Increment the last invoice number
            const lastNumber = parseInt(lastInvoiceParts[2].split("-")[1], 10) || 0;
            newInvoiceNumber = lastNumber + 1;
          } else {
            // New month → Restart series from 0001
            newInvoiceNumber = 1;
          }
        } else {
          console.warn("Invalid invoiceNumber format:", lastInvoice?.invoiceNumber);
        }
      }

      // Generate formatted invoice number with financial year
      const formattedInvoiceNumber = `SSE/${financialYear}/${String(currentMonth).padStart(2, "0")}-${String(newInvoiceNumber).padStart(4, "0")}`;
      console.log("Generated Invoice Number:", formattedInvoiceNumber); // Debugging
      setInvoiceNumber(formattedInvoiceNumber);
    } catch (error) {
      console.error("Error fetching invoice number:", error);
    }
  };

  fetchLastInvoiceNumber();
}, []);


  // Copy Billing Address to Shipping Address
  const handleCheckboxChange = () => {
    setSameAsBilling(!sameAsBilling);
    setShippingAddress(!sameAsBilling ? billingAddress : "");
        setSPhoneno(!sameAsBilling ? Phoneno : "");


 
  };

  const addProduct = () => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { description: "", hsnCode: "", qty: 1, price: 0 },
    ]);
  };

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  const updateProduct = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === "qty" || field === "price" ? Number(value) : value, // Ensure numbers are correctly parsed
      };
      return updatedProducts;
    });
  };

  // const totalAmount = products.reduce(
  //   (total, product) => total + product.qty * product.price,
  //   0
  // );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData = {
      invoiceNumber,
      billTo,
      Phoneno,
      billingAddress,
      shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
      SPhoneno,
      gstin,
      invoiceDate,
      products,
      createdAt: new Date().toISOString(),
      paymentStatus, // ✅ Add Payment Status
      paidOn: paymentStatus === "paid" ? paidOn : "", // ✅ Store as empty string instead of null
      // freightCharges, // ✅ Save Freight Charges
      taxes: {
        sgst: sgst ? sgstRate : 0,
        cgst: cgst ? cgstRate : 0,
        igst: igst ? igstRate : 0,
        totalTax,
        grandTotal,
      },
    };

    try {
      await push(ref(db, "invoices"), invoiceData); // Save to Firebase
      Swal.fire({
        title: "Invoice Created",
        text: `Invoice #${invoiceNumber} successfully saved.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => router.push("/invoices"));
    } catch (error) {
      console.error("Error saving invoice:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save invoice.",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8">Create New Invoice</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Number */}
            <div className="space-y-2">
              <Label className="text-gray-300">Invoice Number</Label>
              <Input
                value={invoiceNumber}
                readOnly
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>

            {/* Billing Information */}
            <div className="space-y-2">
              <Label className="text-gray-300">Bill To</Label>
              <Input
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Billing Address</Label>
              <Input
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>
                     <div className="space-y-2">
              <Label className="text-gray-300">Phone no</Label>
              <Input
                value={Phoneno}
                onChange={(e) => setPhoneno(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={sameAsBilling}
                onChange={handleCheckboxChange}
              />
              <Label className="text-gray-300">Same as Billing Address</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Shipping Address</Label>
              <Input
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
                disabled={sameAsBilling}
              />
            </div>

 <div className="space-y-2">
              <Label className="text-gray-300">Phone no</Label>
              <Input
                value={SPhoneno}
                onChange={(e) => setSPhoneno(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
                disabled={sameAsBilling}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">GSTIN</Label>
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                required
                className="bg-gray-700 text-white border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Invoice Date</Label>
          <input
  type="date"
  value={invoiceDate}
  onChange={(e) => setInvoiceDate(e.target.value)}
  className="bg-gray-700 text-white border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
     </div>
     

            {/* Products Section */}
            <h2 className="text-xl font-semibold text-white mt-6">Products</h2>
            <Table className="text-white border border-gray-600 mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>HSN CODE</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={product.description}
                        onChange={(e) =>
                          updateProduct(index, "description", e.target.value)
                        }
                        className="bg-gray-800 text-white border-gray-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={product.hsnCode}
                        onChange={(e) =>
                          updateProduct(index, "hsnCode", e.target.value)
                        }
                        className="bg-gray-800 text-white border-gray-600"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={product.qty}
                        onChange={(e) =>
                          updateProduct(index, "qty", Number(e.target.value))
                        }
                        className="bg-gray-800 text-white border-gray-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          updateProduct(index, "price", Number(e.target.value))
                        }
                        className="bg-gray-800 text-white border-gray-600"
                      />
                    </TableCell>
                    <TableCell>₹{product.qty * product.price}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => removeProduct(index)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              onClick={addProduct}
              className="bg-green-500 hover:bg-green-600 text-white mt-4"
            >
              + Add Product
            </Button>
            <h3 className="text-2xl font-bold text-white mt-4">
              Total: ₹{totalAmount}
            </h3>

            {/* tax section  */}
            {/* Taxes Section */}
            <div className="mt-4 space-y-2">
              <Label className="text-gray-300">Apply Taxes</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={sgst} onChange={() => setSgst(!sgst)} />
                  <Label className="text-gray-300">
                    SGST @{" "}
                    <Input
                      type="number"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(Number(e.target.value))}
                      className="bg-gray-800 text-white border-gray-600 w-16 inline-block"
                    />{" "}
                    %
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={cgst} onChange={() => setCgst(!cgst)} />
                  <Label className="text-gray-300">
                    CGST @{" "}
                    <Input
                      type="number"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(Number(e.target.value))}
                      className="bg-gray-800 text-white border-gray-600 w-16 inline-block"
                    />{" "}
                    %
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={igst} onChange={() => setIgst(!igst)} />
                  <Label className="text-gray-300">
                    IGST @{" "}
                    <Input
                      type="number"
                      value={igstRate}
                      onChange={(e) => setIgstRate(Number(e.target.value))}
                      className="bg-gray-800 text-white border-gray-600 w-16 inline-block"
                    />{" "}
                    %
                  </Label>
                </div>
              </div>
            </div>

            {/* Taxes end here */}
            {/* freight charges start here  */}
            <div className="space-y-4">
              {/* Freight Charges Section */}
              {/* <div className="space-y-2 relative group">
                <Label className="text-gray-300">Freight Charges</Label>
                <div className="flex items-center bg-gray-700 text-white border border-gray-600 w-28 rounded-md px-2 relative group">
                  <span className="text-gray-300">₹</span>
                  <Input
                    type="number"
                    value={freightCharges}
                    onChange={(e) => setFreightCharges(Number(e.target.value))}
                    className="bg-transparent text-white border-none focus:ring-0 w-full pl-1"
                  />
                </div> */}

              {/* Tooltip */}
              {/* <div className="absolute left-0 mt-1 w-40 bg-gray-800 text-gray-300 text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Enter the transportation cost for goods (in ₹).
                </div>
              </div> */}

              {/* Discount Section */}
              {/* <div className="space-y-2 relative group">
                <Label className="text-gray-300">Discount</Label>
                <div className="flex items-center bg-gray-700 text-white border border-gray-600 w-28 rounded-md px-2 relative group">
                  <span className="text-gray-300">%</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="bg-transparent text-white border-none focus:ring-0 w-full pl-1"
                  />
                </div>
              </div> */}
            </div>

            <h3 className="text-xl font-bold text-white">
              Total Tax: ₹{totalTax.toFixed(2)}
            </h3>
            <h3 className="text-2xl font-bold text-white">
              Grand Total (Including Tax): ₹{grandTotal.toFixed(2)}
            </h3>

            {/* Payment Status Section */}
            <div className="space-y-2 mt-6">
              <Label className="text-gray-300">Payment Status</Label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="bg-gray-700 text-white border-gray-600 p-2 rounded w-full"
              >
                <option value="due">Due</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Show "Paid On" only if payment is marked as Paid */}
            {paymentStatus === "paid" && (
              <div className="space-y-2 mt-4">
                <Label className="text-gray-300">Paid On</Label>
                <Input
                  type="date"
                  value={paidOn}
                  onChange={(e) => setPaidOn(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600"
                />
              </div>
            )}

            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              Create Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
