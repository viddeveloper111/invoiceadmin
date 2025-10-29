import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Invoice {
  _id: string;
  invoiceNo: string;
  date: string;
  clientId?: {
    name: string;
    gstin: string;
    address: string;
  };
  subTotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
}

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  // ✅ Fetch invoices
  const fetchInvoices = async (page = 1) => {
    try {
      const response = await axios.get(`${baseURL}/api/invoices/getAll`);
      const allInvoices = response.data.invoices || response.data;
      setInvoices(allInvoices);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load invoices.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, []);

  // ✅ Delete invoice
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`${baseURL}/api/invoices/delete/${id}`);
      toast({
        title: "🗑️ Deleted",
        description: "Invoice deleted successfully.",
      });
      fetchInvoices(currentPage);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    }
  };

  // ✅ View details popup
  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenDialog(true);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Routes>
      {/* ✅ Invoice List Page */}
      <Route
        path="/"
        element={
          <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Invoice Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your invoices and track billing details
                </p>
              </div>

              <Button
                onClick={() => navigate("/invoice/create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Invoice
              </Button>
            </div>

            {/* ✅ Invoice Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Invoice List
                  </CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by invoice no or client name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Invoice No</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Total (₹)</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice, index) => (
                          <tr
                            key={invoice._id}
                            className="border-b hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {invoice.invoiceNo}
                            </td>
                            <td className="px-4 py-3">
                              {invoice.date?.split("T")[0]}
                            </td>
                            <td className="px-4 py-3">
                              {invoice.clientId?.name || "-"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-green-700">
                              ₹{invoice.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => navigate(`/invoice/${invoice._id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(invoice._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-6 text-slate-500 italic"
                          >
                            No invoices found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <Button
                    onClick={() => fetchInvoices(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Prev
                  </Button>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => fetchInvoices(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ✅ View Invoice Popup */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Invoice Details</DialogTitle>
                </DialogHeader>
                {selectedInvoice ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Invoice No:</strong> {selectedInvoice.invoiceNo}</p>
                    <p><strong>Date:</strong> {selectedInvoice.date}</p>
                    <p><strong>Client:</strong> {selectedInvoice.clientId?.name}</p>
                    <p><strong>GSTIN:</strong> {selectedInvoice.clientId?.gstin}</p>
                    <p><strong>Address:</strong> {selectedInvoice.clientId?.address}</p>
                    <p><strong>Sub Total:</strong> ₹{selectedInvoice.subTotal.toFixed(2)}</p>
                    <p><strong>CGST:</strong> ₹{selectedInvoice.cgst.toFixed(2)}</p>
                    <p><strong>SGST:</strong> ₹{selectedInvoice.sgst.toFixed(2)}</p>
                    <p className="font-semibold text-lg text-green-700">
                      Total: ₹{selectedInvoice.totalAmount.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p>No invoice selected</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        }
      />
    </Routes>
  );
};
