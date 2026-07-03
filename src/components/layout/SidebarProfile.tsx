"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const ICON_STROKE = 1.75;

function getDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.display_name === "string" && meta.display_name);

  if (fromMeta) return fromMeta;

  const email = user.email ?? "";
  const local = email.split("@")[0];
  if (!local) return "Member";

  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function SidebarProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const displayName = user ? getDisplayName(user) : "Member";
  const initials = getInitials(displayName);

  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile-avatar" aria-hidden>
        {initials}
      </div>
      <div className="sidebar-profile-info min-w-0 flex-1">
        <p className="sidebar-profile-name truncate">{displayName}</p>
        {user?.email && (
          <p className="sidebar-profile-email truncate">{user.email}</p>
        )}
      </div>
      <Link
        href="/support"
        className="sidebar-profile-settings"
        aria-label="Account settings"
        title="Settings"
      >
        <Settings size={16} strokeWidth={ICON_STROKE} />
      </Link>
    </div>
  );
}
