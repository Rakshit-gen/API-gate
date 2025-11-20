"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function RateLimitsPage() {
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: api.apiKeys.list,
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Rate Limits</h1>
        <p className="text-muted-foreground">View rate limit configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Configuration by API Key</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Key</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key: any) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{key.tier}</Badge>
                    </TableCell>
                    <TableCell>{key.rate_limit_rpm} requests/minute</TableCell>
                    <TableCell>
                      <Badge variant={key.enabled ? "default" : "destructive"}>
                        {key.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Algorithm</h3>
              <p className="text-sm text-muted-foreground">
                Token Bucket with sliding window
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Window Size</h3>
              <p className="text-sm text-muted-foreground">1 minute</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Response Headers</h3>
              <p className="text-sm text-muted-foreground">
                X-RateLimit-Limit: Maximum requests allowed per window
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">429 Response</h3>
              <p className="text-sm text-muted-foreground">
                Returned when rate limit is exceeded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
