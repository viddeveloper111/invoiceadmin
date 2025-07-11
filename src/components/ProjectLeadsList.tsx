import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Calendar, Send, Users, Clock, X } from "lucide-react";
import { IndianRupee } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

// interface SentProfile {
//   candidateName: string;
//   sentDate: string;
//   _id?: string;
// }

interface ActionDetails {
  inboxType?: "employee" | "candidate";
  employeeId?: string;
  // teamName?: string | null;

  // new
  teamName?: string[]; // ✅ Now an array of strings
  markAsSend?: boolean;
  followUpDate?: string;
}

interface InterviewActionDetails {
  proceedToInterview?: boolean;
  interviewDateTime?: string;
  markAsClose?: boolean;
}

// Main ProjectProfile interface
interface ProjectProfile {
  _id: string;
  clientId: PopulatedClientDetails;
  title: string;
  contactPersonName: string;
  skills: string[];
  description: string;
  clientBudget: number;
  status: string;
  jd?: string;
  proposalDescription: string;
  actionDetails?: ActionDetails;
  interviewActionDetails?: InterviewActionDetails;
  // sentProfiles?: SentProfile[];

  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProjectProfileListProps {
  projects: ProjectProfile[];
  onUpdate: (projects: ProjectProfile[]) => void;
  onEdit: (projects: ProjectProfile) => void;
}

export const ProjectLeadList = ({
  projects,
  onUpdate,
  onEdit,
}: ProjectProfileListProps) => {
  const [editingFollowup, setEditingFollowup] = useState<string | null>(null);
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [sendProfileDialog, setSendProfileDialog] = useState<string | null>(
    null
  );
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [sendDateTime, setSendDateTime] = useState("");
  const [scheduleInterview, setScheduleInterview] = useState<string | null>(
    null
  );
  const [interviewDate, setInterviewDate] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");

  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Lead Sent":
        return "bg-blue-100 text-blue-800";
      case "Meeting Scheduled":
        return "bg-purple-100 text-purple-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;

  const updateFollowupDate = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:3006/projects/${id}`,
        {
          "actionDetails.followUpDate": newFollowupDate,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`http://localhost:3006/projects`);

      onUpdate(response.data);
      setEditingFollowup(null);
      setNewFollowupDate("");
      console.log(
        "Getting all the  updateFollow Update function lates project detail throug project lis page",
        response.data
      );
      toast({
        title: "Follow-up Updated",
        description: "The follow-up date has been successfully updated.",
      });
    } catch (error) {
      console.log("Error updating Followup Date", error);
      toast({
        title: "Update Failed",
        description: "Failed to update follow-up date. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const sendProfileToClient = async (id: string) => {
  //   if (!selectedCandidate || !sendDateTime) {
  //     toast({
  //       title: "Missing Fields",
  //       description: "Please enter both Client name and send date.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   try {
  //     await axios.put(
  //       `http://localhost:3006/projects/${id}`,
  //       {
  //         status: "Lead Sent",
  //         "actionDetails.markAsSend": true,
  //         "actionDetails.teamName": selectedCandidate,
  //         "actionDetails.followUpDate": sendDateTime,
  //       },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     // Fetch the latest profiles from the backend
  //     const response = await axios.get(`http://localhost:3006/projects`);

  //     onUpdate(response.data);
  //     setSendProfileDialog(null);
  //     setSelectedCandidate("");
  //     setSendDateTime("");
  //     console.log(
  //       "This is sendprofile to client function data in project list ",
  //       response.data
  //     );
  //     toast({
  //       title: "Proposal Sent",
  //       description: `${selectedCandidate}'s profile has been sent to the client.`,
  //     });
  //   } catch (error) {
  //     console.log("Error updating sent profile to client", error);
  //     toast({
  //       title: "Failed to Send Proposal",
  //       description: "There was an issue sending the proposal. Try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // update the SendProposal Description
  const sendProposalDescription = async (id: string) => {
    if (!proposalDescription || !sendDateTime) {
      toast({
        title: "Missing Fields",
        description: "Please enter both proposal description and send date.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Let's say you already have the existing project data
      const existingProject = await axios.get(
        `http://localhost:3006/projects/${id}`
      );

      const existingTeamName =
        existingProject.data?.actionDetails?.teamName || [];

      const payload = {
        status: "Lead Sent",
        proposalDescription: proposalDescription,
        actionDetails: {
          markAsSend: true,
          followUpDate: sendDateTime,
          teamName: existingTeamName, // ✅ Preserve previous value
        },
      };

      await axios.put(
        `http://localhost:3006/projects/${id}`,

        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("proposal", proposalDescription);
      // Fetch the latest profiles from the backend
      const response = await axios.get(`http://localhost:3006/projects`);

      onUpdate(response.data);
      setSendProfileDialog(null);
      setProposalDescription("");
      setSendDateTime("");
      console.log("This is sendprofile to client function data in project list ", response.data
      );
      toast({
        title: "Proposal Sent",
        description: `${selectedCandidate}'s profile has been sent to the client.`,
      });
    } catch (error) {
      console.log("Error updating sent profile to client", error);
      toast({
        title: "Failed to Send Proposal",
        description: "There was an issue sending the proposal. Try again.",
        variant: "destructive",
      });
    }
  };
  const scheduleInterviewForProject = async (id: string) => {
    if (!interviewDate) {
      toast({
        title: "Missing Date",
        description: "Please select a meeting date and time.",
        variant: "destructive",
      });
      return;
    }
    try {
      await axios.put(
        `http://localhost:3006/projects/${id}`,
        {
          "interviewActionDetails.interviewDateTime": interviewDate,
          "interviewActionDetails.proceedToInterview": true,
          status: "Meeting Scheduled",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`http://localhost:3006/projects`);
      onUpdate(response.data);
      setScheduleInterview(null);
      setInterviewDate("");
      console.log(
        "This is project latest data through backend projectlead list page",
        response.data
      );
      toast({
        title: "Meeting Scheduled",
        description: "The meeting has been successfully scheduled.",
      });
    } catch (error) {
      console.error("Error updating schedule interview:", error);
      toast({
        title: "Schedule Failed",
        description: "There was an error scheduling the meeting.",
        variant: "destructive",
      });
    }
  };

  const closeProject = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:3006/projects/${id}`,
        { status: "Closed" },
        { headers: { "Content-Type": "application/json" } }
      );

      // Fetch the latest profiles from the backend
      const response = await axios.get(`http://localhost:3006/projects`);
      onUpdate(response.data); // Update UI with fresh data
      console.log(
        "this is closeproject in list page of project",
        response.data
      );
      toast({
        title: "Project Closed",
        description: "This project has been marked as closed.",
      });
      console.log("Project status updated to Closed");
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Close Failed",
        description: "Failed to close the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Client</p>
                    <p className="text-xs">{project.clientId.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {/* <IndianRupee className="h-3 w-3 text-green-600" /> */}
                      <p className="font-medium text-gray-900">Budget</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <span className="text-base font-normal">₹</span>
                      <p className="text-base text-gray-900">
                        {project.clientBudget}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Follow-up Date</p>
                    <div className="flex items-center gap-2">
                      {editingFollowup === project._id ? (
                        <div className="flex gap-1">
                          <Input
                            type="date"
                            value={newFollowupDate}
                            onChange={(e) => setNewFollowupDate(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateFollowupDate(project._id)}
                            className="h-8 px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingFollowup(null)}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {new Date(
                              project.actionDetails.followUpDate
                            ).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFollowup(project._id);
                              setNewFollowupDate(
                                project.actionDetails.followUpDate
                              );
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-1">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Lead Sent</p>
                    <p className="text-blue-600 font-semibold">
                      {/* {project?.actionDetails.markAsSend === true
                        ? "Yes"
                        : "No"} */}

                      {/* newly version */}
                      <p className="text-blue-600 font-semibold">
                        {project.actionDetails?.markAsSend === true ||
                        project.status === "Lead Sent"
                          ? "Yes"
                          : "No"}
                      </p>
                    </p>
                  </div>

                  {/* old teamName type */}

                  {/* {project.actionDetails?.teamName && (
                    <div>
                      <p className="font-medium text-gray-900">Team</p>
                      <p className="text-green-600 font-semibold">
                        {project.actionDetails.teamName}
                      </p>
                    </div>
                  )} */}

                  {/* new teamName as an arrya */}
                  {project.actionDetails?.teamName &&
                    project.actionDetails.teamName.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900">Team</p>
                        <div className="flex flex-wrap gap-1">
                          {project.actionDetails.teamName.map((team, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs text-green-600 font-semibold"
                            >
                              {team}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {project.interviewActionDetails?.interviewDateTime && (
                    <div>
                      <p className="font-medium text-gray-900">
                        Meeting Date & Time
                      </p>
                      <p className="text-green-600 font-semibold">
                        {new Date(
                          project.interviewActionDetails.interviewDateTime
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* old comment */}
              {/* <div className="flex flex-col gap-2 ml-6">
                <div className="flex gap-2">
                  <Dialog
                    open={sendProfileDialog === project._id}
                    onOpenChange={(open) =>
                      setSendProfileDialog(open ? project._id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSendProfileDialog(project._id);
                          setSelectedCandidate("");
                          setSendDateTime("");
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Proposal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Proposal to Client</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>ClientName</Label>
                          <Input
                            value={selectedCandidate}
                            onChange={(e) =>
                              setSelectedCandidate(e.target.value)
                            }
                            placeholder="Enter Client name"
                          />
                        </div>
                        <div>
                          <Label>Send Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={sendDateTime}
                            onChange={(e) => setSendDateTime(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => sendProfileToClient(project._id)}
                          className="w-full"
                        >
                          Send 
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {project.status === "Lead Sent" && (
                    <Dialog
                      open={scheduleInterview === project._id}
                      onOpenChange={(open) =>
                        setScheduleInterview(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setScheduleInterview(project._id);
                            setInterviewDate("");
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Meeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Meeting</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Meeting Date & Time</Label>
                            <Input
                              type="datetime-local"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={() =>
                              scheduleInterviewForProject(project._id)
                            }
                            className="w-full"
                          >
                            Schedule Interview
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(project)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closeProject(project._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div> */}

              {/* conditon based rendering if closed nothing show else all show */}
              {project.status !== "Closed" && (
                <div className="flex flex-col gap-2 ml-6">
                  <div className="flex gap-2">
                    {/* Send Proposal Dialog Button */}
                    <Dialog
                      open={sendProfileDialog === project._id}
                      onOpenChange={(open) =>
                        setSendProfileDialog(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSendProfileDialog(project._id);
                            setSelectedCandidate("");
                            setSendDateTime("");
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Send Proposal  Description
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Proposal Type</Label>
                            {/* <Input
                              value={selectedCandidate}
                              onChange={(e) =>
                                setSelectedCandidate(e.target.value)
                              }
                              placeholder="Enter Proposal Thought "
                            /> */}
                            {/* text area */}
                            <textarea
                              id="proposalDescription"
                              value={proposalDescription}
                              onChange={(e) =>
                                setProposalDescription(e.target.value)
                              }
                              placeholder="Enter Proposal Thought"
                              rows={4}
                              className="w-full p-2 border rounded-md text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label>Next Follow Up Date & Time</Label>
                            <Input
                              type="datetime-local"
                              value={sendDateTime}
                              onChange={(e) => setSendDateTime(e.target.value)}
                            />
                          </div>
                          {/* <Button
                            onClick={() => sendProfileToClient(project._id)}
                            className="w-full"
                          >
                            Send
                          </Button> */}

                          {/* new */}
                          <Button
                            onClick={() => sendProposalDescription(project._id)}
                            className="w-full"
                          >
                            Send
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Schedule Interview Button (if Lead Sent) */}
                    {project.status === "Lead Sent" && (
                      <Dialog
                        open={scheduleInterview === project._id}
                        onOpenChange={(open) =>
                          setScheduleInterview(open ? project._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setScheduleInterview(project._id);
                              setInterviewDate("");
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule Meeting
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Schedule Meeting</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Meeting Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={interviewDate}
                                onChange={(e) =>
                                  setInterviewDate(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              onClick={() =>
                                scheduleInterviewForProject(project._id)
                              }
                              className="w-full"
                            >
                              Schedule Meeting
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Edit and Close Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(project)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeProject(project._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {project.description && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">Project Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
    <br/>
            {/* propsal descripition */}
            {project.proposalDescription && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">
                  Proposal Description
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.proposalDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
