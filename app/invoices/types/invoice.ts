// types/invoice.ts
export interface Product {
  description: string;
  hsnCode: string;
  price: number;
  qty: number;
}

export interface Taxes {
  sgst: number;
  cgst: number;
  igst: number;
  totalTax?: number;
  grandTotal?: number;
}

export interface Invoice {
  id: string;
  billTo: string;
  billingAddress: string;
  gstin: string;
  invoiceDate: string;
  billingDate: string;
  invoiceNumber: number;
  paidOn?: string;
  paymentStatus: string;
  products?: Product[];
  shippingAddress: string;
  grandTotal?: number;
}
