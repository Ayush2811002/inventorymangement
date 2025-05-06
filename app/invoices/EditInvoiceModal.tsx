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
import { Box, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditInvoiceModal({
  open,
  onClose,
  invoice,
  onSave,
}: any) {
  const [formData, setFormData] = useState<any>({});

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
      const qty = parseFloat(p.qty || 0);
      const price = parseFloat(p.price || 0);
      return sum + qty * price;
    }, 0);

    const sgst = parseFloat(taxes.sgst || 0);
    const cgst = parseFloat(taxes.cgst || 0);
    const igst = parseFloat(taxes.igst || 0);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
            paddingTop: 2,
          }}
        >
          {/* Basic Fields */}
          <Box>
            <Label>Invoice Number</Label>
            <Input
              value={formData.invoiceNumber || ""}
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
            />
          </Box>
          <Box>
            <Label>Bill To</Label>
            <Input
              value={formData.billTo || ""}
              onChange={(e) => handleChange("billTo", e.target.value)}
            />
          </Box>
          <Box sx={{ gridColumn: "span 2" }}>
            <Label>Billing Address</Label>
            <Input
              value={formData.billingAddress || ""}
              onChange={(e) => handleChange("billingAddress", e.target.value)}
            />
          </Box>
          <Box>
            <Label>Phone No</Label>
            <Input
              value={formData.Phoneno || ""}
              onChange={(e) => handleChange("Phoneno", e.target.value)}
            />
          </Box>
          <Box>
            <Label>GSTIN</Label>
            <Input
              value={formData.gstin || ""}
              onChange={(e) => handleChange("gstin", e.target.value)}
            />
          </Box>

          {/* Dates */}
          <Box>
            <Label>Invoice Date</Label>
            <Input
              type="date"
              value={formData.invoiceDate || ""}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
            />
          </Box>
          <Box>
            <Label>Billing Date</Label>
            <Input
              type="date"
              value={formData.billingDate || ""}
              onChange={(e) => handleChange("billingDate", e.target.value)}
            />
          </Box>
          <Box>
            <Label>Paid On</Label>
            <Input
              type="date"
              value={formData.paidOn || ""}
              onChange={(e) => handleChange("paidOn", e.target.value)}
            />
          </Box>
          <Box>
            <Label>Payment Status</Label>
            <Input
              value={formData.paymentStatus || ""}
              onChange={(e) => handleChange("paymentStatus", e.target.value)}
            />
          </Box>

          {/* Products */}
          <Box sx={{ gridColumn: "span 2", mt: 3 }}>
            <Label>Products</Label>
            <Button
              variant="outline"
              onClick={handleAddProduct}
              className="mt-2"
            >
              + Add Product
            </Button>
          </Box>

          {formData.products?.map((product: any, index: number) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                padding: 2,
                position: "relative",
                gridColumn: "span 2",
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: "repeat(2, 1fr)",
                }}
              >
                <Box>
                  <Label>Description</Label>
                  <Input
                    value={product.description || ""}
                    onChange={(e) =>
                      handleProductChange(index, "description", e.target.value)
                    }
                  />
                </Box>
                <Box>
                  <Label>HSN Code</Label>
                  <Input
                    value={product.hsnCode || ""}
                    onChange={(e) =>
                      handleProductChange(index, "hsnCode", e.target.value)
                    }
                  />
                </Box>
                <Box>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={product.price || 0}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "price",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </Box>
                <Box>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={product.qty || 0}
                    onChange={(e) =>
                      handleProductChange(
                        index,
                        "qty",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </Box>
              </Box>
              <IconButton
                aria-label="delete"
                title="Remove Product"
                onClick={() => handleRemoveProduct(index)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "#f44336",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Tax Details */}
          <Box sx={{ gridColumn: "span 2", fontWeight: "bold", mt: 3 }}>
            Tax Details
          </Box>

          <Box>
            <Label>SGST</Label>
            <Input
              type="number"
              value={formData.taxes?.sgst || 0}
              onChange={(e) =>
                handleChange("taxes", {
                  ...formData.taxes,
                  sgst: parseFloat(e.target.value),
                })
              }
            />
          </Box>
          <Box>
            <Label>CGST</Label>
            <Input
              type="number"
              value={formData.taxes?.cgst || 0}
              onChange={(e) =>
                handleChange("taxes", {
                  ...formData.taxes,
                  cgst: parseFloat(e.target.value),
                })
              }
            />
          </Box>
          <Box>
            <Label>IGST</Label>
            <Input
              type="number"
              value={formData.taxes?.igst || 0}
              onChange={(e) =>
                handleChange("taxes", {
                  ...formData.taxes,
                  igst: parseFloat(e.target.value),
                })
              }
            />
          </Box>
          <Box>
            <Label>Total Tax</Label>
            <Input
              type="number"
              value={formData.taxes?.totalTax || 0}
              readOnly
            />
          </Box>
          <Box sx={{ gridColumn: "span 2" }}>
            <Label>Grand Total</Label>
            <Input
              type="number"
              value={formData.taxes?.grandTotal || 0}
              readOnly
            />
          </Box>
        </Box>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
