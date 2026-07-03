"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Sparkles, Lock, X } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { brand } from "@/config/brand.config";
import { homeNav, premiumSectionLabel } from "@/config/navigation.config";
import {
  getVisibleWorkflowSteps,
  getVisibleContentWorkflowSteps,
  getVisibleOutreachNav,
  getVisibleImageToolsNav,
  getVisibleTrafficToolsNav,
  getVisibleProductToolsNav,
  getCoreResourceNav,
  getVisibleResourceNav,
  getVisibleUpgradeNav,
  isNavItemLocked,
} from "@/lib/features";
import { getNavIcon } from "@/lib/nav-icons";
import { SidebarPromos } from "./PromoOrchestrator";
import { isFeatureEnabled } from "@/config/features.config";
import { LiveActivityTicker } from "@/features/dopamine/components/LiveActivityTicker";
import { dopamineWidgets } from "@/config/dopamine.config";
import { useWorkflowNav } from "@/context/WorkflowNavContext";
import { BrandLogo } from "./BrandLogo";
import { SidebarProfile } from "./SidebarProfile";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ICON_STROKE = 1.75;

function SidebarSectionLabel({
  children,
  first,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <span className={clsx("sidebar-section-label", !first && "mt-5")}>{children}</span>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const workflowSteps = getVisibleWorkflowSteps();
  const contentWorkflowSteps = getVisibleContentWorkflowSteps();
  const outreachNav = getVisibleOutreachNav();
  const imageToolsNav = getVisibleImageToolsNav();
  const trafficToolsNav = getVisibleTrafficToolsNav();
  const productToolsNav = getVisibleProductToolsNav();
  const coreResourceNav = getCoreResourceNav();
  const resourceNav = getVisibleResourceNav();
  const upgradeNav = getVisibleUpgradeNav();
  const workflow = useWorkflowNav();

  const workflowProgress = workflow?.progress ?? 0;
  const currentWorkflowIndex = workflowSteps.findIndex((s) => s.path === pathname);
  const progress =
    currentWorkflowIndex >= 0
      ? ((currentWorkflowIndex + 1) / Math.max(workflowSteps.length, 1)) * 100
      : pathname === homeNav.path
        ? 0
        : 100;

  const handleLogout = async () => {
    onMobileClose?.();
    if (workflow?.resetSession) {
      await workflow.resetSession();
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const renderNavLink = (item: typeof homeNav) => {
    const isActive = pathname === item.path;
    const Icon = getNavIcon(item.icon);
    const locked = isNavItemLocked(item, workflowProgress);

    if (locked) {
      return (
        <div
          key={item.path}
          className="command-nav-link command-nav-link--locked group"
          title="Complete the previous step first"
        >
          <div className="flex items-center gap-3 min-w-0 pl-1">
            <Lock size={18} strokeWidth={NAV_ICON_STROKE} className="text-text-muted shrink-0" />
            <span className="text-sm font-medium text-text-muted leading-snug truncate">
              {item.label}
            </span>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={handleNavClick}
        className={clsx("command-nav-link group", isActive && "active")}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
          <Icon
            size={18}
            strokeWidth={NAV_ICON_STROKE}
            className={clsx(
              "shrink-0 transition-colors duration-200",
              isActive ? "text-brand-accent" : "text-text-secondary"
            )}
          />
          <span
            className={clsx(
              "text-sm font-medium leading-snug truncate transition-colors duration-200",
              isActive ? "text-text-primary" : "text-text-secondary"
            )}
          >
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-50 flex flex-col h-[100dvh] overflow-hidden border-r border-white/[0.05] shrink-0",
        "w-[min(18rem,88vw)] lg:static lg:w-72 lg:translate-x-0",
        "transition-transform duration-300 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ backgroundColor: brand.colors.sidebar }}
    >
      {workflowSteps.length > 0 && (
        <div className="absolute left-0 top-0 w-px h-full bg-white/[0.04] z-0">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            className="w-full shadow-[0_0_12px_rgba(139,92,246,0.35)]"
            style={{ backgroundColor: brand.colors.accent }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </div>
      )}

      <div className="flex flex-col p-4 sm:p-5 gap-5 relative z-10 h-full min-h-0">
        <div className="flex items-start justify-between gap-2 shrink-0">
          <Link href="/dashboard" className="min-w-0 flex-1" onClick={handleNavClick}>
            <BrandLogo size="sm" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onMobileClose}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors"
          >
            <X size={18} strokeWidth={NAV_ICON_STROKE} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 w-full flex-1 overflow-y-auto no-scrollbar min-h-0 pb-2">
          <SidebarSectionLabel first>Navigation</SidebarSectionLabel>
          {renderNavLink(homeNav)}

          {workflowSteps.length > 0 && (
            <>
              <SidebarSectionLabel>Workflow</SidebarSectionLabel>
              {workflowSteps.map((step) => renderNavLink(step))}
            </>
          )}

          {contentWorkflowSteps.length > 0 && (
            <>
              <SidebarSectionLabel>Content</SidebarSectionLabel>
              {contentWorkflowSteps.map((step) => renderNavLink(step))}
            </>
          )}

          {outreachNav.length > 0 && (
            <>
              <SidebarSectionLabel>Outreach</SidebarSectionLabel>
              {outreachNav.map((step) => renderNavLink(step))}
            </>
          )}

          {imageToolsNav.length > 0 && (
            <>
              <SidebarSectionLabel>Creatives</SidebarSectionLabel>
              {imageToolsNav.map((step) => renderNavLink(step))}
            </>
          )}

          {trafficToolsNav.length > 0 && (
            <>
              <SidebarSectionLabel>Planning</SidebarSectionLabel>
              {trafficToolsNav.map((step) => renderNavLink(step))}
            </>
          )}

          {productToolsNav.length > 0 && (
            <>
              <SidebarSectionLabel>Products</SidebarSectionLabel>
              {productToolsNav.map((step) => renderNavLink(step))}
            </>
          )}

          {coreResourceNav.length > 0 && (
            <>
              <SidebarSectionLabel>Resources</SidebarSectionLabel>
              {coreResourceNav.map((step) => renderNavLink(step))}
            </>
          )}

          {resourceNav.length > 0 && (
            <>
              <SidebarSectionLabel>More Training</SidebarSectionLabel>
              {resourceNav.map((step) => renderNavLink(step))}
            </>
          )}

          <div className="mt-4 flex flex-col gap-3">
            <SidebarPromos />

            {upgradeNav.length > 0 && (
              <div className="flex flex-col mx-0.5">
                <div className="bg-page/60 border border-white/[0.06] rounded-[12px] p-3 flex flex-col gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="text-brand-accent shrink-0" size={15} strokeWidth={NAV_ICON_STROKE} />
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-brand-accent uppercase">
                      {premiumSectionLabel}
                    </span>
                  </div>
                  {upgradeNav.map((step) => {
                    const isActive = pathname === step.path;
                    const Icon = getNavIcon(step.icon);
                    return (
                      <Link
                        key={step.path}
                        href={step.path}
                        onClick={handleNavClick}
                        className={clsx(
                          "flex items-center justify-center gap-2 py-2.5 rounded-full transition-all duration-300 border text-center",
                          isActive
                            ? "bg-white/[0.08] border-brand-accent/30 text-text-primary"
                            : "bg-transparent border-white/[0.05] text-text-secondary/50 hover:text-text-primary hover:border-white/10 hover:opacity-100 opacity-50"
                        )}
                      >
                        <Icon size={16} strokeWidth={NAV_ICON_STROKE} className="shrink-0" />
                        <span className="text-[13px] font-medium tracking-wide leading-tight">
                          {step.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          {isFeatureEnabled("dopamine") && dopamineWidgets.liveActivityTicker && (
            <LiveActivityTicker />
          )}
          <SidebarProfile />
          <button
            type="button"
            onClick={handleLogout}
            className="command-nav-link group text-red-400/50 hover:!opacity-100 hover:text-red-400 hover:bg-red-500/[0.06]"
          >
            <div className="flex items-center gap-3 pl-1">
              <LogOut size={18} strokeWidth={NAV_ICON_STROKE} className="shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
