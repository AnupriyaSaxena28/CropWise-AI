/**
 * components/layout/Sidebar.tsx
 * Responsive sidebar navigation for CropWise AI.
 *
 * - Desktop: fixed left sidebar (256px wide)
 * - Mobile: slides in as a drawer overlay
 * - Icons: Lucide React only (NO emojis)
 * - Active state: highlighted with green accent
 */

"use client";
import React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  ScanSearch,
  Lightbulb,
  TrendingUp,
  CloudSun,
  FileText,
  User,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Nav Config ───────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<LucideProps>;
  badge?: string;
  description: string; // Shown as tooltip when collapsed
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and stats",
  },
  {
    label: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
    badge: "AI",
    description: "Talk to your crop advisor",
  },
  {
    label: "Pest Diagnosis",
    href: "/pest-diagnosis",
    icon: ScanSearch,
    badge: "Vision",
    description: "Upload crop image to diagnose",
  },
  {
    label: "Crop Advisor",
    href: "/crop-advisor",
    icon: Lightbulb,
    description: "Get crop recommendations",
  },
  {
    label: "Market Prices",
    href: "/market",
    icon: TrendingUp,
    description: "Live mandi prices & MSP",
  },
  {
    label: "Weather",
    href: "/weather",
    icon: CloudSun,
    description: "Forecast & agri-advisories",
  },
  {
    label: "Schemes",
    href: "/schemes",
    icon: FileText,
    description: "Govt. schemes & subsidies",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "Your farm settings",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Mobile drawer is controlled externally via AppShell */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for localStorage-persisted collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  if (!mounted) return null; // Prevent SSR flash

  return (
    <>
      {/* ── Mobile Overlay Backdrop ───────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Panel ──────────────────────────────────────────── */}
      <aside
        className={cn(
          // Base styles
          "fixed top-0 left-0 h-full z-50 flex flex-col",
          "bg-[#0d1a10] border-r border-[#2a3d2c]",
          "transition-all duration-300 ease-in-out",
          // Width toggle
          collapsed ? "w-[72px]" : "w-64",
          // Mobile: translate off-screen by default, show when mobileOpen
          "translate-x-[-100%] lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
        aria-label="Main navigation"
      >
        {/* ── Logo / Brand ─────────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-[#2a3d2c] flex-shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-w-0"
            onClick={onMobileClose}
          >
            {/* Logo mark */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2ea82e]/20 border border-[#2ea82e]/40 flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-[#4dc24d]" strokeWidth={2} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block font-semibold text-sm text-[#e8f5e9] leading-tight truncate">
                  CropWise AI
                </span>
                <span className="block text-[10px] text-[#5a7460] leading-tight truncate">
                  Smart Farming Advisor
                </span>
              </div>
            )}
          </Link>

          {/* Close button (mobile) */}
          {!collapsed && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-md text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Navigation Items ──────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // Base styles
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-150 group relative",
                  // Default state
                  "text-[#94a896] hover:text-[#e8f5e9] hover:bg-[#1f2f21]",
                  // Active state
                  isActive && [
                    "text-[#4dc24d] bg-[#2ea82e]/10",
                    "border border-[#2ea82e]/20",
                    "hover:bg-[#2ea82e]/15",
                  ],
                  // Collapsed: center icon
                  collapsed && "justify-center px-2"
                )}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "flex-shrink-0 w-[18px] h-[18px] transition-colors",
                    isActive ? "text-[#4dc24d]" : "text-[#5a7460] group-hover:text-[#94a896]"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label + Badge */}
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide",
                          isActive
                            ? "bg-[#2ea82e]/20 text-[#4dc24d]"
                            : "bg-[#182419] text-[#5a7460]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed tooltip */}
                {collapsed && (
                  <div
                    className={cn(
                      "absolute left-full ml-2 z-50",
                      "px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap",
                      "bg-[#182419] border border-[#2a3d2c] text-[#e8f5e9]",
                      "shadow-xl pointer-events-none",
                      "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0",
                      "transition-all duration-150"
                    )}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-[#2a3d2c] p-2 space-y-1">
          {/* Notifications shortcut */}
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Notifications" : undefined}
          >
            <Bell className="flex-shrink-0 w-[18px] h-[18px]" strokeWidth={2} />
            {!collapsed && <span>Notifications</span>}
          </button>

          {/* Sign out */}
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#5a7460] hover:text-rose-400 hover:bg-rose-900/10 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Sign Out" : undefined}
            onClick={() => {
              // TODO: wire to Firebase Auth signOut()
              console.log("Sign out");
            }}
          >
            <LogOut className="flex-shrink-0 w-[18px] h-[18px]" strokeWidth={2} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
              "text-[#5a7460] hover:text-[#94a896] hover:bg-[#1f2f21] transition-colors",
              collapsed && "justify-center px-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Mobile Menu Trigger ──────────────────────────────────────────────────────

interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-[#94a896] hover:text-[#e8f5e9] hover:bg-[#1f2f21] transition-colors"
      aria-label="Open navigation menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}