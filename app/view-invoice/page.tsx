"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Import this hook
import Invoice from "@/components/utils/invoice";

export default function ViewInvoicePage() {
  const searchParams = useSearchParams();
  const [invoiceData, setInvoiceData] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    const dataString = searchParams.get("data");
    if (dataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataString));
        // Calculate total amount
        const totalAmount = parsedData.products.reduce(
          (total: number, product: { qty: number; price: number }) =>
            total + product.qty * product.price,
          0
        );

        // Extract tax rates
        const sgstRate = parsedData.taxes?.sgst || 0;
        const cgstRate = parsedData.taxes?.cgst || 0;
        const igstRate = parsedData.taxes?.igst || 0;

        // Calculate taxes
        const sgstAmount = (sgstRate / 100) * totalAmount;
        const cgstAmount = (cgstRate / 100) * totalAmount;
        const igstAmount = (igstRate / 100) * totalAmount;
        const totalTax = sgstAmount + cgstAmount + igstAmount;
        const grandTotal = totalAmount + totalTax;
        // Set updated data
        setInvoiceData({
          ...parsedData,
          taxes: {
            sgst: sgstAmount,
            cgst: cgstAmount,
            igst: igstAmount,
            totalTax,
            grandTotal,
          },
          totalAmount,
        });
      } catch (error) {
        console.error("Error parsing invoice data:", error);
      }
    }
  }, [searchParams]);

  if (!invoiceData || typeof invoiceData !== "object") {
    return <p>Loading invoice...</p>;
  }

  return <Invoice id={""} billTo={""} billingAddress={""} Phoneno={0} SPhoneno={0} gstin={""} invoiceDate={""} invoiceNumber={0} paymentStatus={""} shippingAddress={""} {...invoiceData} />;
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
