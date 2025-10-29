import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, TrendingUp, Eye, Pencil, Trash2 } from "lucide-react";
import { ClientForm } from "./ClientForm";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface Client {
  id: string;
  name: string;
  gstin: string;
  address: string;
  stateName: string;
}

export const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  // Fetch clients from backend
  const fetchData = async (page = 1) => {
    try {
      const response = await axios.get(`${baseURL}/api/clients`);
      const backendClients = response.data.clients || response.data;
      const normalizedClients = backendClients.map((client: any) => ({
        ...client,
        id: client._id,
      }));

      setClients(normalizedClients);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load clients.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  // Add new client
  const addClient = (newClient: Client) => {
    setClients((prevClients) => [newClient, ...prevClients]);
    fetchData(currentPage);
  };

  // Delete client
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(`${baseURL}/api/clients/${id}`);
      toast({
        title: "🗑️ Deleted",
        description: "Client deleted successfully.",
      });
      fetchData(currentPage);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "❌ Error",
        description: "Failed to delete client.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.length;
  const pendingPayments = 0;

  return (
    <Routes>
      {/* ✅ Create Client Form */}
      <Route
        path="create"
        element={
          <ClientForm
            onSave={addClient}
            onCancel={() => navigate("/clients")}
          />
        }
      />

      {/* ✅ Client Management Dashboard */}
      <Route
        path="/"
        element={
          <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Client Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your clients and track their progress
                </p>
              </div>

              <Button
                onClick={() => navigate("create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Client
              </Button>
            </div>

            {/* Stats Section */}
         

            {/* ✅ Client Table */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Client Directory
                  </CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search clients by name..."
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
                        <th className="px-4 py-3">Address</th>
                        <th className="px-4 py-3">GSTIN / UIN</th>
                        <th className="px-4 py-3">State</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client, index) => (
                          <tr
                            key={client.id}
                            className="border-b hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {client.name}
                            </td>
                            <td className="px-4 py-3">{client.address}</td>
                            <td className="px-4 py-3">{client.gstin || "—"}</td>
                            <td className="px-4 py-3">{client.stateName}</td>
                            <td className="px-4 py-3 flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  alert(JSON.stringify(client, null, 2))
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => alert(`Edit ${client.name}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(client.id)}
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
                            No clients found.
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
          </div>
        }
      />
    </Routes>
  );
};
