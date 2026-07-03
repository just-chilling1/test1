"use client";

import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthFeatureCallouts } from "@/components/auth/AuthFeatureCallouts";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <AuthBackground />
      <AuthFeatureCallouts />

      <div className="w-full max-w-[440px] relative z-10 auth-card-enter">
        <div className="auth-card">
          <div
            className="auth-card-glass"
            aria-hidden
            style={{ backgroundColor: "rgba(8, 14, 24, 0.6)" }}
          />
          <div className="auth-card-content p-7 sm:p-9 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
              <AuthBrandHeader />
              <div className="flex flex-col items-center gap-1.5 mt-1">
                <h1 className="brand-font text-2xl sm:text-[28px] font-bold text-white tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-[#6b8299]">{subtitle}</p>
                )}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
