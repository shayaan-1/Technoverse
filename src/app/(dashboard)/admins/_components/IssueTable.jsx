"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  MessageCircle, 
  User, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Calendar,
  Users
} from "lucide-react";
import WorkersSelectPopUp from "./WorkersSelectPopUp";


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("sanitation");
  const [data, setData] = useState({});
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const categories = [
    { value: "transport", label: "Transport", icon: "🚗", color: "bg-blue-500" },
    { value: "sanitation", label: "Sanitation", icon: "🗑️", color: "bg-green-500" },
    { value: "public_health", label: "Health", icon: "🏥", color: "bg-red-500" },
    { value: "utilities", label: "Utilities", icon: "⚡", color: "bg-yellow-500" },
    { value: "parks_and_recreation", label: "Parks", icon: "🌳", color: "bg-emerald-500" },
    { value: "urban_planning", label: "Planning", icon: "🏗️", color: "bg-purple-500" },
  ];

  const fetchData = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/admin-issues?department=${encodeURIComponent(category)}`
      );
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        [category]: json.issues || [],
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
      setData((prev) => ({
        ...prev,
        [category]: [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/admin-asignee?department=${encodeURIComponent(category)}`
      );
      const json = await res.json();
      setWorkers(json.workers || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = async (issue, category) => {
    setSelectedIssue(issue);
    await fetchWorkers(activeTab);
    setShowPopup(true);
  };

  useEffect(() => {
    if (!data[activeTab]) {
      fetchData(activeTab);
    }
  }, [activeTab]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: AlertTriangle },
      resolved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border font-medium flex items-center gap-1`}>
        <IconComponent size={12} />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: "bg-gray-100 text-gray-700 border-gray-200",
      medium: "bg-orange-100 text-orange-700 border-orange-200", 
      high: "bg-red-100 text-red-700 border-red-200"
    };
    
    return (
      <Badge className={`${priorityConfig[priority]} border font-medium capitalize`}>
        {priority}
      </Badge>
    );
  };

  const filteredData = data[activeTab]?.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentCategory = categories.find(cat => cat.value === activeTab);
  const totalIssues = data[activeTab]?.length || 0;
  const resolvedIssues = data[activeTab]?.filter(issue => issue.status === 'resolved').length || 0;
  const pendingIssues = data[activeTab]?.filter(issue => issue.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and monitor city issues across all departments
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="green"
              onClick={() => router.push("/chat")}
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <MessageCircle size={18} />
              Chat System
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-200 hover:bg-green-50"
            >
              <Filter size={18} />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{totalIssues}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <AlertTriangle className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{resolvedIssues}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingIssues}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm border-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${currentCategory?.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                {currentCategory?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentCategory?.label} Department
                </h2>
                <p className="text-green-100">
                  Managing {filteredData.length} issues
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-100/50 p-2 rounded-2xl mb-6">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-green-700 rounded-xl py-3 px-4 font-medium transition-all duration-300"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value}>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow className="border-b-0">
                          <TableHead className="font-semibold text-gray-700 py-4">Issue Details</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                          <TableHead className="font-semibold text-gray-700">Location</TableHead>
                          <TableHead className="font-semibold text-gray-700">Reporter</TableHead>
                          <TableHead className="font-semibold text-gray-700">Assignee</TableHead>
                          <TableHead className="font-semibold text-gray-700">Timeline</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.length ? (
                          filteredData.map((issue, index) => (
                            <TableRow 
                              key={issue.id} 
                              className={`border-b border-gray-100 hover:bg-green-50/50 transition-all duration-200 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                              }`}
                            >
                              <TableCell className="py-4">
                                <div className="space-y-1">
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {issue.title}
                                  </p>
                                  <p className="text-gray-600 text-xs line-clamp-2">
                                    {issue.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(issue.status)}
                              </TableCell>
                              <TableCell>
                                {getPriorityBadge(issue.priority)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin size={14} />
                                  <span className="truncate max-w-32">
                                    {issue.address || 'Not specified'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <User size={14} className="text-green-600" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {issue.reported_by || "Anonymous"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`text-sm font-medium ${
                                  issue.assigned_to ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {issue.assigned_to || "Unassigned"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    {new Date(issue.created_at).toLocaleDateString()}
                                  </div>
                                  {issue.resolved_at && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <CheckCircle size={12} />
                                      {new Date(issue.resolved_at).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="green"
                                  size="sm"
                                  onClick={() => handleAssignClick(issue)}
                                  className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  <Users size={14} className="mr-1" />
                                  Assign
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle size={32} className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="text-lg font-medium text-gray-600">
                                    No issues found
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {searchTerm ? 'Try adjusting your search terms' : 'All caught up! No issues to display.'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>

      {/* Popup */}
      {showPopup && selectedIssue && (
        <WorkersSelectPopUp
          workers={workers}
          issueId={selectedIssue}
          loading={loading}
          onClose={() => {
            setShowPopup(false);
            setSelectedIssue(null);
          }}
        />
      )}
    </div>
  );
}