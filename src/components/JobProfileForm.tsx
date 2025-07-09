import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  Code,
  FileText,
  Users,
} from "lucide-react";

interface JobProfileFormProps {
  onSave: () => void;
  onCancel: () => void;
  editData?: any;
}

export const JobProfileForm = ({
  onSave,
  onCancel,
  editData,
}: JobProfileFormProps) => {
  const [clients, setClients] = useState<{ _id: string; name: string }[]>([]);
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const [formData, setFormData] = useState({
    title: editData?.title || "",
    clientName: editData?.clientId?.name || "",
    contactPersonName: editData?.contactPersonName || "",
    followUpDate: formatDate(editData?.actionDetails?.followUpDate || ""),
    clientBudget: editData?.clientBudget || "",
    skills: editData?.skills
      ? Array.isArray(editData.skills)
        ? editData.skills.join(", ")
        : editData.skills
      : "",
    description: editData?.description || "",
    status: editData ? editData.status : "Active",
    jdFile: editData?.jd || "",
    candidateName: editData?.actionDetails?.candidateName || "",
  });

  useEffect(() => {
    const getAllClients = async () => {
      try {
        const response = await axios.get("https://api.vidhema.com/clients");
        setClients(response.data);
        console.log(response.data, "client data");
      } catch (error) {
        console.log("error", error);
      }
    };
    getAllClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find(
      (client) => client.name === formData.clientName
    );
    if (!selectedClient) {
      console.log("Please select a client.");
      return;
    }

    const payload = {
      clientId: selectedClient._id,
      title: formData.title,
      contactPersonName: formData.contactPersonName,
      skills: formData.skills.split(",").map((skill: string) => skill.trim()),
      description: formData.description,
      // clientBudget: Number(formData.clientBudget.replace(/[^0-9.-]+/g, "")),
      clientBudget: Number(formData.clientBudget),
      status: formData.status,
      jd: formData.jdFile,
      actionDetails: {
        candidateName: formData.candidateName,
        followUpDate: formData.followUpDate,
      },
    };

    try {
      if (editData) {
        const response = await axios.put(
          `https://api.vidhema.com/updateJobProfile/${editData._id}`,
          payload
        );
      } else {
        const response = await axios.post(
          "https://api.vidhema.com/createJobProfile",
          payload
        );
      }
      onSave();
    } catch (error) {
      console.log("Failed to save job profile");
      console.error(error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, jdFile: file.name }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="hover:bg-white/60 backdrop-blur-sm border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Profiles
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {editData ? "Edit Job Profile" : "Create New Job Profile"}
            </h1>
            <p className="text-gray-600 mt-1">
              Define job requirements and track candidate progress
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Job Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Job Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Senior React Developer"
                    className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="clientName"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      Client Name
                    </Label>
                    <Select
                      value={formData.clientName}
                      onValueChange={(value) =>
                        handleChange("clientName", value)
                      }
                      required
                    >
                      <SelectTrigger
                        id="clientName"
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      >
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {clients.map((client) => (
                          <SelectItem key={client._id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactPersonName"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-blue-600" />
                      Contact Person
                    </Label>
                    <Input
                      id="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={(e) =>
                        handleChange("contactPersonName", e.target.value)
                      }
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="Primary contact person"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="candidateName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-green-600" />
                    Candidate Name
                  </Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e) =>
                      handleChange("candidateName", e.target.value)
                    }
                    placeholder="Enter candidate name (if selected)"
                    className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Job Details Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Job Requirements
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="followUpDate"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4 text-orange-600" />
                      Follow-up Date
                    </Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) =>
                        handleChange("followUpDate", e.target.value)
                      }
                      className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="clientBudget"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Budget Range
                    </Label>
                    <Input
                      id="clientBudget"
                      type="number"
                      value={formData.clientBudget}
                      onChange={(e) =>
                        handleChange("clientBudget", e.target.value)
                      }
                      placeholder="e.g., $80,000 - $100,000"
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="skills"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Code className="h-4 w-4 text-indigo-600" />
                    Required Skills (comma separated)
                  </Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    placeholder="e.g., React, TypeScript, Node.js, AWS"
                    className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    Job Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Detailed job description, responsibilities, and requirements..."
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg resize-none"
                    required
                  />
                </div>
              </div>

              {/* Status & Files Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Status & Documentation
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editData ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Job Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger
                          id="status"
                          className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Active">🟢 Active</SelectItem>
                          <SelectItem value="Profile Sent">
                            📤 Profile Sent
                          </SelectItem>
                          <SelectItem value="Interview Scheduled">
                            📅 Interview Scheduled
                          </SelectItem>
                          <SelectItem value="On Hold">⏸️ On Hold</SelectItem>
                          <SelectItem value="Closed">✅ Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Job Status
                      </Label>
                      <Input
                        id="title"
                        value="Active"
                        disabled
                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label
                      htmlFor="jdFile"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4 text-blue-600" />
                      Job Description File
                    </Label>
                    <div className="relative">
                      <Input
                        id="jdFile"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("jdFile")?.click()
                        }
                        className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 rounded-lg"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.jdFile || "Upload JD File (PDF/DOC)"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💾 {editData ? "Update Job Profile" : "Create Job Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition-all duration-200"
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
