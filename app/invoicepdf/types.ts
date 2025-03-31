export type Invoice = {
  id: string;
  billTo: string;
  billingAddress: string;
  gstin: string;
  Phoneno: number;
  SPhoneno: number;
  invoiceDate: string;
  invoiceNumber: number;
  paidOn?: string;
  paymentStatus: string;
  products?: { qty: number; price: number }[];
  shippingAddress: string;
};
