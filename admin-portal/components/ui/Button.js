import { Loader2 } from "lucide-react";

export default function Button({ className = "", variant = "primary", isLoading = false, children, disabled, ...props }) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20",
    secondary: "bg-white/5 hover:bg-white/[0.08] text-slate-300 font-medium border border-white/[0.08] hover:border-white/[0.15]",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/20 hover:border-red-500/30",
    success: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/20",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium",
    icon: "p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300",
  };
  const base = variant === "icon"
    ? "inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    : "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
