// import jsPDF from "jspdf";
// import Swal from "sweetalert2";
// import { get, ref } from "firebase/database";
// import { db } from "@/components/utils/firebaseConfig";

// // Invoice Type Definition
// type Invoice = {
//   id: string;
//   billTo: string;
//   billingAddress: string;
//   gstin: string;
//   invoiceDate: string;
//   invoiceNumber: number;
//   paidOn?: string;
//   paymentStatus: string;
//   products?: { qty: string; price: string; description: string; hsnCode: string }[];
//   shippingAddress: string;
// };

// const handleViewInvoice = async (invoiceId: string) => {
//   try {
//     const snapshot = await get(ref(db, `invoices/${invoiceId}`)); // Fetch invoice from Firebase
//     const invoice: Invoice | null = snapshot.val();

//     if (!invoice) {
//       Swal.fire("Error", "Invoice not found!", "error");
//       return;
//     }

//     // Ensure proper calculations
//     const amount = invoice.products
//       ? invoice.products.reduce((total: number, p: { qty: string; price: string }) => 
//           total + Number(p.qty) * Number(p.price), 0
//         ).toFixed(2)
//       : "0.00";

//     Swal.fire({
//       title: `Invoice #${invoice.invoiceNumber}`,
//       html: `
//         <div style='text-align: left'>
//           <p><strong>Client Name:</strong> ${invoice.billTo}</p>
//           <p><strong>Billing Address:</strong> ${invoice.billingAddress}</p>
//           <p><strong>GSTIN:</strong> ${invoice.gstin}</p>
//           <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
//           <p><strong>Payment Status:</strong> ${invoice.paymentStatus}</p>
//           <p><strong>Amount:</strong> ₹${amount}</p>
//         </div>
//       `,
//       showCancelButton: true,
//       confirmButtonText: "Download PDF",
//       cancelButtonText: "Close",
//     });
//   } catch (error) {
//     console.error("Error fetching invoice:", error);
//     Swal.fire("Error", "Failed to fetch invoice details.", "error");
//   }
// };

// export { handleViewInvoice };
import Swal from "sweetalert2";
import { get, ref } from "firebase/database";
import { db } from "@/components/utils/firebaseConfig";

const handleViewInvoice = async (invoiceId: string) => {
  try {
    // Fetch invoice data from Firebase
    const snapshot = await get(ref(db, `invoices/${invoiceId}`));
    const invoice = snapshot.val();

    if (!invoice) {
      Swal.fire("Error", "Invoice not found!", "error");
      return;
    }

    // Display the invoice details in a SweetAlert modal
    Swal.fire({
      title: `Invoice #${invoice.invoiceNumber}`,
      html: `
        <div style='text-align: left'>
          <p><strong>Client Name:</strong> ${invoice.billTo || "N/A"}</p>
          <p><strong>Billing Address:</strong> ${invoice.billingAddress || "N/A"}</p>
          <p><strong>GSTIN:</strong> ${invoice.gstin || "N/A"}</p>
          <p><strong>Invoice Date:</strong> ${invoice.invoiceDate || "N/A"}</p>
          <p><strong>Payment Status:</strong> ${invoice.paymentStatus || "N/A"}</p>
          <p><strong>Amount:</strong> ₹${invoice.products
          ? invoice.products.reduce((total: number, p: { qty: string; price: string }) => total + Number(p.qty) * Number(p.price), 0).toFixed(2)
          : "0.00"}
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      cancelButtonText: "Close",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Fetch updated invoice data again before opening the template
          const updatedSnapshot = await get(ref(db, `invoices/${invoiceId}`));
          const updatedInvoice = updatedSnapshot.val();

          if (!updatedInvoice) {
            Swal.fire("Error", "Invoice data could not be retrieved.", "error");
            return;
          }

          // Convert the invoice data to a URL-friendly string
          const invoiceDataString = encodeURIComponent(JSON.stringify(updatedInvoice));

          // Open a new window for viewing/downloading the invoice
          const newWindow = window.open(
            `/view-invoice?data=${invoiceDataString}`,
            "_blank",
            "width=800,height=600"
          );

          if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
            Swal.fire({
              icon: "warning",
              title: "Popup Blocked",
              text: "Please allow popups for this site in your browser settings.",
            });
          }
        } catch (error) {
          console.error("Error fetching updated invoice:", error);
          Swal.fire("Error", "Failed to fetch updated invoice details.", "error");
        }
      }
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    Swal.fire("Error", "Failed to fetch invoice details.", "error");
  }
};

export { handleViewInvoice }
