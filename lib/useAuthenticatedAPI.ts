"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo, useEffect, useState } from "react";
import { createAuthenticatedAPI } from "./api";

export function useAuthenticatedAPI() {
  const { getToken, userId } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(setToken).catch(() => setToken(null));
  }, [getToken]);

  const api = useMemo(() => {
    if (!token) {
      return null;
    }
    return createAuthenticatedAPI(token);
  }, [token]);

  // Return both API and userId for cache key generation
  return { api, userId, token };
}

// Helper to create user-specific query keys
export function createUserQueryKey(
  baseKey: string | readonly string[],
  userId: string | null | undefined
): readonly string[] {
  const base = Array.isArray(baseKey) ? [...baseKey] : [baseKey];
  if (!userId) {
    return base;
  }
  return [...base, userId];
}
