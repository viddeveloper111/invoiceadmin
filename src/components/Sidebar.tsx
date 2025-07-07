import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Briefcase, BarChart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// interface SidebarProps {
//   activeTab: string;
//   setActiveTab: (tab: string) => void;
// }

// export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
export const Sidebar = () => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "clients",
      label: "Client Management",
      icon: Users,
      path: "/clients",
    },
    { id: "jobs", label: "Job Profiles", icon: Briefcase, path: "/jobs" },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart,
      path: "/analytics",
    },
  ];

  const [user, setUser] = useState(() => {
    const tempdata = localStorage.getItem("User");
    return tempdata ? JSON.parse(tempdata) : "null";
  });

  console.log("User from local storage", user);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("User");
    localStorage.removeItem("Token");
    setUser("null");
    navigate("/login");
    console.log("Navigate to login page");
    // alert("Navigate to login page");
  };
  const location = useLocation();
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          JobFlow
        </h1>
        <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = (path: string) =>
              location.pathname.startsWith(path);
            return (
              <Link to={item.path} key={item.id}>
                {/* <Button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button> */}

                <Button
                  variant="ghost"
                  className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-24 left-4 right-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-3">
            {/* show logout button on the popup */}

            <div
              onClick={handleLogout}
              className="text-sm font-medium text-white cursor-pointer transition duration-200 hover:text-gray-300 active:text-gray-400"
            >
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
