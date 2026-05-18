import { QUARTER_LABELS } from "../../constants";
export default function QuarterTabs({ value, onChange }) {
  return <div className="mb-4 flex gap-2 rounded-xl border border-white/[0.06] bg-[#16161f] p-1">{QUARTER_LABELS.map((q) => <button key={q} onClick={() => onChange(q)} className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${value === q ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>{q}</button>)}</div>;
}
