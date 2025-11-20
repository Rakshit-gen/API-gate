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
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Routes", href: "/dashboard/routes", icon: Route },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { name: "Rate Limits", href: "/dashboard/rate-limits", icon: Gauge },
  { name: "Cache", href: "/dashboard/cache", icon: Database },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-72 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Logo Section */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-50 blur-sm" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            API Gateway
          </h1>
          <p className="text-xs text-gray-400">Rate Limiter</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isActive
                    ? "text-blue-400"
                    : "text-gray-500 group-hover:text-gray-300 group-hover:scale-110"
                )}
              />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10 ring-2 ring-blue-500/50",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Your Account</p>
            <p className="text-xs text-gray-400 truncate">Manage settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
