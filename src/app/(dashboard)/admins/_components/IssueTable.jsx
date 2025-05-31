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
import WorkersSelectPopUp from "./WorkersSelectPopUp";

export default function IssueTableTabs() {
  const [activeTab, setActiveTab] = useState("sanitation");
  const [data, setData] = useState({});
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const categories = [
    "transport",
    "sanitation",
    "public_health",
    "utilities",
    "parks_and_recreation",
    "urban_planning",
  ];

  const fetchData = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin-issues?department=${encodeURIComponent(category)}`
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
        `/api/admin-asignee?department=${encodeURIComponent(category)}`
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

  return (
    <>
      <Card className="p-4 shadow-xl rounded-2xl bg-white overflow-x-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category.replace(/_/g, " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              {loading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-2/4" />
                </div>
              ) : (
                <Table className="mt-4 text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Resolved At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data[category]?.length ? (
                      data[category].map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell>{issue.title}</TableCell>
                          <TableCell>{issue.description}</TableCell>
                          <TableCell>{issue.status}</TableCell>
                          <TableCell className="capitalize">
                            {issue.priority}
                          </TableCell>
                          <TableCell>{issue.address}</TableCell>
                          <TableCell>{issue.reported_by || "N/A"}</TableCell>
                          <TableCell>
                            {issue.assigned_to || "Unassigned"}
                          </TableCell>
                          <TableCell>
                            {new Date(issue.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {issue.resolved_at
                              ? new Date(issue.resolved_at).toLocaleDateString()
                              : "Pending"}
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleAssignClick(issue)}>
                              Assign To
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center text-muted-foreground"
                        >
                          No issues found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>

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
    </>
  );
}
