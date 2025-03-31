import { Card } from "@/components/ui/card";
// import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/components/ui/final.png"; // Update the path accordingly
// import jsPDF from "jspdf";
import "jspdf-autotable"; // If you want tables to be formatted properly
// import { useRef } from "react";
// import { db } from "@/components/utils/firebaseConfig"; // Adjust path if needed
// import { ref, get } from "firebase/database";
// import { Download, Printer } from "lucide-react";  // Add Printer to imports
// import html2canvas from "html2canvas";
// import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui

<Image
  src={Logo}
  alt="Company Logo"
  width={50}
  height={50}
  className="object-contain invert"
/>;
type Invoice = {
  id: string;
  billTo: string;
  billingAddress: string;
  Phoneno: number;
  SPhoneno:number;
  gstin: string;
  invoiceDate: string;
  invoiceNumber: number;
  paidOn?: string;
  paymentStatus: string;
  products?: {
    qty: string;
    price: string;
    description: string;
    hsnCode: string;
  }[];
  shippingAddress: string;
  taxes?: {
    sgst: number;
    cgst: number;
    igst: number;
    totalTax: number;
    grandTotal: number;
  };
};
export default function Invoice({
  // id,
  billTo,
  billingAddress,
  Phoneno,
  SPhoneno,
  gstin,
  invoiceDate,
  invoiceNumber,
  // paidOn,
  // paymentStatus,
  products = [],
  shippingAddress,
  taxes,
}: Invoice) {
  // ✅ Fix: Calculate Total Amount
  const totalAmount = products.reduce(
    (total, product) => total + Number(product.qty) * Number(product.price),
    0
  );
  const grandTotal = taxes?.grandTotal || 0;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = (roundedTotal - grandTotal).toFixed(2);
  const numberToWords = require("number-to-words");

  const convertToIndianFormat = (num: number) => {
    if (num < 100000) {
      return numberToWords.toWords(num);
    }

    const lakhPart = Math.floor(num / 100000);
    const remaining = num % 100000;

    let words = numberToWords.toWords(lakhPart) + " Lakh";
    if (remaining > 0) {
      words += " " + numberToWords.toWords(remaining);
    }

    return words;
  };

  // ✅ Use `roundedTotal` instead of `taxes?.grandTotal`
  const grandTotalInWords =
    convertToIndianFormat(roundedTotal).replace(/\b\w/g, (c: string) =>
      c.toUpperCase()
    ) + " Rupees Only";

  return (


  <Card className="w-full max-w-4xl mx-auto p-4 print:p-2 print:shadow-none print:border-0 bg-white text-sm">

    {/* // <Card className="w-full max-w-4xl mx-auto p-4 print:p-2 print:shadow-none bg-white text-sm"> */}
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 border-b border-teal-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="">
            <Image src={Logo} alt="Company Logo" width={50} height={50} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-700">
              Shwetshree Enterprises
            </h1>
            <p className="text-xs text-gray-600">
              4th Floor, C-7 - 316C, Lawrence Road, Keshav Puram, Delhi - 110035
            </p>
            <p className="text-xs text-gray-600">Mobile: 9891811277</p>
            <p className="text-xs font-medium text-teal-600">
              GSTIN: 07BCOPS4422F1ZG
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-teal-700">Tax Invoice No.</p>
          <p className="text-sm font-bold text-teal-600">{invoiceNumber}</p>
        </div>
      </div>
      {/* Addresses */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div className="border rounded p-3 border-teal-200">
          <h2 className="text-sm font-semibold text-teal-700 mb-1">
            To :{billTo}
          </h2>

          <h2 className="text-sm font-semibold text-teal-700 mb-1">
            Billing Address
          </h2>
          <p className="text-xs text-gray-600 mb-1">{billingAddress}</p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">GSTIN:</span> {gstin}
          </p>
           <p className="text-xs text-gray-600">Phoneno:{Phoneno}</p>

        </div>
        <div className="border rounded p-3 border-teal-200">
          <h2 className="text-sm font-semibold text-teal-700 mb-1">
            To :{billTo}
          </h2>
          <h2 className="text-sm font-semibold text-teal-700 mb-1">
            Shipping Address
          </h2>
          <p className="text-xs text-gray-600 mb-1">{shippingAddress}</p>
          <p className="text-xs text-gray-600"><span className="font-semibold">GSTIN:</span> {gstin}</p>
             <p className="text-xs text-gray-600">Phoneno:{SPhoneno}</p>

        </div>
      </div>
      {/* Invoice Details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border rounded p-3 border-teal-200">
          <h3 className="text-xs font-medium text-teal-700 mb-1">
            Invoice Date
          </h3>
          <p className="text-xs text-gray-800">{invoiceDate}</p>
        </div>
        <div className="border rounded p-3 border-teal-200">
          <h3 className="text-xs font-medium text-teal-700 mb-1">
            Payment Terms
          </h3>
          <p className="text-xs text-gray-800">{}</p>
        </div>
        <div className="border rounded p-3 border-teal-200">
          <h3 className="text-xs font-medium text-teal-700 mb-1">Due Date</h3>
          <p className="text-xs text-gray-800">{}</p>
        </div>
      </div>
      {/* Items Table */}
      <div className="border rounded mb-4 overflow-x-auto border-teal-200 shadow-sm">
        <table className="w-full border-collapse border border-teal-300">
          <thead>
            <tr className="bg-teal-600 text-white border border-teal-300">
              <th className="p-3 text-sm font-semibold border-r border-teal-300 text-left">
                Description
              </th>
              <th className="p-3 text-sm font-semibold border-r border-teal-300 text-left">
                HSN Code
              </th>
              <th className="p-3 text-sm font-semibold border-r border-teal-300 text-center">
                Qty
              </th>
              <th className="p-3 text-sm font-semibold border-r border-teal-300 text-center">
                Unit Rate (₹)
              </th>
              <th className="p-3 text-sm font-semibold text-right">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr
                key={index}
                className={`border border-teal-300 ${
                  index % 2 === 0 ? "bg-teal-50" : "bg-white"
                }`}
              >
                <td className="p-3 text-sm text-gray-800 border-r border-teal-300">
                  {item.description}
                </td>
                <td className="p-3 text-sm text-gray-800 border-r border-teal-300">
                  {item.hsnCode}
                </td>
                <td className="p-3 text-sm text-center text-gray-800 border-r border-teal-300">
                  {item.qty}
                </td>
                <td className="p-3 text-sm text-center text-gray-800 border-r border-teal-300">
                  ₹{item.price ? Number(item.price).toFixed(2) : "0.00"}
                </td>
                <td className="p-3 text-sm text-right font-medium text-gray-900">
                  ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Thank You Message */}
      <div className="flex justify-between mb-4">
        <div className="text-xs italic text-gray-600">
          Thank you for your business!!
          <p className="text-xs text-gray-500 mt-2">E & O.E</p>
        </div>
        {/* Totals */}
        <div className="w-64">
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-teal-200 pt-2">
            <p className="text-gray-600">Total</p>
            <p className="text-right font-medium text-gray-800">
              ₹{totalAmount.toFixed(2)}
            </p>
            {/* <p className="text-gray-600">Freight Charges</p>
              <p className="text-right font-medium text-gray-800">
                ₹{freightCharges.toFixed(2)}
              </p> */}
            <p className="text-gray-600">SGST @ {}%</p>
            <p className="text-right font-medium text-gray-800">
              ₹{taxes?.sgst?.toFixed(2)}
            </p>
            <p className="text-gray-600">CGST @ {}%</p>
            <p className="text-right font-medium text-gray-800">
              ₹{taxes?.cgst?.toFixed(2)}
            </p>
            <p className="text-gray-600">IGST @ {}%</p>
            <p className="text-right font-medium text-gray-800">
              ₹{taxes?.igst?.toFixed(2)}
            </p>
            <p className="text-gray-600"> Total Taxes</p>
            <p className="text-right font-medium text-gray-800">
              ₹{taxes?.totalTax?.toFixed(2)}
            </p>
            <p className="font-semibold text-teal-700">
              Grand Total (Including Tax)
            </p>
            <p className="text-right font-bold text-teal-700">
              ₹{taxes?.grandTotal?.toFixed(2)}
            </p>
            <p className="text-gray-600">Round Off</p>
            <p className="text-right font-medium text-gray-800">₹{roundOff}</p>

            <p className="font-semibold text-teal-700">Grand Total (Rounded)</p>
            <p className="text-right font-bold text-teal-700">
              ₹{roundedTotal}
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-teal-200 pt-4">
        <p className="mb-3 text-xs text-gray-700">
          Amount in Words:{" "}
          <span className="font-medium">{grandTotalInWords}</span>
        </p>

        <div className="border-t border-teal-200 pt-3">
          <p className="text-right mb-3 italic text-xs text-gray-600">
            for Shwetshree Enterprises
          </p>
          <p className="text-xs font-semibold text-teal-700 mb-2">
            Please Make the Cheque in Favour of "Shwetshree Enterprises"
          </p>
          <p className="text-xs font-medium text-gray-700">
            <span className="font-bold"> RTGS/NEFT Details:</span>
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-bold">Bank Name:</span>
            <span className="font-bold">YES BANK</span>
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-bold"> Bank Account No:</span>{" "}
            <span className="font-bold">104726900000345</span>
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-bold"> IFSC Code:</span>{" "}
            <span className="font-bold">YESB0001047</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
