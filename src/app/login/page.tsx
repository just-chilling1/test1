"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton, AuthDivider, AuthFooterLink } from "@/components/auth/AuthSubmitButton";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { authContent } from "@/config/auth-content";
import { socialProof } from "@/config/social-proof.config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else if (data.user) {
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
      }
    } catch {
      setError("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={authContent.login.title} subtitle={authContent.login.subtitle}>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-3 text-red-400 text-sm"
          >
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AuthFormField
          icon={Mail}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={setEmail}
        />

        <AuthFormField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={setPassword}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#4a6080] hover:text-[#00c9a7] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="flex justify-end -mt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-[#4a6080] hover:text-[#00c9a7] transition-colors"
          >
            {authContent.login.forgotPasswordLabel}
          </Link>
        </div>

        <AuthSubmitButton loading={loading} loadingText={authContent.login.loadingLabel}>
          {authContent.login.submitLabel}
        </AuthSubmitButton>
      </form>

      <AuthDivider />
      <AuthSocialButtons />
      <AuthFooterLink
        text={authContent.login.footerText}
        linkText={authContent.login.footerLinkText}
        href="/signup"
      />

      {socialProof.enabled && socialProof.loginPage.activeMembers > 0 && (
        <p className="text-center text-[11px] text-[#4a6080] -mt-2">
          <strong className="text-[#00c9a7]">{socialProof.loginPage.activeMembers}</strong> members active now
        </p>
      )}
    </AuthLayout>
  );
}
