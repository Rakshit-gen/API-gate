// Server-side auth import (only used in server components)
// import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Request cache for deduplication - now user-specific
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000; // 1 second cache

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Client-side API function that requires token
export async function fetchAPI(endpoint: string, token: string | null, options?: RequestInit) {
  if (!token) {
    throw new Error("Authentication required");
  }

  const cacheKey = `${token}-${endpoint}-${JSON.stringify(options?.body || "")}`;
  const now = Date.now();

  // Check cache
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized - please sign in again");
        }
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      // Cache the response (user-specific)
      requestCache.set(cacheKey, { data, timestamp: now });

      // Clean old cache entries
      if (requestCache.size > 100) {
        const entries = Array.from(requestCache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        requestCache.clear();
        entries.slice(0, 50).forEach(([key, value]) => requestCache.set(key, value));
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

// Server-side API function (for server components)
// Uncomment and use when needed in server components:
// import { auth } from "@clerk/nextjs/server";
// export async function fetchAPIServer(endpoint: string, options?: RequestInit) {
//   const { getToken } = await auth();
//   const token = await getToken();
//   ...
// }

// Client-side API wrapper that uses token
export function createAuthenticatedAPI(token: string | null) {
  if (!token) {
    throw new Error("Token is required");
  }

  return {
    routes: {
      list: () => fetchAPI("/admin/routes", token),
      get: (id: number) => fetchAPI(`/admin/routes/${id}`, token),
      create: (data: any) =>
        fetchAPI("/admin/routes", token, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: number, data: any) =>
        fetchAPI(`/admin/routes/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: number) =>
        fetchAPI(`/admin/routes/${id}`, token, { method: "DELETE" }),
    },

    apiKeys: {
      list: () => fetchAPI("/admin/api-keys", token),
      create: (data: any) =>
        fetchAPI("/admin/api-keys", token, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      revoke: (id: number) =>
        fetchAPI(`/admin/api-keys/${id}/revoke`, token, { method: "POST" }),
      delete: (id: number) =>
        fetchAPI(`/admin/api-keys/${id}`, token, { method: "DELETE" }),
    },

    cacheRules: {
      list: () => fetchAPI("/admin/cache-rules", token),
      create: (data: any) =>
        fetchAPI("/admin/cache-rules", token, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: number, data: any) =>
        fetchAPI(`/admin/cache-rules/${id}`, token, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: number) =>
        fetchAPI(`/admin/cache-rules/${id}`, token, { method: "DELETE" }),
      invalidate: (pattern?: string) =>
        fetchAPI("/admin/cache/invalidate", token, {
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
        return fetchAPI(`/admin/analytics/metrics${query ? `?${query}` : ""}`, token);
      },
    },
  };
}

// Legacy export for backward compatibility (will be replaced by hook)
export const api = {
  routes: {
    list: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    get: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    create: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    update: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    delete: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
  },
  apiKeys: {
    list: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    create: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    revoke: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    delete: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
  },
  cacheRules: {
    list: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    create: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    update: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    delete: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
    invalidate: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
  },
  analytics: {
    getMetrics: () => {
      throw new Error("Use useAuthenticatedAPI hook instead");
    },
  },
};

export function getStreamURL(token: string | null) {
  if (!token) {
    return null;
  }
  return `${API_BASE_URL}/admin/analytics/stream?token=${encodeURIComponent(token)}`;
}
