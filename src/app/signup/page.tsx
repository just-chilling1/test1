"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ShieldAlert, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ONBOARDING_META_KEY } from "@/config/onboarding-content";
import { authContent, getAuthCallbackUrl } from "@/config/auth-content";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { AuthSubmitButton, AuthDivider, AuthFooterLink } from "@/components/auth/AuthSubmitButton";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { webhooks } from "@/config/webhooks.config";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/onboarding"),
          data: {
            full_name: name,
            [ONBOARDING_META_KEY]: false,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (webhooks.signup) {
        const firstName = name.trim().split(/\s+/)[0];
        fetch(webhooks.signup, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, email }),
        }).catch(() => {});
      }

      if (data.session) {
        window.location.href = "/onboarding";
        return;
      }

      if (data.user) {
        setVerifyEmailSent(true);
        setLoading(false);
        return;
      }

      window.location.href = "/login";
    } catch {
      setError("An unexpected system error occurred.");
      setLoading(false);
    }
  };

  const passwordToggle = (visible: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="text-[#4a6080] hover:text-[#00c9a7] transition-colors"
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  if (verifyEmailSent) {
    return (
      <AuthLayout
        title={authContent.signup.verifyEmail.title}
        subtitle={authContent.signup.verifyEmail.description}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 py-2"
        >
          <div className="w-16 h-16 bg-[#00c9a7]/10 border border-[#00c9a7]/20 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[#00c9a7]" />
          </div>
          <p className="text-sm text-[#6b8299] text-center max-w-xs">
            Confirmation sent to <strong className="text-white">{email}</strong>.
          </p>
          <Link
            href="/login"
            className="auth-btn-gradient w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white"
          >
            <Mail size={16} />
            {authContent.signup.verifyEmail.backToLogin}
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={authContent.signup.title} subtitle={authContent.signup.subtitle}>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
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

        <AuthFormField icon={User} placeholder="Full Name" value={name} onChange={setName} />

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
          placeholder="Create Password"
          value={password}
          onChange={setPassword}
          rightElement={passwordToggle(showPassword, () => setShowPassword(!showPassword))}
        />

        <AuthFormField
          icon={Lock}
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          rightElement={passwordToggle(showConfirmPassword, () =>
            setShowConfirmPassword(!showConfirmPassword)
          )}
        />

        <AuthSubmitButton loading={loading} loadingText={authContent.signup.loadingLabel}>
          {authContent.signup.submitLabel}
        </AuthSubmitButton>
      </form>

      <AuthDivider />
      <AuthSocialButtons />
      <AuthFooterLink
        text={authContent.signup.footerText}
        linkText={authContent.signup.footerLinkText}
        href="/login"
      />
    </AuthLayout>
  );
}
