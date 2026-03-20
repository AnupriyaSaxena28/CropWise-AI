/**
 * app/login/page.tsx
 * Authentication page — Email/Password + Google Sign-in via Firebase Auth.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [mode,     setMode]     = useState<"login" | "signup">("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*?\)\.?/, "").trim());
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.replace("Firebase: ", "").trim());
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0b1410] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#4dc24d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0b1410] flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(77,194,77,1) 1px,transparent 1px),linear-gradient(90deg,rgba(77,194,77,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2ea82e]/20 border border-[#2ea82e]/40 flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-[#4dc24d]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-[#e8f5e9]">CropWise AI</h1>
          <p className="text-sm text-[#5a7460] mt-1">The Digital Agronomist</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#111d16] border border-[#2a3d2c] p-6 space-y-5">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#2a3d2c]">
            {(["login","signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
                className={cn("flex-1 py-2.5 text-sm font-medium transition-colors",
                  mode === m ? "bg-[#2ea82e] text-[#0b1410]" : "text-[#5a7460] hover:text-[#94a896]"
                )}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7460]" />
                <input type="email" required value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  className="input-field pl-10 text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#5a7460] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a7460]" />
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••" minLength={6}
                  className="input-field pl-10 pr-10 text-sm" />
                <button type="button" onClick={() => setShowPw((p: boolean) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7460] hover:text-[#94a896]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-900/20 border border-rose-800/40">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={busy}
              className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2a3d2c]" />
            <span className="text-xs text-[#5a7460]">or</span>
            <div className="flex-1 h-px bg-[#2a3d2c]" />
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogle} disabled={busy}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-[#2a3d2c] text-sm font-medium text-[#94a896] hover:border-[#3d5c40] hover:text-[#e8f5e9] hover:bg-[#1f2f21] transition-all disabled:opacity-50">
            {/* Google icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-[#3d4d3e] mt-6">
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  );
}