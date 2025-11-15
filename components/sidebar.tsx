"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  Activity,
  BarChart3,
  Key,
  Gauge,
  Database,
  Route,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Routes", href: "/routes", icon: Route },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Rate Limits", href: "/rate-limits", icon: Gauge },
  { name: "Cache", href: "/cache", icon: Database },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">
            API Gateway
          </h1>
          <p className="text-xs text-gray-400">Rate Limiter</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Your Account</p>
            <p className="text-xs text-gray-400">Manage settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
