import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  DollarSign,
  Cpu,
} from "lucide-react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { AddProductPage } from "./../pages/AddBlogPage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";


interface Product {
  id: string;
  name: string;
  price: number;
  model: string;
  gst: number;
}

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  // Fetch products from backend
  const fetchData = async (page = 1) => {
    try {
      const response = await axios.get(`${baseURL}/api/products`);
      const backendProducts = response.data.products || response.data;

      const normalizedProducts = backendProducts.map((product: any) => ({
        ...product,
        id: product._id,
      }));

      setProducts(normalizedProducts);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  // Add new product
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    fetchData(currentPage);
  };

  const handleView = (client: Product) => {
    setSelectedProduct(client);
    setIsViewOpen(true);
  };

  // Edit client details
  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.id}`, { state: { product } });
  };


  // Delete product
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${baseURL}/api/products/${id}`);
      toast({
        title: "🗑️ Deleted",
        description: "Product deleted successfully.",
      });
      fetchData(currentPage);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Routes>
      {/* ✅ Create Product Form */}
      <Route
        path="create"
        element={
          <AddProductPage
            onSave={addProduct}
            onCancel={() => navigate("/products")}
          />
        }
      />

      <Route
        path="edit/:id"
        element={
          <AddProductPage
            onSave={fetchData}
            onCancel={() => navigate("/products")}
            isEdit
          />
        }
      />

      {/* ✅ Product Management Dashboard */}
      <Route
        path="/"
        element={
          <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Product Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your products and track their inventory
                </p>
              </div>

              <Button
                onClick={() => navigate("create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </div>

            {/* Stats Section */}

            {/* ✅ Product Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Product List
                  </CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products by name..."
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
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">gst</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                          <tr
                            key={product.id}
                            className="border-b hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {product.name}
                            </td>
                            <td className="px-4 py-3">₹{product.price}</td>
                            <td className="px-4 py-3">{product.model}</td>
                            <td className="px-4 py-3">{product.gst}</td>
                            <td className="px-4 py-3 flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleEdit(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-slate-500 italic"
                          >
                            No products found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <Button
                    onClick={() => fetchData(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Prev
                  </Button>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => fetchData(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
              <DialogContent className="max-w-md rounded-2xl shadow-2xl border bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
                {selectedProduct && (
                  <>
                    <DialogHeader className="text-center pb-4 border-b">
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {selectedProduct.name}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Product Details
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4 text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Model</span>
                        <span className="text-right">{selectedProduct.model || "—"}</span>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Price</span>
                        <span className="text-right">₹{selectedProduct.price || "—"}</span>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">GST (%)</span>
                        <span className="text-right">{selectedProduct.gst || "—"}%</span>
                      </div>

                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Product ID</span>
                        <span className="text-right text-gray-500 text-sm">{selectedProduct.id}</span>
                      </div>
                    </div>

                    <DialogFooter className="flex justify-end mt-6">
                      <Button
                        variant="secondary"
                        onClick={() => setIsViewOpen(false)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

          </div>
        }
      />
    </Routes>
  );
};
