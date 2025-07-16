import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/use-toast";

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
import { useNavigate } from "react-router-dom";

interface ProjectProfileFormProps {
  onSave: () => void;
  onCancel: () => void;
  editData?: any;
}

export const ProjectLeadForm = ({
  onSave,
  onCancel,
  editData,
}: ProjectProfileFormProps) => {
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
    // skills: editData?.skills
    //   ? Array.isArray(editData.skills)
    //     ? editData.skills.join(", ")
    //     : editData.skills
    //   : "",
    // new ly so that skills should be at down
    skills: editData?.skills ?? [],

    description: editData?.description || "",
    // status: editData ? editData.status : "Active",
    status:
      editData && typeof editData.status === "string"
        ? editData.status
        : "Active",

    jdFile: editData?.jd || "",
    // teamName: editData?.actionDetails?.teamName || "",

    // new version of teamName it is array of string on enter add and x remove
    teamName: editData?.actionDetails?.teamName
      ? Array.isArray(editData.actionDetails.teamName)
        ? editData.actionDetails.teamName
        : [editData.actionDetails.teamName]
      : [],
  });

  // this is for the teamName enter and delte
  const handleTeamKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input && !formData.teamName.includes(input)) {
        setFormData((prev) => ({
          ...prev,
          teamName: [...prev.teamName, input],
        }));
        e.currentTarget.value = "";
      }
    }
  };

  const removeTeam = (teamToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      teamName: prev.teamName.filter((team) => team !== teamToRemove),
    }));
  };

  // this for the skill enter and delet
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget.value.trim();
      if (input && !formData.skills.includes(input)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, input],
        }));
        e.currentTarget.value = "";
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  useEffect(() => {
    const getAllClients = async () => {
      try {
        const response = await axios.get("https://api.vidhema.com/clients");
        setClients(response.data);
        console.log(
          "This is project getting  data through projectlead form page",
          response.data
        );
        console.log(response.data, "client data");
      } catch (error) {
        console.log("error", error);
      }
    };
    getAllClients();
  }, []);

  const navigate = useNavigate();

  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find(
      (client) => client.name === formData.clientName
    );
    if (!selectedClient) {
      console.log("Please select a client.");
      toast({
        title: " Enter the Client",
        description: "The Client has not been selected.",
      });
      return;
    }

    // Validate title
    if (!formData.title.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Project title is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate contact person
    if (!formData.contactPersonName.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Contact person name is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate follow-up date
    if (!formData.followUpDate) {
      toast({
        title: "⚠️ Missing Field",
        description: "Follow-up date is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate client budget
    if (!formData.clientBudget || isNaN(Number(formData.clientBudget))) {
      toast({
        title: "⚠️ Missing Field",
        description: "A valid client budget is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate description
    if (!formData.description.trim()) {
      toast({
        title: "⚠️ Missing Field",
        description: "Project description is required.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      clientId: selectedClient._id,
      title: formData.title,
      contactPersonName: formData.contactPersonName,
      // skills: formData.skills.split(",").map((skill: string) => skill.trim()),
      // enter based skill set
      skills: formData.skills,

      description: formData.description,
      // clientBudget: Number(formData.clientBudget.replace(/[^0-9.-]+/g, "")),
      clientBudget: Number(formData.clientBudget),
      status: formData.status,
      jd: formData.jdFile,
      actionDetails: {
        teamName: formData.teamName,
        followUpDate: formData.followUpDate,
      },
      proposalDescription: "", // ✅ <-- add this explicitly
    };

    // new
    // Logging payload fields with their types:
    console.log("Logging payload with types:", payload);
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "object" && value !== null) {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
        // If nested object, log its keys too
        for (const [subKey, subValue] of Object.entries(value)) {
          console.log(`  ${subKey}:`, subValue, `(type: ${typeof subValue})`);
        }
      } else {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
      }
    }

    try {
      if (editData) {
        const response = await axios.put(
          `https://api.vidhema.com/projects/${editData._id}`,
          payload
        );
        console.log("This is response data of edit", response.data);
        toast({
          title: "✅ Project Updated",
          description: "The project  was updated successfully.",
        });
      } else {
        const response = await axios.post(
          `http://localhost:3006/projects`,
          payload
        );
        toast({
          title: "✅ Project Created",
          description: "The new project  has been created.",
        });

        console.log("This is response data", response.data);
      }
      console.log("Payload", payload);

      onSave();
    } catch (error) {
      console.log("Failed to save project  profile");
      console.error(error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to save the project . Please try again.",
      });
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
            Back to Projects
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {editData ? "Edit Project Lead" : "Create New Lead"}
            </h1>
            <p className="text-gray-600 mt-1">
              Define Project requirements and track Project Progress
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Project Information Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Project Information
                    </h3>
                  </div>

                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => navigate("/clients/create")}
                  >
                    Add Client
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Project Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Food Delivery, Ecommerce"
                    className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
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
                    />
                  </div>
                </div>

                {/* old team section */}

                {/* <div className="space-y-2">
                  <Label
                    htmlFor="teamName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-green-600" />
                    Team
                  </Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleChange("teamName", e.target.value)}
                    placeholder="Enter Team name (if selected)"
                    className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  />
                </div> */}

                {/* new Team Section  */}
                <div className="space-y-2">
                  <Label
                    htmlFor="teamName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-green-600" />
                    Team (Press Enter to Add)
                  </Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name and press Enter"
                    onKeyDown={handleTeamKeyDown}
                    className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                  />

                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.teamName.map((team, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {team}
                        <button
                          type="button"
                          onClick={() => removeTeam(team)}
                          className="ml-2 text-green-500 hover:text-red-500 focus:outline-none"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Project Requirements
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="clientBudget"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      Budget
                    </Label>
                    <Input
                      id="clientBudget"
                      type="number"
                      value={formData.clientBudget}
                      onChange={(e) =>
                        handleChange("clientBudget", e.target.value)
                      }
                      placeholder="e.g. Rs 80,000"
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
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
                </div> */}

                {/* newly added skill set on the basis of the enter */}

                <div className="space-y-2">
                  <Label
                    htmlFor="skills"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Code className="h-4 w-4 text-indigo-600" />
                    Required Skills (Press Enter to Add)
                  </Label>

                  <Input
                    id="skills"
                    placeholder="e.g., React, TypeScript, AWS"
                    onKeyDown={handleSkillKeyDown}
                    className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  />

                  {/* Skills Tags Display */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    Project Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Detailed Project description, responsibilities, and requirements..."
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg resize-none"
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
                        Project Status
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
                          <SelectItem value="Lead Sent">
                            📤 Lead Sent
                          </SelectItem>
                          <SelectItem value="Meeting Scheduled">
                            📅 Meeting Scheduled
                          </SelectItem>
                          <SelectItem value="On Hold">⏸️ On Hold</SelectItem>
                          <SelectItem value="Closed">✅ Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Project Status
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
                      Project Description
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
                        {formData.jdFile ||
                          "Upload Project Description (PDF/DOC)"}
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
                  💾 {editData ? "Update Project " : "Create Project "}
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
