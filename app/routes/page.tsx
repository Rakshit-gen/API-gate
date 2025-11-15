"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RoutesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [path, setPath] = useState("");
  const [backendURLs, setBackendURLs] = useState("");
  const [timeoutMs, setTimeoutMs] = useState("30000");
  const [retryCount, setRetryCount] = useState("0");

  const queryClient = useQueryClient();

  const { data: routes, isLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: api.routes.list,
  });

  const createMutation = useMutation({
    mutationFn: api.routes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.routes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const resetForm = () => {
    setPath("");
    setBackendURLs("");
    setTimeoutMs("30000");
    setRetryCount("0");
  };

  const handleCreate = () => {
    createMutation.mutate({
      path,
      backend_urls: backendURLs.split(",").map((url) => url.trim()),
      load_balancing_strategy: "round-robin",
      timeout_ms: parseInt(timeoutMs),
      retry_count: parseInt(retryCount),
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground">Manage proxy routes</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  placeholder="/api/users"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="backends">Backend URLs (comma-separated)</Label>
                <Input
                  id="backends"
                  placeholder="https://api1.example.com,https://api2.example.com"
                  value={backendURLs}
                  onChange={(e) => setBackendURLs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="retry">Retry Count</Label>
                <Input
                  id="retry"
                  type="number"
                  value={retryCount}
                  onChange={(e) => setRetryCount(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Route
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Backend URLs</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Timeout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes?.map((route: any) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.path}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {route.backend_urls.map((url: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {url}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{route.load_balancing_strategy}</TableCell>
                    <TableCell>{route.timeout_ms}ms</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(route.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
