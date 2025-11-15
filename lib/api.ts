const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  routes: {
    list: () => fetchAPI("/admin/routes"),
    get: (id: number) => fetchAPI(`/admin/routes/${id}`),
    create: (data: any) =>
      fetchAPI("/admin/routes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      fetchAPI(`/admin/routes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/admin/routes/${id}`, { method: "DELETE" }),
  },

  apiKeys: {
    list: () => fetchAPI("/admin/api-keys"),
    create: (data: any) =>
      fetchAPI("/admin/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    revoke: (id: number) =>
      fetchAPI(`/admin/api-keys/${id}/revoke`, { method: "POST" }),
    delete: (id: number) =>
      fetchAPI(`/admin/api-keys/${id}`, { method: "DELETE" }),
  },

  cacheRules: {
    list: () => fetchAPI("/admin/cache-rules"),
    create: (data: any) =>
      fetchAPI("/admin/cache-rules", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      fetchAPI(`/admin/cache-rules/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/admin/cache-rules/${id}`, { method: "DELETE" }),
    invalidate: (pattern?: string) =>
      fetchAPI("/admin/cache/invalidate", {
        method: "POST",
        body: JSON.stringify({ pattern: pattern || "cache:*" }),
      }),
  },

  analytics: {
    getMetrics: (start?: string, end?: string) => {
      const params = new URLSearchParams();
      if (start) params.append("start", start);
      if (end) params.append("end", end);
      const query = params.toString();
      return fetchAPI(`/admin/analytics/metrics${query ? `?${query}` : ""}`);
    },
  },
};

export function getStreamURL() {
  return `${API_BASE_URL}/admin/analytics/stream`;
}
