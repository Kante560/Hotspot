"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const role = (session.user as any)?.role;

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Shield },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "Map", href: "/map", icon: MapIcon },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  if (role === "admin") {
    navItems.push({ name: "Officers", href: "/admin/officers", icon: Users });
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/90 backdrop-blur-md md:hidden">
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-brand-primary" : "text-text-secondary hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-text-secondary transition-colors hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
