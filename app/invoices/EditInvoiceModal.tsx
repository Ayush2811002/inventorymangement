"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Receipt,
  Calendar,
  Phone,
  Building,
  CreditCard,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditInvoiceModal({
  open,
  onClose,
  invoice,
  onSave,
}: any) {
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (invoice) {
      const parsedProducts = Array.isArray(invoice.products)
        ? invoice.products
        : JSON.parse(invoice.products || "[]");

      const taxes = invoice.taxes || {};
      const { productTotal, taxes: updatedTaxes } = calculateTotals(
        parsedProducts,
        taxes
      );

      setFormData({
        ...invoice,
        products: parsedProducts,
        productTotal,
        taxes: updatedTaxes,
      });
    }
  }, [invoice]);

  const calculateTotals = (products: any[] = [], taxes: any = {}) => {
    const productTotal = products.reduce((sum: number, p: any) => {
      const qty = Number.parseFloat(p.qty || 0);
      const price = Number.parseFloat(p.price || 0);
      return sum + qty * price;
    }, 0);

    const sgst = Number.parseFloat(taxes.sgst || 0);
    const cgst = Number.parseFloat(taxes.cgst || 0);
    const igst = Number.parseFloat(taxes.igst || 0);
    const totalTax = sgst + cgst + igst;
    const grandTotal = productTotal + totalTax;

    return {
      productTotal,
      taxes: {
        ...taxes,
        sgst,
        cgst,
        igst,
        totalTax,
        grandTotal,
      },
    };
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };

      const products = field === "products" ? value : prev.products;
      const taxes = field === "taxes" ? value : prev.taxes;

      const { productTotal, taxes: updatedTaxes } = calculateTotals(
        products,
        taxes
      );

      return {
        ...updated,
        productTotal,
        taxes: updatedTaxes,
      };
    });
  };

  const handleProductChange = (index: number, key: string, value: any) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][key] = value;
    handleChange("products", updatedProducts);
  };

  const handleAddProduct = () => {
    const newProducts = [
      ...(formData.products || []),
      { description: "", hsnCode: "", price: 0, qty: 0 },
    ];
    handleChange("products", newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    handleChange("products", updatedProducts);
  };

  const handleSave = () => {
    try {
      onSave({ ...formData });
      onClose();
    } catch (err) {
      alert("Error saving invoice!");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border rounded-lg shadow-lg">
        <DialogHeader className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Edit Invoice
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start px-6 pt-4 bg-muted/20">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-background"
            >
              Basic Details
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-background"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="taxes"
              className="data-[state=active]:bg-background"
            >
              Tax & Totals
            </TabsTrigger>
          </TabsList>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <TabsContent value="details" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="invoiceNumber"
                    className="flex items-center gap-2"
                  >
                    <Receipt className="h-4 w-4" />
                    Invoice Number
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber || ""}
                    onChange={(e) =>
                      handleChange("invoiceNumber", e.target.value)
                    }
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billTo" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bill To
                  </Label>
                  <Input
                    id="billTo"
                    value={formData.billTo || ""}
                    onChange={(e) => handleChange("billTo", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="billingAddress"
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Billing Address
                </Label>
                <Input
                  id="billingAddress"
                  value={formData.billingAddress || ""}
                  onChange={(e) =>
                    handleChange("billingAddress", e.target.value)
                  }
                  className="transition-all focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone No
                  </Label>
                  <Input
                    id="phoneNo"
                    value={formData.Phoneno || ""}
                    onChange={(e) => handleChange("Phoneno", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    GSTIN
                  </Label>
                  <Input
                    id="gstin"
                    value={formData.gstin || ""}
                    onChange={(e) => handleChange("gstin", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="invoiceDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Invoice Date
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate || ""}
                    onChange={(e) =>
                      handleChange("invoiceDate", e.target.value)
                    }
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="billingDate"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Billing Date
                  </Label>
                  <Input
                    id="billingDate"
                    type="date"
                    value={formData.billingDate || ""}
                    onChange={(e) =>
                      handleChange("billingDate", e.target.value)
                    }
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidOn" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Paid On
                  </Label>
                  <Input
                    id="paidOn"
                    type="date"
                    value={formData.paidOn || ""}
                    onChange={(e) => handleChange("paidOn", e.target.value)}
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="paymentStatus"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Payment Status
                </Label>
                <Input
                  id="paymentStatus"
                  value={formData.paymentStatus || ""}
                  onChange={(e) =>
                    handleChange("paymentStatus", e.target.value)
                  }
                  className="transition-all focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products
                </h3>
                <Button
                  onClick={handleAddProduct}
                  className="bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </div>

              <AnimatePresence>
                {formData.products?.map((product: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <Badge className="absolute top-4 right-4 bg-slate-800">
                          Item {index + 1}
                        </Badge>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor={`product-desc-${index}`}>
                              Description
                            </Label>
                            <Input
                              id={`product-desc-${index}`}
                              value={product.description || ""}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="transition-all focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`product-hsn-${index}`}>
                              HSN Code
                            </Label>
                            <Input
                              id={`product-hsn-${index}`}
                              value={product.hsnCode || ""}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "hsnCode",
                                  e.target.value
                                )
                              }
                              className="transition-all focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`product-price-${index}`}>
                              Price
                            </Label>
                            <Input
                              id={`product-price-${index}`}
                              type="number"
                              value={product.price || 0}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "price",
                                  Number.parseFloat(e.target.value)
                                )
                              }
                              className="transition-all focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`product-qty-${index}`}>
                              Quantity
                            </Label>
                            <Input
                              id={`product-qty-${index}`}
                              type="number"
                              value={product.qty || 0}
                              onChange={(e) =>
                                handleProductChange(
                                  index,
                                  "qty",
                                  Number.parseInt(e.target.value)
                                )
                              }
                              className="transition-all focus:ring-2 focus:ring-slate-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm font-medium">
                            Subtotal:{" "}
                            {formatCurrency(
                              (product.price || 0) * (product.qty || 0)
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                            className="h-8 px-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(!formData.products || formData.products.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No products added yet. Click "Add Product" to get started.
                </div>
              )}

              {formData.products && formData.products.length > 0 && (
                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                  <CardContent className="p-4">
                    <div className="text-right font-medium">
                      Product Total:{" "}
                      {formatCurrency(formData.productTotal || 0)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="taxes" className="mt-0 space-y-6">
              <h3 className="text-lg font-medium mb-4">Tax Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sgst">SGST (%)</Label>
                  <Input
                    id="sgst"
                    type="number"
                    value={formData.taxes?.sgst || 0}
                    onChange={(e) =>
                      handleChange("taxes", {
                        ...formData.taxes,
                        sgst: Number.parseFloat(e.target.value),
                      })
                    }
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgst">CGST (%)</Label>
                  <Input
                    id="cgst"
                    type="number"
                    value={formData.taxes?.cgst || 0}
                    onChange={(e) =>
                      handleChange("taxes", {
                        ...formData.taxes,
                        cgst: Number.parseFloat(e.target.value),
                      })
                    }
                    className="transition-all focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="igst">IGST (%)</Label>
                <Input
                  id="igst"
                  type="number"
                  value={formData.taxes?.igst || 0}
                  onChange={(e) =>
                    handleChange("taxes", {
                      ...formData.taxes,
                      igst: Number.parseFloat(e.target.value),
                    })
                  }
                  className="transition-all focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <Separator className="my-4" />

              <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Product Total:
                      </span>
                      <span>{formatCurrency(formData.productTotal || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Tax:</span>
                      <span>
                        {formatCurrency(formData.taxes?.totalTax || 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Grand Total:</span>
                      <span className="text-slate-800 dark:text-white">
                        {formatCurrency(formData.taxes?.grandTotal || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t">
          <div className="flex justify-between w-full items-center">
            <div className="text-sm text-muted-foreground">
              {formData.products?.length || 0} product(s) | Total:{" "}
              {formatCurrency(formData.taxes?.grandTotal || 0)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-slate-800 hover:bg-slate-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
