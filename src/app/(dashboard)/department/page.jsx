"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const IssueMap = dynamic(() => import("@/components/IssueMap"), {
  ssr: false,
});

const mockDepartmentUser = {
  id: "123e4567-e89b-12d3-a456-426614174002",
  email: "transport@city.gov",
  full_name: "Transport Department",
  role: "department_official",
  department: "transport",
};

const statusConfig = {
  pending: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Pending",
    dotColor: "bg-amber-400",
  },
  assigned: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: User,
    label: "Assigned",
    dotColor: "bg-blue-400",
  },
  in_progress: {
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertCircle,
    label: "In Progress",
    dotColor: "bg-orange-400",
  },
  resolved: {
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    label: "Resolved",
    dotColor: "bg-green-400",
  },
};

const priorityConfig = {
  low: { color: "bg-slate-50 text-slate-600 border-slate-200", label: "Low" },
  medium: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "Medium",
  },
  high: { color: "bg-red-50 text-red-700 border-red-200", label: "High" },
};

const categoryConfig = {
  pothole: "Pothole",
  streetlight: "Street Light",
  sanitation: "Sanitation",
  graffiti: "Graffiti",
  traffic: "Traffic",
  water: "Water",
  general: "General",
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium mb-1 ${color}`}>{title}</p>
        <p
          className={`text-3xl font-bold ${color
            .replace("text-", "text-")
            .replace("-600", "-700")}`}
        >
          {value}
        </p>
      </div>
      <div
        className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const config = statusConfig[status];
  return (
    <div
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`}></div>
      {config.label}
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority];
  return (
    <div
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </div>
  );
};

