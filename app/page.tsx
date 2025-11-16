"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, AlertCircle, Database } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getStreamURL } from "@/lib/api";

interface Metrics {
  total_requests: number;
  error_rate: number;
  cache_hit_ratio: number;
  latency_p50: number;
  latency_p95: number;
  latency_p99: number;
  requests_per_min: Array<{ timestamp: string; count: number }>;
  top_endpoints: Array<{
    path: string;
    request_count: number;
    avg_latency_ms: number;
    error_rate: number;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(getStreamURL());

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(data);
      } catch (error) {
        console.error("Failed to parse metrics:", error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const chartData = metrics?.requests_per_min?.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    requests: item.count,
  })) || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time API Gateway metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Total Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics?.total_requests?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-400 mt-1">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {((metrics?.error_rate || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-400 mt-1">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">
              Cache Hit Ratio
            </CardTitle>
            <Database className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {((metrics?.cache_hit_ratio || 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-400 mt-1">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">P95 Latency</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics?.latency_p95 || 0}ms
            </div>
            <p className="text-xs text-gray-400 mt-1">
              P50: {metrics?.latency_p50 || 0}ms
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Request Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.top_endpoints?.slice(0, 5).map((endpoint, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">{endpoint.path}</p>
                    <p className="text-xs text-gray-400">
                      {endpoint.request_count} requests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {endpoint.avg_latency_ms}ms
                    </p>
                    <p className="text-xs text-gray-400">
                      {(endpoint.error_rate * 100).toFixed(1)}% errors
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
