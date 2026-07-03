"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton, AuthFooterLink } from "@/components/auth/AuthSubmitButton";
import { authContent, getAuthCallbackUrl } from "@/config/auth-content";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={sent ? authContent.forgotPassword.titleSent : authContent.forgotPassword.title}
      subtitle={sent ? authContent.forgotPassword.subtitleSent : authContent.forgotPassword.subtitle}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 py-2"
        >
          <div className="w-16 h-16 bg-[#00c9a7]/10 border border-[#00c9a7]/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#00c9a7]" />
          </div>
          <p className="text-sm text-[#6b8299] text-center max-w-xs">
            {authContent.forgotPassword.sentMessage(email)}
          </p>
          <Link href="/login" className="auth-btn-gradient w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white">
            <ArrowLeft size={16} />
            {authContent.forgotPassword.backToLogin}
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AuthFormField
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={setEmail}
          />

          <AuthSubmitButton loading={loading} loadingText={authContent.forgotPassword.loadingLabel}>
            {authContent.forgotPassword.submitLabel}
          </AuthSubmitButton>
        </form>
      )}

      {!sent && (
        <AuthFooterLink
          text={authContent.forgotPassword.footerText}
          linkText={authContent.forgotPassword.footerLinkText}
          href="/login"
        />
      )}

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#4a6080]">
        <ShieldCheck size={12} className="text-[#00c9a7]" />
        <span>{authContent.encryptionBadge}</span>
      </div>
    </AuthLayout>
  );
}
