import { TrendingUp } from "lucide-react";

export default function ProgressScoreDisplay({ score }) {
  if (score === null || score === undefined) return <span className="text-[12px] italic text-slate-600">Not entered yet</span>;
  const value = Number(score);
  const tone = value >= 80
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : value >= 50
      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
      : "bg-red-500/10 text-red-400 border-red-500/20";
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-bold tabular-nums ${tone}`}>
      <TrendingUp size={13} />
      {value.toFixed(1)}%
    </div>
  );
}
