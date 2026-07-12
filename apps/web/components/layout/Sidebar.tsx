"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Shield,
  Map as MapIcon,
  FileText,
  Users,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (!session) return null;

  const role = (session.user as any)?.role;
  const email = session.user?.email || "";
  const initial = email.charAt(0).toUpperCase();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Shield },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Map View", href: "/map", icon: MapIcon },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  if (role === "admin") {
    navItems.push({ name: "Officers", href: "/admin/officers", icon: Users });
  }

  return (
    <div className="sticky top-0 flex h-screen shrink-0">
      <aside
        className={cn(
          "h-screen shrink-0 overflow-hidden border-r border-white/10 bg-background/80 backdrop-blur-md transition-[width] duration-300 ease-in-out",
          open ? "w-64" : "w-0"
        )}
      >
        <div className="flex h-full w-64 flex-col">
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-5">
            <Shield className="h-6 w-6 text-brand-primary" />
            <span className="text-lg font-semibold tracking-tight text-white whitespace-nowrap">
              CRS Police
            </span>
          </Link>

          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/5 hover:text-white ${
                    isActive ? "bg-brand-primary/10 text-white" : "text-text-secondary"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-brand-primary">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{email}</p>
                <p className="text-xs text-text-secondary capitalize">{role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="h-auto shrink-0 rounded-md p-2 text-text-secondary hover:bg-white/5 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
        className={cn(
          "absolute top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-bg-surface text-text-secondary shadow-md transition-all duration-300 ease-in-out hover:text-white",
          open ? "left-64 -translate-x-1/2" : "left-0 translate-x-1/2"
        )}
      >
        {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </div>
  );
}
