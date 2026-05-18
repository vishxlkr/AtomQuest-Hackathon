"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { clearToken } from "../../lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async (values) => {
    try {
      const user = await login(values.email, values.password);
      if (!["admin", "manager"].includes(user.role)) {
        clearToken();
        toast.error("Use the employee portal for this account");
        return;
      }
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Login failed");
    }
  };

  const handleMicrosoftLogin = async () => {
    if (isMicrosoftLoading) return;
    setIsMicrosoftLoading(true);
    try {
      const res = await api.get("/auth/azure/login?portal=admin");
      const authUrl = res.data?.authUrl || res.data?.data?.authUrl;
      if (!authUrl) {
        toast.error("Failed to get Microsoft login URL. Please try again.");
        setIsMicrosoftLoading(false);
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      setIsMicrosoftLoading(false);
      toast.error(err.response?.data?.error?.message || "SSO available in production environment");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-5 py-10 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[13px] text-slate-500">Admin Portal</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#16161f] p-6 shadow-2xl shadow-black/50 sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-100">Sign in</h1>
          </div>

          <form method="post" onSubmit={handleSubmit(submit)} className="space-y-4">
            <label className="block text-[12px] font-medium text-slate-400">
              Email
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-white/[0.08] bg-[#13131a] px-3 transition focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20">
                <Mail className="h-5 w-5 text-slate-400" />
                <input className="w-full bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-600" type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />
              </span>
              {errors.email && <span className="mt-1 block text-[11px] text-red-400">{errors.email.message}</span>}
            </label>

            <label className="block text-[12px] font-medium text-slate-400">
              Password
              <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-white/[0.08] bg-[#13131a] px-3 transition focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20">
                <LockKeyhole className="h-5 w-5 text-slate-400" />
                <input className="w-full bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-600" type={showPassword ? "text" : "password"} placeholder="Enter password" autoComplete="current-password" {...register("password")} />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              {errors.password && <span className="mt-1 block text-[11px] text-red-400">{errors.password.message}</span>}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#16161f] px-3 font-medium uppercase text-slate-600">or</span>
            </div>
          </div>

          <button
            onClick={handleMicrosoftLogin}
            disabled={isMicrosoftLoading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/[0.08] bg-white/5 px-4 text-[13px] font-semibold text-slate-300 transition hover:border-white/[0.15] hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
              <span className="bg-[#f25022]" />
              <span className="bg-[#7fba00]" />
              <span className="bg-[#00a4ef]" />
              <span className="bg-[#ffb900]" />
            </span>
            {isMicrosoftLoading ? "Redirecting..." : "Sign in with Microsoft"}
          </button>
        </div>
      </section>
    </main>
  );
}
