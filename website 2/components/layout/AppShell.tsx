/**
 * components/layout/AppShell.tsx
 * Authenticated app shell — wraps all protected pages.
 * Includes AuthGuard, Sidebar, and top header with real user data.
 */

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, LogOut } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar, { MobileMenuButton } from "./Sidebar";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":      { title: "Dashboard",       subtitle: "Your farm at a glance"                },
  "/chat":           { title: "AI Chat",          subtitle: "Ask your crop advisor anything"       },
  "/pest-diagnosis": { title: "Pest Diagnosis",   subtitle: "Upload a photo to identify disease"  },
  "/crop-advisor":   { title: "Crop Advisor",     subtitle: "Get AI-powered crop recommendations" },
  "/market":         { title: "Market Prices",    subtitle: "Live mandi prices & MSP tracker"     },
  "/weather":        { title: "Weather",          subtitle: "Forecast & agricultural advisories"  },
  "/schemes":        { title: "Govt. Schemes",    subtitle: "Subsidies & schemes for farmers"     },
  "/profile":        { title: "Profile",          subtitle: "Your farm settings & preferences"    },
  "/activity-log":   { title: "Activity Log",     subtitle: "Digital ledger of farm operations"   },
  "/settings":       { title: "Settings",         subtitle: "App preferences & notifications"     },
};

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname  = usePathname();
  const { user, signOut } = useAuth();
  const router    = useRouter();

  const pageMeta =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k)) ?? ""] ??
    { title: "CropWise AI", subtitle: "" };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  // Get initials from display name or email
  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "Farmer";

  return (
    <AuthGuard>
      <div className="min-h-dvh bg-[#0b1410]">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="transition-all duration-300 ease-in-out lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 md:px-6 border-b border-[#2a3d2c] bg-[#0b1410]/90 backdrop-blur-md">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-[#e8f5e9] leading-tight truncate">
                {pageMeta.title}
              </h1>
              {pageMeta.subtitle && (
                <p className="hidden sm:block text-xs text-[#5a7460] leading-tight">
                  {pageMeta.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="relative p-2 rounded-lg text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4dc24d] border-2 border-[#0b1410]" />
              </button>

              {/* User avatar + sign out */}
              <div className="flex items-center gap-2 pl-2">
                <div className="w-7 h-7 rounded-full bg-[#2ea82e]/20 border border-[#2ea82e]/40 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-[#4dc24d]">{initials}</span>
                  )}
                </div>
                <span className="hidden sm:block text-xs font-medium text-[#94a896]">{displayName}</span>
                <button onClick={handleSignOut} title="Sign out"
                  className="p-1.5 rounded-lg text-[#5a7460] hover:text-rose-400 hover:bg-rose-900/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100dvh-4rem)]">
            {children ?? null}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}