// Action Button Component
const ActionButton = ({ onClick, variant, children, disabled = false }) => {
  const variants = {
    accept: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    start: "text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
    resolve: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
    assign:
      "text-slate-700 bg-white border-slate-300 hover:bg-slate-50 focus:ring-blue-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default function DepartmentDashboard() {
  const [issues, setIssues] = useState([]);
  const [mapIssues, setMapIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [updating, setUpdating] = useState(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/department`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log("Issues:", result.issues);

      if (result.issues && Array.isArray(result.issues)) {
        setIssues(result.issues);

        // Extract latitude and longitude from address field (comma separated string)
        const mapData = result.issues
          .map((issue) => {
            if (!issue.address) return null; // skip if no address

            // Split address by comma and trim parts
            const parts = issue.address.split(",").map((p) => p.trim());

            if (parts.length !== 2) return null; // invalid format

            const latitude = parseFloat(parts[0]);
            const longitude = parseFloat(parts[1]);

            // Check if parsed values are valid numbers
            if (isNaN(latitude) || isNaN(longitude)) return null;

            return {
              _id: issue.id,
              title: issue.title,
              category: issue.category,
              status: issue.status,
              latitude,
              longitude,
            };
          })
          .filter(Boolean); // remove nulls from array

        setMapIssues(mapData);
      } else {
        setIssues([]);
        setMapIssues([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setIssues([]);
      setMapIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      setUpdating(issueId);

      // Optimistic update
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                status: newStatus,
                updated_at: new Date().toISOString(),
                assigned_to:
                  newStatus === "assigned" || newStatus === "in_progress"
                    ? mockDepartmentUser.id
                    : issue.assigned_to,
                resolved_at:
                  newStatus === "resolved"
                    ? new Date().toISOString()
                    : issue.resolved_at,
              }
            : issue
        )
      );

      // Make API call to update status
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          assigned_to:
            newStatus === "assigned" || newStatus === "in_progress"
              ? mockDepartmentUser.id
              : undefined,
          resolved_at:
            newStatus === "resolved" ? new Date().toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue status");
      }

      // Optionally refresh data to ensure consistency
      // await fetchData();
    } catch (err) {
      console.error("Error updating issue:", err);
      // Revert optimistic update on error
      await fetchData();
      setError("Failed to update issue status");
    } finally {
      setUpdating(null);
    }
  };

  const assignToSelf = async (issueId) => {
    try {
      setUpdating(issueId);

      // Optimistic update
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                assigned_to: mockDepartmentUser.id,
                status: issue.status === "pending" ? "assigned" : issue.status,
                updated_at: new Date().toISOString(),
              }
            : issue
        )
      );

      // Make API call
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned_to: mockDepartmentUser.id,
          status: "assigned",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign issue");
      }
    } catch (err) {
      console.error("Error assigning issue:", err);
      await fetchData();
      setError("Failed to assign issue");
    } finally {
      setUpdating(null);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const statusMatch =
      selectedStatus === "all" || issue.status === selectedStatus;
    const priorityMatch =
      selectedPriority === "all" || issue.priority === selectedPriority;
    const categoryMatch =
      selectedCategory === "all" || issue.category === selectedCategory;
    return statusMatch && priorityMatch && categoryMatch;
  });

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    assigned: issues.filter((i) => i.status === "assigned").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRowExpansion = (issueId) => {
    setExpandedRow(expandedRow === issueId ? null : issueId);
  };

  const refreshData = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--heading-color)]">
                Department Dashboard
              </h1>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">
                  {mockDepartmentUser.full_name}
                </span>
                <span className="text-slate-400">•</span>
                <span className="capitalize">
                  {mockDepartmentUser.department} Department
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={refreshData}
                disabled={loading}
                variant="green"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="green"
                onClick={() => {
                  router.push("/chat");
                }}
              >
                Chat
              </Button>
              <div className="text-right space-y-1">
                <p className="text-sm text-slate-500">Last updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 border border-red-200 bg-red-50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <div className="text-red-800 text-sm">Error: {error}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Issues"
            value={stats.total}
            icon={AlertCircle}
            color="text-slate-600"
            bgColor="bg-slate-100"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
          <StatsCard
            title="Assigned"
            value={stats.assigned}
            icon={User}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={AlertCircle}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="min-w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryConfig).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Issues</h3>
            <p className="text-sm text-slate-600">
              Manage and track department issues ({filteredIssues.length} of{" "}
              {issues.length} issues)
            </p>
          </div>

          {filteredIssues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredIssues.map((issue) => (
                    <React.Fragment key={issue.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {issue.image_url && (
                              <img
                                src={issue.image_url}
                                alt="Issue"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 mr-4"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-900 truncate">
                                {issue.title}
                              </div>
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {issue.address || "No address provided"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={issue.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={issue.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-900">
                            {categoryConfig[issue.category] || issue.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">
                            {formatDate(issue.created_at)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatTime(issue.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {updating === issue.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <>
                                {issue.status !== "resolved" && (
                                  <>
                                    {issue.status === "pending" && (
                                      <ActionButton
                                        variant="accept"
                                        onClick={() =>
                                          updateIssueStatus(
                                            issue.id,
                                            "assigned"
                                          )
                                        }
                                      >
                                        Accept
                                      </ActionButton>
                                    )}
                                    {issue.status === "assigned" && (
                                      <ActionButton
                                        variant="start"
                                        onClick={() =>
                                          updateIssueStatus(
                                            issue.id,
                                            "in_progress"
                                          )
                                        }
                                      >
                                        Start
                                      </ActionButton>
                                    )}
                                    {issue.status === "in_progress" && (
                                      <ActionButton
                                        variant="resolve"
                                        onClick={() =>
                                          updateIssueStatus(
                                            issue.id,
                                            "resolved"
                                          )
                                        }
                                      >
                                        Resolve
                                      </ActionButton>
                                    )}
                                    {issue.assigned_to !==
                                      mockDepartmentUser.id && (
                                      <ActionButton
                                        variant="assign"
                                        onClick={() => assignToSelf(issue.id)}
                                      >
                                        Assign to Me
                                      </ActionButton>
                                    )}
                                  </>
                                )}
                                {issue.status === "resolved" && (
                                  <span className="text-xs text-green-600 font-medium">
                                    Resolved {formatDate(issue.resolved_at)}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRowExpansion(issue.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedRow === issue.id && (
                        <tr className="bg-slate-50">
                          <td colSpan="7" className="px-6 py-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-slate-900 mb-2">
                                  Description
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {issue.description}
                                </p>
                              </div>
                              {issue.address && (
                                <div>
                                  <h4 className="text-sm font-medium text-slate-900 mb-2">
                                    Location
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4" />
                                    {issue.address}
                                    {issue.latitude && issue.longitude && (
                                      <span className="text-xs text-slate-400">
                                        ({issue.latitude}, {issue.longitude})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-6 text-sm text-slate-500">
                                <div>
                                  <span className="font-medium">Created:</span>{" "}
                                  {formatDate(issue.created_at)} at{" "}
                                  {formatTime(issue.created_at)}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Last updated:
                                  </span>{" "}
                                  {formatDate(issue.updated_at)} at{" "}
                                  {formatTime(issue.updated_at)}
                                </div>
                                {issue.assigned_to && (
                                  <div>
                                    <span className="font-medium">
                                      Assigned to:
                                    </span>{" "}
                                    {issue.assigned_to === mockDepartmentUser.id
                                      ? "You"
                                      : issue.assigned_to}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No issues found
              </h3>
              <p className="text-slate-600 max-w-sm mx-auto">
                {issues.length === 0
                  ? "No issues have been reported yet."
                  : "No issues match your current filters. Try adjusting your search criteria."}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2 text-green-800">
          Issue Locations
        </h2>
        <IssueMap issues={mapIssues} />
      </div>
    </div>
  );
}
