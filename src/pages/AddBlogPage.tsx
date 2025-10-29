import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { ArrowLeft, Tag, DollarSign, Cpu, Percent } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ProductFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const AddProductPage = ({ onSave, onCancel, isEdit }: ProductFormProps) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    model: "",
    gst: "",
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  // ✅ Fetch client data for edit mode
  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          setIsLoading(true);

          const token = JSON.parse(localStorage.getItem("Token") || "null");
          const { data } = await axios.get(`${baseURL}/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFormData({
            name: data.name || "",
            price: data.price || "",
            model: data.model || "",
            gst: data.gst || "",
          });
        } catch (error: any) {
          console.error("Error fetching products:", error);
          toast({
            title: "❌ Error",
            description:
              error?.response?.data?.message ||
              "Failed to load products details.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchClient();
    }
  }, [id, baseURL]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Product name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast({
        title: "⚠️ Invalid Price",
        description: "Please enter a valid positive number for price.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.model.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Product model is required.",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.gst ||
      isNaN(Number(formData.gst)) ||
      Number(formData.gst) < 0 ||
      Number(formData.gst) > 100
    ) {
      toast({
        title: "⚠️ Invalid GST",
        description: "Please enter a valid GST percentage between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      model: formData.model.trim(),
      gst: Number(formData.gst),
    };

    const token = JSON.parse(localStorage.getItem("Token") || "null");

    try {
      setIsLoading(true);

      if (id) {
        // Edit mode - Update existing product
        await axios.put(`${baseURL}/api/products/${id}`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        toast({
          title: "✅ Product Updated",
          description: "The product details have been updated successfully.",
        });
      } else {
        // Add mode - Create new product
        const res = await axios.post(`${baseURL}/api/products`, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });

        toast({
          title: "✅ Product Added",
          description: "The product has been added successfully.",
        });
      }
      navigate("/products");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="hover:bg-white/60 border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {id ? "Edit Product" : "Add New Product"}              
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Fill in the product’s details below
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    Product Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="h-12 rounded-lg"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Price
                  </Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="Enter product price"
                    className="h-12 rounded-lg"
                  />
                </div>

                {/* GST */}
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-amber-600" />
                    GST (%)
                  </Label>
                  <Input
                    type="number"
                    value={formData.gst}
                    onChange={(e) => handleChange("gst", e.target.value)}
                    placeholder="Enter GST percentage (e.g., 18)"
                    className="h-12 rounded-lg"
                  />
                </div>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label className="font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-600" />
                  Product Model
                </Label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="Enter product model"
                  className="h-12 rounded-lg"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md"
                >
                  💾 Save Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="flex-1 h-12 border-2 border-gray-300 rounded-lg font-semibold"
                >
                  ❌ Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
