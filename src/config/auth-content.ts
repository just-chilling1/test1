import { brand } from "./brand.config";

export const authContent = {
  login: {
    title: "Welcome back",
    subtitle: brand.authTagline,
    submitLabel: "Sign In",
    loadingLabel: "Signing in...",
    forgotPasswordLabel: "Forgot Password?",
    footerText: "Don't have an account?",
    footerLinkText: "Create account",
  },
  signup: {
    title: brand.signupTagline,
    subtitle: `Create your ${brand.productName} account and start in minutes.`,
    submitLabel: "Create Account",
    loadingLabel: "Creating account...",
    footerText: "Already have an account?",
    footerLinkText: "Sign in",
    verifyEmail: {
      title: "Verify your email",
      description:
        "We sent a confirmation link to your inbox. Open it to activate your account — you'll land on onboarding next.",
      backToLogin: "Back to Sign In",
    },
  },
  forgotPassword: {
    title: "Reset password",
    titleSent: "Check your inbox",
    subtitle: "Enter your email and we'll send you a reset link",
    subtitleSent: "We sent a reset link to your email",
    submitLabel: "Send Reset Link",
    loadingLabel: "Sending...",
    footerText: "Remember your password?",
    footerLinkText: "Sign in",
    backToLogin: "Back to Sign In",
    sentMessage: (email: string) =>
      `We sent a password reset link to ${email}.`,
  },
  resetPassword: {
    verifying: "Verifying your reset link...",
    successTitle: "Password updated!",
    successSubtitle: "Redirecting you to login...",
    invalidTitle: "Link expired or invalid",
    newPasswordTitle: "New Password",
    newPasswordSubtitle: "Enter your new password below",
    submitLabel: "Update Password",
    loadingLabel: "Updating...",
    requestNewLink: "Request New Reset Link",
    backToLogin: "Back to Login",
  },
  encryptionBadge: "256-bit Encrypted",
} as const;

export function getAuthCallbackUrl(next = "/dashboard"): string {
  const base =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = `/auth/callback?next=${encodeURIComponent(next)}`;
  return `${base.replace(/\/$/, "")}${path}`;
}
