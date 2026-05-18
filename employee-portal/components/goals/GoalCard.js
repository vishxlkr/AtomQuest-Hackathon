import Badge from "../ui/Badge";
import Card from "../ui/Card";
import SharedGoalBadge from "./SharedGoalBadge";
import { BarChart2, Share2 } from "lucide-react";

const THRUST_COLORS = {
  Operations: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Finance: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Customer: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Innovation: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  HR: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function GoalCard({ goal, currentUserId }) {
  const isPrimaryOwner = goal.isShared && goal.primaryOwnerId && String(goal.primaryOwnerId) === String(currentUserId);
  return (
    <Card className="group hover:border-white/10 hover:bg-[#1a1a24]">
      <div className="mb-3 flex items-start justify-between">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${THRUST_COLORS[goal.thrustArea] || THRUST_COLORS.Other}`}>
          {goal.thrustArea}
        </span>
        <SharedGoalBadge isShared={goal.isShared} />
      </div>
      <h3 className="mb-1 text-[14px] font-semibold leading-snug text-slate-200">{goal.title}</h3>
      {goal.description && <p className="mb-3 line-clamp-2 text-[12px] text-slate-500">{goal.description}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[11px] text-slate-400">
          <BarChart2 size={10} />
          {goal.uomType?.toUpperCase()}
        </span>
        <span className="text-[11px] text-slate-500">
          Target: <span className="font-medium text-slate-300">{String(goal.target)}</span>
        </span>
        <span className="ml-auto rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[12px] font-semibold text-indigo-400">
          {goal.weightage}%
        </span>
      </div>
      {goal.isShared && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-violet-500/15 bg-violet-500/[0.08] px-3 py-1.5 text-[11px] text-violet-400">
          <Share2 size={11} />
          {isPrimaryOwner ? `Shared goal - you are the primary owner. Syncs to ${goal.sharedLinkedCount || 0} linked sheets.` : "Shared goal - achievement synced from primary owner"}
        </div>
      )}
    </Card>
  );
}
