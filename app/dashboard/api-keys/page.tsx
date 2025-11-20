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
import { Plus, Copy, Trash2, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function APIKeysPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("free");
  const [rateLimit, setRateLimit] = useState("60");

  const queryClient = useQueryClient();
  const { api, userId } = useAuthenticatedAPI();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: createUserQueryKey(["apiKeys"], userId),
    queryFn: () => {
      if (!api) throw new Error("Not authenticated");
      return api.apiKeys.list();
    },
    enabled: !!api && !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (!api) throw new Error("Not authenticated");
      return api.apiKeys.create(data);
    },
    onMutate: async (newKey) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });

      // Snapshot the previous value
      const previousKeys = queryClient.getQueryData(createUserQueryKey(["apiKeys"], userId));

      // Optimistically add a temporary key (will be replaced with real data on success)
      const tempId = `temp-${Date.now()}`;
      const tempKey = {
        id: tempId,
        ...newKey,
        key: "gw_loading...",
        enabled: true,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), (old: any) => {
        if (!old) return [tempKey];
        return [...old, tempKey];
      });

      return { previousKeys, tempId };
    },
    onError: (err, newKey, context) => {
      // Roll back on error
      if (context?.previousKeys) {
        queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), context.previousKeys);
      }
    },
    onSuccess: (data, newKey, context) => {
      // Replace temporary key with real data from server
      queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), (old: any) => {
        if (!old) return [data];
        // Remove temp key and add real one
        const filtered = old.filter((k: any) => k.id !== context?.tempId);
        return [...filtered, data];
      });
      setIsOpen(false);
      resetForm();
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!api) throw new Error("Not authenticated");
      return api.apiKeys.revoke(id);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });
      const previousKeys = queryClient.getQueryData(createUserQueryKey(["apiKeys"], userId));

      queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), (old: any) => {
        if (!old) return old;
        return old.map((key: any) =>
          key.id === id ? { ...key, enabled: false } : key
        );
      });

      return { previousKeys };
    },
    onError: (err, id, context) => {
      if (context?.previousKeys) {
        queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), context.previousKeys);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!api) throw new Error("Not authenticated");
      return api.apiKeys.delete(id);
    },
    onMutate: async (id: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });

      // Snapshot the previous value
      const previousKeys = queryClient.getQueryData(createUserQueryKey(["apiKeys"], userId));

      // Optimistically update to the new value
      queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), (old: any) => {
        if (!old) return old;
        return old.filter((key: any) => key.id !== id);
      });

      // Return a context object with the snapshotted value
      return { previousKeys };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousKeys) {
        queryClient.setQueryData(createUserQueryKey(["apiKeys"], userId), context.previousKeys);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: createUserQueryKey(["apiKeys"], userId) });
    },
  });

  const resetForm = () => {
    setName("");
    setTier("free");
    setRateLimit("60");
  };

  const handleCreate = () => {
    createMutation.mutate({
      name,
      tier,
      rate_limit_rpm: parseInt(rateLimit),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage API authentication keys</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Production API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tier">Tier</Label>
                <Input
                  id="tier"
                  placeholder="free"
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rateLimit">Rate Limit (requests/min)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.key.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{key.tier}</Badge>
                    </TableCell>
                    <TableCell>{key.rate_limit_rpm} req/min</TableCell>
                    <TableCell>
                      <Badge variant={key.enabled ? "default" : "destructive"}>
                        {key.enabled ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {key.enabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => revokeMutation.mutate(key.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
