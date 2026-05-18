import { AlertCircle } from "lucide-react";

export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-[12px] font-medium text-slate-400">{label}</span>}
      <input
        className={`w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </label>
  );
}
