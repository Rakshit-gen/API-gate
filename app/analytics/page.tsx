"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [timeRange] = useState("24h");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: () => {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      return api.analytics.getMetrics(
        start.toISOString(),
        end.toISOString()
      );
    },
    refetchInterval: 30000,
  });

  const requestData = metrics?.requests_per_min?.map((item: any) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    requests: item.count,
  })) || [];

  const endpointData = metrics?.top_endpoints?.map((item: any, i: number) => ({
    name: item.path,
    value: item.request_count,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed traffic analysis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_requests?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              P50 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.latency_p50 || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              P95 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.latency_p95 || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              P99 Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.latency_p99 || 0}ms
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic by Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={endpointData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {endpointData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Avg Latency</TableHead>
                  <TableHead>Error Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.top_endpoints?.map((endpoint: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{endpoint.path}</TableCell>
                    <TableCell>{endpoint.request_count?.toLocaleString()}</TableCell>
                    <TableCell>{endpoint.avg_latency_ms}ms</TableCell>
                    <TableCell>
                      {((endpoint.error_rate || 0) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Hit Ratio</span>
                <span className="text-2xl font-bold">
                  {((metrics?.cache_hit_ratio || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart
                  data={[
                    {
                      name: "Hits",
                      value: (metrics?.cache_hit_ratio || 0) * 100,
                    },
                  ]}
                >
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-2xl font-bold">
                  {((metrics?.error_rate || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart
                  data={[
                    {
                      name: "Errors",
                      value: (metrics?.error_rate || 0) * 100,
                    },
                  ]}
                >
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
