"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Clock,
  AlertCircle,
  Database,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getStreamURL } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

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

// Memoized Stat Card Component
const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconGradient,
  borderColor,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconGradient: string;
  borderColor: string;
  subtitle: string;
}) {
  return (
    <Card
      className={`group relative overflow-hidden border ${borderColor} bg-white/5 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  );
});

// Memoized Endpoint Item Component
const EndpointItem = memo(function EndpointItem({
  endpoint,
  maxRequests,
}: {
  endpoint: {
    path: string;
    request_count: number;
    avg_latency_ms: number;
    error_rate: number;
  };
  maxRequests: number;
}) {
  const errorRate = endpoint.error_rate * 100;
  const errorBadgeClass =
    errorRate > 5
      ? "bg-red-500/20 text-red-400"
      : errorRate > 1
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-green-500/20 text-green-400";

  const progressWidth = Math.min((endpoint.request_count / maxRequests) * 100, 100);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <p className="text-sm font-semibold text-white truncate">{endpoint.path}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {endpoint.request_count.toLocaleString()} req
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {endpoint.avg_latency_ms}ms
            </span>
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${errorBadgeClass}`}>
            {errorRate.toFixed(1)}% errors
          </div>
        </div>
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
});

// Memoized Chart Component
const RequestRateChart = memo(function RequestRateChart({
  data,
}: {
  data: Array<{ time: string; requests: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="#6b7280"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            color: "#fff",
            backdropFilter: "blur(10px)",
          }}
          labelStyle={{ color: "#9ca3af" }}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorRequests)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(setToken).catch(() => setToken(null));
  }, [getToken]);

  // Optimized EventSource with reconnection logic
  useEffect(() => {
    if (!token) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const baseReconnectDelay = 1000;

    const connect = () => {
      try {
        const streamURL = getStreamURL(token);
        if (!streamURL) return;
        eventSource = new EventSource(streamURL);

        eventSource.onopen = () => {
          setConnectionStatus("connected");
          reconnectAttempts = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Metrics;
            setMetrics((prev) => {
              // Only update if data actually changed to prevent unnecessary re-renders
              if (prev && JSON.stringify(prev) === JSON.stringify(data)) {
                return prev;
              }
              return data;
            });
          } catch (error) {
            console.error("Failed to parse metrics:", error);
          }
        };

        eventSource.onerror = () => {
          setConnectionStatus("disconnected");
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Exponential backoff reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++;
              setConnectionStatus("connecting");
              connect();
            }, delay);
          }
        };
      } catch (error) {
        console.error("Failed to create EventSource:", error);
        setConnectionStatus("disconnected");
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [token]);

  // Memoize expensive computations
  const chartData = useMemo(() => {
    if (!metrics?.requests_per_min) return [];
    return metrics.requests_per_min.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      requests: item.count,
    }));
  }, [metrics?.requests_per_min]);

  const topEndpoints = useMemo(() => {
    if (!metrics?.top_endpoints) return [];
    return metrics.top_endpoints.slice(0, 5);
  }, [metrics?.top_endpoints]);

  const maxRequests = useMemo(() => {
    return topEndpoints[0]?.request_count || 1;
  }, [topEndpoints]);

  const statCards = useMemo(() => {
    if (!metrics) {
      return [
        {
          title: "Total Requests",
          value: "0",
          icon: Activity,
          gradient: "from-blue-500/20 to-cyan-500/20",
          iconGradient: "from-blue-400 to-cyan-500",
          borderColor: "border-blue-500/30",
          subtitle: "Last 5 minutes",
        },
        {
          title: "Error Rate",
          value: "0%",
          icon: AlertCircle,
          gradient: "from-red-500/20 to-orange-500/20",
          iconGradient: "from-red-400 to-orange-500",
          borderColor: "border-red-500/30",
          subtitle: "Last 5 minutes",
        },
        {
          title: "Cache Hit Ratio",
          value: "0%",
          icon: Database,
          gradient: "from-green-500/20 to-emerald-500/20",
          iconGradient: "from-green-400 to-emerald-500",
          borderColor: "border-green-500/30",
          subtitle: "Last 5 minutes",
        },
        {
          title: "P95 Latency",
          value: "0ms",
          icon: Clock,
          gradient: "from-purple-500/20 to-pink-500/20",
          iconGradient: "from-purple-400 to-pink-500",
          borderColor: "border-purple-500/30",
          subtitle: "P50: 0ms",
        },
      ];
    }

    return [
      {
        title: "Total Requests",
        value: metrics.total_requests?.toLocaleString() || "0",
        icon: Activity,
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconGradient: "from-blue-400 to-cyan-500",
        borderColor: "border-blue-500/30",
        subtitle: "Last 5 minutes",
      },
      {
        title: "Error Rate",
        value: ((metrics.error_rate || 0) * 100).toFixed(2) + "%",
        icon: AlertCircle,
        gradient: "from-red-500/20 to-orange-500/20",
        iconGradient: "from-red-400 to-orange-500",
        borderColor: "border-red-500/30",
        subtitle: "Last 5 minutes",
      },
      {
        title: "Cache Hit Ratio",
        value: ((metrics.cache_hit_ratio || 0) * 100).toFixed(2) + "%",
        icon: Database,
        gradient: "from-green-500/20 to-emerald-500/20",
        iconGradient: "from-green-400 to-emerald-500",
        borderColor: "border-green-500/30",
        subtitle: "Last 5 minutes",
      },
      {
        title: "P95 Latency",
        value: (metrics.latency_p95 || 0) + "ms",
        icon: Clock,
        gradient: "from-purple-500/20 to-pink-500/20",
        iconGradient: "from-purple-400 to-pink-500",
        borderColor: "border-purple-500/30",
        subtitle: `P50: ${metrics.latency_p50 || 0}ms`,
      },
    ];
  }, [metrics]);

  const cacheHits = useMemo(() => {
    if (!metrics) return 0;
    return Math.round(metrics.total_requests * (metrics.cache_hit_ratio || 0));
  }, [metrics?.total_requests, metrics?.cache_hit_ratio]);

  const successRate = useMemo(() => {
    if (!metrics) return 0;
    return (1 - (metrics.error_rate || 0)) * 100;
  }, [metrics?.error_rate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
            <p className="text-gray-400 text-lg">Real-time API Gateway metrics and insights</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-sm text-gray-300 capitalize">{connectionStatus}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Request Rate Chart */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white">Request Rate</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="h-4 w-4 text-blue-400" />
                  Real-time
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RequestRateChart data={chartData} />
            </CardContent>
          </Card>

          {/* Top Endpoints */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white">Top Endpoints</CardTitle>
                <span className="text-sm text-gray-400">{topEndpoints.length} active</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topEndpoints.length > 0 ? (
                  topEndpoints.map((endpoint, i) => (
                    <EndpointItem key={`${endpoint.path}-${i}`} endpoint={endpoint} maxRequests={maxRequests} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">No endpoint data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Latency Distribution */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Latency Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">P50</span>
                  <span className="text-lg font-semibold text-white">{metrics?.latency_p50 || 0}ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: "50%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">P95</span>
                  <span className="text-lg font-semibold text-white">{metrics?.latency_p95 || 0}ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "95%" }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">P99</span>
                  <span className="text-lg font-semibold text-white">{metrics?.latency_p99 || 0}ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: "99%" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Cache Efficiency</span>
                    <span className="text-sm font-semibold text-white">
                      {((metrics?.cache_hit_ratio || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(metrics?.cache_hit_ratio || 0) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Success Rate</span>
                    <span className="text-sm font-semibold text-white">{successRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Error Rate</span>
                    <span className="text-sm font-semibold text-red-400">
                      {((metrics?.error_rate || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(metrics?.error_rate || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Requests</p>
                      <p className="text-lg font-semibold text-white">{metrics?.total_requests?.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cache Hits</p>
                      <p className="text-lg font-semibold text-white">{cacheHits.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Avg Latency</p>
                      <p className="text-lg font-semibold text-white">{metrics?.latency_p50 || 0}ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
