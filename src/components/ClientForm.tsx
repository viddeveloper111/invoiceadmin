import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Landmark,
  Globe,
  Route,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ClientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const ClientForm = ({ onSave, onCancel, isEdit }: ClientFormProps) => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gstin: "",
    stateName: "",

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
          const { data } = await axios.get(`${baseURL}/api/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setFormData({
            name: data.name || "",
            address: data.address || "",
            gstin: data.gstin || "",
            stateName: data.stateName || "",
          });
        } catch (error: any) {
          console.error("Error fetching client:", error);
          toast({
            title: "❌ Error",
            description:
              error?.response?.data?.message ||
              "Failed to load client details.",
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

    // 🔍 Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Client address is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.stateName.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "State name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
      toast({
        title: "⚠️ Invalid GSTIN",
        description: "Please enter a valid 15-character GSTIN/UIN.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      address: formData.address,
      gstin: formData.gstin,
      stateName: formData.stateName,

    };

    const token = JSON.parse(localStorage.getItem("Token") || "null");

    try {
      setIsLoading(true);

      if (id) {
        // ✅ Update existing client
        await axios.put(`${baseURL}/api/clients/${id}`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        toast({
          title: "✅ Client Updated",
          description: "The client details have been updated successfully.",
        });
      } else {
        // ✅ Add new client
        const res = await axios.post(`${baseURL}/api/clients`, payload, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        });

        toast({
          title: "✅ Client Added",
          description: "The client has been added successfully.",
        });
      }
      navigate("/client");
      // onSave(res.data.data);
      // onCancel();
    } catch (error: any) {
      console.error("Error adding client:", error);
      toast({
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to add client. Please try again.",
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
            onClick={() => navigate("/client")}
            className="hover:bg-white/60 border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {id ? "Edit Client" : "Add New Client"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {id
                ? "Update the client’s business and contact details"
                : "Fill in the client’s business and contact details"}
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              {id ? "Edit Client Details" : "New Client Details"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Client Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter client name"
                    className="h-12 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-purple-600" />
                    GSTIN / UIN
                  </Label>
                  <Input
                    value={formData.gstin}
                    onChange={(e) => handleChange("gstin", e.target.value)}
                    placeholder="15-character GSTIN/UIN"
                    maxLength={15}
                    className="uppercase h-12 rounded-lg"
                  />
                </div>
              </div>

              {/* Address & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    Address
                  </Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    placeholder="Full client address"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    State Name
                  </Label>
                  <Input
                    value={formData.stateName}
                    onChange={(e) => handleChange("stateName", e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="h-12 rounded-lg"
                  />
                </div>
              </div>



              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md"
                >
                  {isLoading
                    ? "Saving..."
                    : id
                    ? "💾 Update Client"
                    : "💾 Save Client"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/client")}
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
