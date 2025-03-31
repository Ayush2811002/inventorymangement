"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "@/components/utils/firebaseConfig";
import { ref, get } from "firebase/database";
import * as XLSX from "xlsx";

interface Invoice {
  invoiceDate: string;
  paymentStatus: string;
  taxes?: {
    grandTotal?: number;
  };
}

export default function ReportsPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ name: string; revenue: number; pending: number }[]>([]);
  const [invoiceStatus, setInvoiceStatus] = useState<{ status: string; count: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await get(ref(db, "invoices"));
        const data = snapshot.val();

        if (data) {
          const invoices: Invoice[] = Object.values(data) as Invoice[];
          const revenueByMonth: { [key: string]: { revenue: number; pending: number } } = {};
          const statusCounts: { [key: string]: number } = { Paid: 0, Pending: 0 };
          let totalRevenueSum = 0;
          let totalPendingSum = 0;

          invoices.forEach((invoice) => {
            const month = new Date(invoice.invoiceDate).toLocaleString("en-US", { month: "short" });
            if (!revenueByMonth[month]) {
              revenueByMonth[month] = { revenue: 0, pending: 0 };
            }

            const grandTotal = invoice.taxes?.grandTotal || 0;
            if (invoice.paymentStatus.toLowerCase() === "paid") {
              revenueByMonth[month].revenue += grandTotal;
              totalRevenueSum += grandTotal;
              statusCounts.Paid += 1;
            } else if (invoice.paymentStatus.toLowerCase() === "pending") {
              revenueByMonth[month].pending += grandTotal;
              totalPendingSum += grandTotal;
              statusCounts.Pending += 1;
            }
          });

          setMonthlyRevenue(
            Object.keys(revenueByMonth).map((month) => ({
              name: month,
              revenue: revenueByMonth[month].revenue,
              pending: revenueByMonth[month].pending,
            }))
          );

          setInvoiceStatus([
            { status: "Paid", count: statusCounts.Paid },
            { status: "Pending", count: statusCounts.Pending },
          ]);

          setTotalRevenue(totalRevenueSum);
          setTotalPending(totalPendingSum);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchData();
  }, []);

  const downloadReport = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      ...monthlyRevenue.map((item) => ({
        Month: item.name,
        "Revenue (₹)": item.revenue,
        "Pending (₹)": item.pending,
      })),
      {},
      { Status: "Paid", Count: invoiceStatus.find((s) => s.status === "Paid")?.count || 0 },
      { Status: "Pending", Count: invoiceStatus.find((s) => s.status === "Pending")?.count || 0 },
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "Invoice_Report.xlsx");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8">Reports</h1>
      <Card className="bg-gray-800 border-gray-700 text-white p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-300">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xl text-red-400">Pending: ₹{totalPending.toLocaleString()}</p>
        </CardContent>
      </Card>
      <button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Download Report (Excel)
      </button>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-300">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                  <Bar dataKey="pending" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-300">Invoices by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {invoiceStatus.map((item) => (
                <li key={item.status} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.status}</span>
                  <span className="text-2xl font-bold">{item.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
