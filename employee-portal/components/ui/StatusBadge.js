const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  returned: { label: "Returned", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  locked: { label: "Locked", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  not_started: { label: "Not Started", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  on_track: { label: "On Track", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  completed: { label: "Completed", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
