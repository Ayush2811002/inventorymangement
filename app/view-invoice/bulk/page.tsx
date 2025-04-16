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
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  useEffect(() => {
    const dataString = searchParams.get("data");
    if (dataString) {
      try {
        const rawInvoices: Partial<InvoiceData>[] = JSON.parse(decodeURIComponent(dataString));
        const parsedInvoices: InvoiceData[] = rawInvoices.map((parsedData) => {
          const products: Product[] = (parsedData.products as Partial<Product>[] || []).map((product) => ({
            qty: String(product.qty || 0),
            price: String(product.price || 0),
            description: product.description || "",
            hsnCode: product.hsnCode || "",
          }));

          const totalAmount = products.reduce(
            (total, product) => total + parseFloat(product.qty) * parseFloat(product.price),
            0
          );

          const sgstRate = parsedData.taxes?.sgst ?? 0;
          const cgstRate = parsedData.taxes?.cgst ?? 0;
          const igstRate = parsedData.taxes?.igst ?? 0;

          const sgstAmount = (sgstRate / 100) * totalAmount;
          const cgstAmount = (cgstRate / 100) * totalAmount;
          const igstAmount = (igstRate / 100) * totalAmount;
          const totalTax = sgstAmount + cgstAmount + igstAmount;
          const grandTotal = totalAmount + totalTax;

          return {
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
            },
            totalAmount,
          };
        });

        setInvoices(parsedInvoices);
      } catch (error) {
        console.error("Error parsing invoice data array:", error);
      }
    }
  }, [searchParams]);

  if (invoices.length === 0) {
    return <p>Loading invoices...</p>;
  }

return (
  <>
    {invoices.map((invoice, index) => (
      <Invoice key={invoice.id || index} {...invoice} />
    ))}
  </>
);

}
