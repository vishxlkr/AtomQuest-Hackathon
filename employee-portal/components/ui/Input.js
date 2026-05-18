"use client";

import { forwardRef, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input({ label, error, className = "", type = "text", ...props }, ref) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[12px] font-medium text-slate-400">{label}</span>}
      <span className="relative block">
        <input
          ref={ref}
          type={isPassword && showPassword ? "text" : type}
          className={`w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 ${isPassword ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </span>
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </label>
  );
});

export default Input;
