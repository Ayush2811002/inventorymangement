"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

const initialProducts: Product[] = [
  { id: 1, name: "Product A", quantity: 50, price: 19.99 },
  { id: 2, name: "Product B", quantity: 30, price: 29.99 },
  { id: 3, name: "Product C", quantity: 20, price: 39.99 },
];

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState({ name: "", quantity: "", price: "" });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: products.length + 1,
      name: newProduct.name,
      quantity: Number.parseInt(newProduct.quantity),
      price: Number.parseFloat(newProduct.price),
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", quantity: "", price: "" });

    // Show SweetAlert notification
    Swal.fire({
      title: "Product Added",
      text: `${product.name} has been successfully added to stock.`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8">Stock Management</h1>

      {/* Add Product Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="bg-gray-700 text-white border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  required
                  className="bg-gray-700 text-white border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="bg-gray-700 text-white border-gray-600"
                />
              </div>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Stock Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-900">
                <TableHead className="text-gray-400">Product Name</TableHead>
                <TableHead className="text-gray-400">Quantity</TableHead>
                <TableHead className="text-gray-400">Price</TableHead>
                <TableHead className="text-gray-400">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-700 transition-colors duration-200">
                  <TableCell className="font-medium text-white">{product.name}</TableCell>
                  <TableCell className="text-gray-300">{product.quantity}</TableCell>
                  <TableCell className="text-gray-300">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-300">${(product.quantity * product.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
// "use client";

// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Download } from "lucide-react";
// import { useRef } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import "../styles/invoice.css"; // Import CSS file directly

// export default function InvoicePDF() {
//   const invoiceRef = useRef<HTMLDivElement>(null);

//   const generatePDF = async () => {
//     if (!invoiceRef.current) return;

//     try {
//       // Add print-specific styles before generating PDF
//       document.body.classList.add("print-pdf");

//       const canvas = await html2canvas(invoiceRef.current, {
//         scale: 2, // Higher scale for better quality
//         logging: false,
//         useCORS: true,
//         backgroundColor: "#ffffff", // Ensure white background
//       });

//       document.body.classList.remove("print-pdf");

//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       });

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

//       const imgX = (pdfWidth - imgWidth * ratio) / 2;
//       const imgY = 0;

//       pdf.addImage(
//         imgData,
//         "PNG",
//         imgX,
//         imgY,
//         imgWidth * ratio,
//         imgHeight * ratio
//       );
//       pdf.save("invoice.pdf");
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };

//   const items = [
//     {
//       description: "Product 1",
//       hsnCode: "12345",
//       quantity: 2,
//       unitRate: 100,
//       amount: 200,
//     },
//     {
//       description: "Product 2",
//       hsnCode: "67890",
//       quantity: 1,
//       unitRate: 50,
//       amount: 50,
//     },
//   ];

//   return (
//     <div className="p-4 invoice-container">
//       <Button onClick={generatePDF} className="download-button">
//         <Download className="w-4 h-4 mr-2" />
//         Download PDF
//       </Button>

//       <div ref={invoiceRef} className="invoice-container">
//         <Card className="invoice-card">
//           {/* Header */}
//           <div className="flex items-start justify-between mb-6 gap-4 border-b border-teal-200 pb-4">
//             <div className="flex items-center gap-3">
//               <div className=""></div>
//               <div>
//                 <h1 className="text-xl font-bold text-teal-700">
//                   Shwetshree Enterprises
//                 </h1>
//                 <p className="text-xs text-gray-600">
//                   4th Floor, C-7 - 316C, Lawrence Road, Keshav Puram, Delhi -
//                   110035
//                 </p>
//                 <p className="text-xs text-gray-600">Mobile: 9891811277</p>
//                 <p className="text-xs font-medium text-teal-600">
//                   GSTIN: 07BCOPS4422F1ZG
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-semibold text-teal-700">INVOICE NO.</p>
//               <p className="text-sm font-bold text-teal-600">{}</p>
//             </div>
//           </div>

//           {/* Addresses */}
//           <div className="grid md:grid-cols-2 gap-3 mb-4">
//             <div className="border rounded p-3 border-teal-200">
//               <h2 className="text-sm font-semibold text-teal-700 mb-1">
//                 Billing Address
//               </h2>
//               <p className="text-xs text-gray-600 mb-1">{}</p>
//               <p className="text-xs text-gray-600">
//                 <span className="font-semibold">GSTIN:</span> {}
//               </p>
//             </div>
//             <div className="border rounded p-3 border-teal-200">
//               <h2 className="text-sm font-semibold text-teal-700 mb-1">
//                 Shipping Address
//               </h2>
//               <p className="text-xs text-gray-600 mb-1">{}</p>
//               <p className="text-xs text-gray-600">GSTIN:{}</p>
//             </div>
//           </div>

//           {/* Invoice Details */}
//           <div className="grid grid-cols-3 gap-3 mb-4">
//             <div className="border rounded p-3 border-teal-200">
//               <h3 className="text-xs font-medium text-teal-700 mb-1">
//                 Invoice Date
//               </h3>
//               <p className="text-xs text-gray-800">{}</p>
//             </div>
//             <div className="border rounded p-3 border-teal-200">
//               <h3 className="text-xs font-medium text-teal-700 mb-1">
//                 Payment Terms
//               </h3>
//               <p className="text-xs text-gray-800">{}</p>
//             </div>
//             <div className="border rounded p-3 border-teal-200">
//               <h3 className="text-xs font-medium text-teal-700 mb-1">
//                 Due Date
//               </h3>
//               <p className="text-xs text-gray-800">{}</p>
//             </div>
//           </div>

//           {/* Items Table */}
//           <div className="border rounded mb-4 overflow-x-auto border-teal-200 shadow-sm">
//             <table className="w-full border-collapse border border-teal-300">
//               <thead>
//                 <tr className="bg-teal-600 text-white border border-teal-300">
//                   <th className="p-3 text-sm font-semibold border-r border-teal-300 text-left">
//                     Description
//                   </th>
//                   <th className="p-3 text-sm font-semibold border-r border-teal-300 text-left">
//                     HSN Code
//                   </th>
//                   <th className="p-3 text-sm font-semibold border-r border-teal-300 text-center">
//                     Qty
//                   </th>
//                   <th className="p-3 text-sm font-semibold border-r border-teal-300 text-center">
//                     Unit Rate (₹)
//                   </th>
//                   <th className="p-3 text-sm font-semibold text-right">
//                     Amount (₹)
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, index) => (
//                   <tr
//                     key={index}
//                     className={`border border-teal-300 ${
//                       index % 2 === 0 ? "bg-teal-50" : "bg-white"
//                     }`}
//                   >
//                     <td className="p-3 text-sm text-gray-800 border-r border-teal-300">
//                       {item.description}
//                     </td>
//                     <td className="p-3 text-sm text-gray-800 border-r border-teal-300">
//                       {item.hsnCode}
//                     </td>
//                     <td className="p-3 text-sm text-center text-gray-800 border-r border-teal-300">
//                       {item.quantity}
//                     </td>
//                     <td className="p-3 text-sm text-center text-gray-800 border-r border-teal-300">
//                       ₹{item.unitRate.toFixed(2)}
//                     </td>
//                     <td className="p-3 text-sm text-right font-medium text-gray-900">
//                       {item.amount.toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Thank You Message */}
//           <div className="flex justify-between mb-4">
//             <div className="text-xs italic text-gray-600">
//               Thank you for your business!!
//               <p className="text-xs text-gray-500 mt-2">E & O.E</p>
//             </div>
//             {/* Totals */}
//             <div className="w-64">
//               <div className="grid grid-cols-2 gap-2 text-xs border-t border-teal-200 pt-2">
//                 <p className="text-gray-600">Total</p>
//                 <p className="text-right font-medium text-gray-800">₹250.00</p>
//                 <p className="text-gray-600">Grand Total</p>
//                 <p className="text-right font-medium text-gray-800">₹250.00</p>
//                 <p className="text-gray-600">SGST @ 9%</p>
//                 <p className="text-right font-medium text-gray-800">₹22.50</p>
//                 <p className="text-gray-600">CGST @ 9%</p>
//                 <p className="text-right font-medium text-gray-800">₹22.50</p>
//                 <p className="text-gray-600">IGST @ 0%</p>
//                 <p className="text-right font-medium text-gray-800">₹0.00</p>
//                 <p className="font-semibold text-teal-700">
//                   Grand Total (Including Tax)
//                 </p>
//                 <p className="text-right font-bold text-teal-700">₹295.00</p>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="border-t border-teal-200 pt-4">
//             <p className="mb-3 text-xs text-gray-700">
//               Amount in Words:{" "}
//               <span className="font-medium">
//                 Two Hundred Ninety Five Rupees Only
//               </span>
//             </p>

//             <div className="border-t border-teal-200 pt-3">
//               <p className="text-right mb-3 italic text-xs text-gray-600">
//                 for Shwetshree Enterprises
//               </p>
//               <p className="text-xs font-semibold text-teal-700 mb-2">
//                 Please Make the Cheque in Favour of "Shwetshree Enterprises"
//               </p>
//               <p className="text-xs font-medium text-gray-700">Bank details:</p>
//               <p className="text-xs text-gray-600">Bank Name: YES BANK</p>
//               <p className="text-xs text-gray-600">
//                 Bank Account No: 104726900000345
//               </p>
//               <p className="text-xs text-gray-600">IFSC Code: YESB0001047</p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
