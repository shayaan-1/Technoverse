'use client';

import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  Card
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function IssueTableTabs() {
  const [activeTab, setActiveTab] = useState("pothole");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = [
    "pothole",
    "graffiti",
    "streetlight",
    "sanitation",
    "traffic",
    "water",
    "general",
  ];

  const fetchData = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues?category=${category}`);
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

  useEffect(() => {
    if (!data[activeTab]) fetchData(activeTab);
  }, [activeTab]);

  return (
    <Card className="p-4 shadow-xl rounded-2xl bg-white">
      <Tabs defaultValue="pothole" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize"
            >
              {category}
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
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data[category]?.length ? (
                    data[category].map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{issue.title}</TableCell>
                        <TableCell>{issue.description}</TableCell>
                        <TableCell>{issue.status}</TableCell>
                        <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
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
  );
}
