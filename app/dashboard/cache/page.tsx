"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedAPI, createUserQueryKey } from "@/lib/useAuthenticatedAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CachePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [routeId, setRouteId] = useState("");
  const [ttl, setTtl] = useState("300");

  const queryClient = useQueryClient();
  const { api, userId } = useAuthenticatedAPI();

  const { data: cacheRules, isLoading } = useQuery({
    queryKey: createUserQueryKey(["cacheRules"], userId),
    queryFn: () => {
      if (!api) throw new Error("Not authenticated");
      return api.cacheRules.list();
    },
    enabled: !!api && !!userId,
  });

  const { data: routes } = useQuery({
    queryKey: createUserQueryKey(["routes"], userId),
    queryFn: () => {
      if (!api) throw new Error("Not authenticated");
      return api.routes.list();
    },
    enabled: !!api && !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (!api) throw new Error("Not authenticated");
      return api.cacheRules.create(data);
    },
    onMutate: async (newRule) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: createUserQueryKey(["cacheRules"], userId) });

      // Snapshot the previous value
      const previousRules = queryClient.getQueryData(createUserQueryKey(["cacheRules"], userId));

      // Optimistically add a temporary rule (will be replaced with real data on success)
      const tempId = `temp-${Date.now()}`;
      const tempRule = {
        id: tempId,
        ...newRule,
        enabled: true,
      };

      queryClient.setQueryData(createUserQueryKey(["cacheRules"], userId), (old: any) => {
        if (!old) return [tempRule];
        return [...old, tempRule];
      });

      return { previousRules, tempId };
    },
    onError: (err, newRule, context) => {
      // Roll back on error
      if (context?.previousRules) {
        queryClient.setQueryData(createUserQueryKey(["cacheRules"], userId), context.previousRules);
      }
    },
    onSuccess: (data, newRule, context) => {
      // Replace temporary rule with real data from server
      queryClient.setQueryData(createUserQueryKey(["cacheRules"], userId), (old: any) => {
        if (!old) return [data];
        // Remove temp rule and add real one
        const filtered = old.filter((r: any) => r.id !== context?.tempId);
        return [...filtered, data];
      });
      setIsOpen(false);
      resetForm();
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: createUserQueryKey(["cacheRules"], userId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!api) throw new Error("Not authenticated");
      return api.cacheRules.delete(id);
    },
    onMutate: async (id: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: createUserQueryKey(["cacheRules"], userId) });

      // Snapshot the previous value
      const previousRules = queryClient.getQueryData(createUserQueryKey(["cacheRules"], userId));

      // Optimistically update to the new value
      queryClient.setQueryData(createUserQueryKey(["cacheRules"], userId), (old: any) => {
        if (!old) return old;
        return old.filter((rule: any) => rule.id !== id);
      });

      // Return a context object with the snapshotted value
      return { previousRules };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRules) {
        queryClient.setQueryData(createUserQueryKey(["cacheRules"], userId), context.previousRules);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: createUserQueryKey(["cacheRules"], userId) });
    },
  });

  const invalidateMutation = useMutation({
    mutationFn: (pattern: string) => {
      if (!api) throw new Error("Not authenticated");
      return api.cacheRules.invalidate(pattern);
    },
  });

  const resetForm = () => {
    setRouteId("");
    setTtl("300");
  };

  const handleCreate = () => {
    createMutation.mutate({
      route_id: parseInt(routeId),
      ttl_seconds: parseInt(ttl),
      cache_key_pattern: "*",
    });
  };

  const handleInvalidateAll = () => {
    invalidateMutation.mutate("cache:*");
  };

  if (!api || !userId) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache Configuration</h1>
          <p className="text-muted-foreground">Manage response caching rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleInvalidateAll}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Invalidate All
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Cache Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Cache Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="route">Route ID</Label>
                  <Input
                    id="route"
                    type="number"
                    placeholder="1"
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ttl">TTL (seconds)</Label>
                  <Input
                    id="ttl"
                    type="number"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cache Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Route Path</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cacheRules?.map((rule: any) => {
                  const route = routes?.find((r: any) => r.id === rule.route_id);
                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.route_id}</TableCell>
                      <TableCell>{route?.path || "N/A"}</TableCell>
                      <TableCell>{rule.ttl_seconds}s</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {rule.cache_key_pattern}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.enabled ? "default" : "destructive"}>
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
