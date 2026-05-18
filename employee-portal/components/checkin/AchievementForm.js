import Input from "../ui/Input";
import ProgressScoreDisplay from "./ProgressScoreDisplay";

export default function AchievementForm({ goal, value = {}, onChange }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#16161f] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-200">{goal.title}</h3>
          <p className="text-[12px] text-slate-500">Target: {String(goal.target)} | {goal.uomType}</p>
        </div>
        <ProgressScoreDisplay score={value.progressScore} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="Actual Achievement" type={goal.uomType === "timeline" ? "date" : "text"} value={value.actualAchievement || ""} onChange={(e) => onChange({ ...value, actualAchievement: e.target.value })} />
        <label className="block text-[12px] font-medium text-slate-400">Progress Status<select className="mt-1.5 w-full cursor-pointer appearance-none rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" value={value.progressStatus || "on_track"} onChange={(e) => onChange({ ...value, progressStatus: e.target.value })}><option value="not_started">Not Started</option><option value="on_track">On Track</option><option value="completed">Completed</option></select></label>
      </div>
      {value.managerComment && <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-[13px] text-amber-400">{value.managerComment}</p>}
    </div>
  );
}
