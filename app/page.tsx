"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, FileText, TrendingUp } from "lucide-react";
import { db } from "@/components/utils/firebaseConfig";
import { ref, get } from "firebase/database";

export default function Dashboard() {
  const [totalInvoices, setTotalInvoices] = useState(0);

const [totalRevenue, setTotalRevenue] = useState(0);
const [pendingInvoices, setPendingInvoices] = useState(0);

useEffect(() => {
  const fetchInvoiceData = async () => {
    try {
      const snapshot = await get(ref(db, "invoices"));
      const data = snapshot.val();

      if (data && typeof data === "object") {
        // Convert object to an array & type it explicitly
        const invoices = Object.values(data) as { paymentStatus?: string; taxes?: { grandTotal?: number } }[];

        // Count total invoices
        setTotalInvoices(invoices.length);

        // Count pending invoices
const pendingCount = invoices.filter(invoice => invoice.paymentStatus?.toLowerCase() === "pending").length;

        setPendingInvoices(pendingCount);

        // Calculate total revenue from paid invoices
        const revenue = invoices
          .filter(invoice => invoice.paymentStatus === "paid")
          .reduce((sum, invoice) => sum + (invoice.taxes?.grandTotal ?? 0), 0);
          
        setTotalRevenue(revenue);
      } else {
        setTotalInvoices(0);
        setPendingInvoices(0);
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  fetchInvoiceData();
}, []);
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Total Invoices", value: totalInvoices.toString(), icon: FileText, change: "+2 from last month" },
{ title: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee, change: "+20.1% from last month" },


           { title: "Pending Invoices", value: pendingInvoices.toString(), icon: TrendingUp, change: "-3 from last month" },
        ].map((item, index) => (
          <Card
            key={index}
            className="bg-gray-800 border-gray-700 text-white hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-gray-400">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
