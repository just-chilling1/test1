"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function AuthSubmitButton({ loading, loadingText, children, disabled }: AuthSubmitButtonProps) {
  return (
    <button type="submit" disabled={loading || disabled} className="auth-btn-gradient relative w-full">
      <span className="flex items-center justify-center gap-2">
        {loading ? loadingText : children}
      </span>
      {!loading && <ArrowRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2" />}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-1">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[11px] font-medium tracking-widest text-[#4a6080]">OR</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

export function AuthFooterLink({ text, linkText, href }: { text: string; linkText: string; href: string }) {
  return (
    <p className="text-center text-sm text-[#4a6080]">
      {text}{" "}
      <Link href={href} className="text-[#00c9a7] font-semibold hover:text-[#00f2ff] transition-colors">
        {linkText}
      </Link>
    </p>
  );
}
