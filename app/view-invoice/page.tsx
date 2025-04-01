"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Invoice from "@/components/utils/invoice";

interface Product {
  qty: string;
  price: string;
  description: string;
  hsnCode: string;
}

interface Taxes {
  sgst: number;
  cgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
}

interface InvoiceData {
  id: string;
  billTo: string;
  billingAddress: string;
  Phoneno: number;
  SPhoneno: number;
  gstin: string;
  invoiceDate: string;
  invoiceNumber: number;
  paymentStatus: string;
  shippingAddress: string;
  products: Product[];
  taxes: Taxes;
  totalAmount: number;
}

export default function ViewInvoicePage() {
  const searchParams = useSearchParams();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const dataString = searchParams.get("data");
    if (dataString) {
      try {
        const parsedData: Partial<InvoiceData> = JSON.parse(decodeURIComponent(dataString));

        // Convert products to match the expected type
  // Convert products to match the expected type
const products: Product[] = (parsedData.products as Partial<Product>[] || []).map((product) => ({
  qty: String(product.qty || 0),
  price: String(product.price || 0),
  description: product.description || "",
  hsnCode: product.hsnCode || "",
}));


        // Calculate total amount
        const totalAmount = products.reduce(
          (total, product) => total + parseFloat(product.qty) * parseFloat(product.price),
          0
        );

        // Extract tax rates
        const sgstRate = parsedData.taxes?.sgst ?? 0;
        const cgstRate = parsedData.taxes?.cgst ?? 0;
        const igstRate = parsedData.taxes?.igst ?? 0;

        // Calculate taxes
        const sgstAmount = (sgstRate / 100) * totalAmount;
        const cgstAmount = (cgstRate / 100) * totalAmount;
        const igstAmount = (igstRate / 100) * totalAmount;
        const totalTax = sgstAmount + cgstAmount + igstAmount;
        const grandTotal = totalAmount + totalTax;

        // Set updated data with default values for missing fields
        setInvoiceData({
          id: parsedData.id || "",
          billTo: parsedData.billTo || "",
          billingAddress: parsedData.billingAddress || "",
          Phoneno: parsedData.Phoneno || 0,
          SPhoneno: parsedData.SPhoneno || 0,
          gstin: parsedData.gstin || "",
          invoiceDate: parsedData.invoiceDate || "",
          invoiceNumber: parsedData.invoiceNumber || 0,
          paymentStatus: parsedData.paymentStatus || "",
          shippingAddress: parsedData.shippingAddress || "",
          products,
          taxes: {
            sgst: sgstAmount,
            cgst: cgstAmount,
            igst: igstAmount,
            totalTax,
            grandTotal,
          }, // Ensures all fields are assigned
          totalAmount,
        });
      } catch (error) {
        console.error("Error parsing invoice data:", error);
      }
    }
  }, [searchParams]);

  if (!invoiceData) {
    return <p>Loading invoice...</p>;
  }

  return <Invoice {...invoiceData} />;
}



// "use client";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Invoice from "@/components/utils/invoice";

// export default function ViewInvoicePage() {
//   const searchParams = useSearchParams();
//   const [invoiceData, setInvoiceData] = useState<any>(null); // Change to a defined type if possible

//   useEffect(() => {
//     const dataString = searchParams.get("data");
//     if (dataString) {
//       try {
//         const parsedData = JSON.parse(decodeURIComponent(dataString));

//         if (!parsedData.products || parsedData.products.length === 0) {
//           console.warn("No products found in invoice data.");
//           return;
//         }

//         // Calculate total amount
//         const totalAmount = parsedData.products.reduce(
//           (total: number, product: { qty: number; price: number }) =>
//             total + product.qty * product.price,
//           0
//         );

//         // Extract and calculate taxes safely
//         const sgstRate = parsedData.taxes?.sgst || 0;
//         const cgstRate = parsedData.taxes?.cgst || 0;
//         const igstRate = parsedData.taxes?.igst || 0;

//         const sgstAmount = (sgstRate / 100) * totalAmount;
//         const cgstAmount = (cgstRate / 100) * totalAmount;
//         const igstAmount = (igstRate / 100) * totalAmount;
//         const totalTax = sgstAmount + cgstAmount + igstAmount;
//         const grandTotal = totalAmount + totalTax;

//         setInvoiceData({
//           ...parsedData,
//           taxes: {
//             sgst: sgstAmount,
//             cgst: cgstAmount,
//             igst: igstAmount,
//             totalTax,
//             grandTotal,
//           },
//           totalAmount,
//         });
//       } catch (error) {
//         console.error("Error parsing invoice data:", error);
//       }
//     }
//   }, [searchParams]);

//   if (!invoiceData) return <p>Loading invoice...</p>;

//   return <Invoice {...invoiceData} />;
// }
