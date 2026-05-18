const SEGMENT_COLORS = ["bg-indigo-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-blue-500", "bg-rose-500", "bg-teal-500", "bg-orange-500"];
const SEGMENT_DOT_COLORS = ["bg-indigo-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-blue-400", "bg-rose-400", "bg-teal-400", "bg-orange-400"];

export default function WeightageBar({ goals = [] }) {
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-white/5">
        {goals.map((goal, index) => (
          <div
            key={goal._id || index}
            title={`${goal.title}: ${goal.weightage}%`}
            className={`h-full rounded-full transition-all duration-500 ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
            style={{ width: `${goal.weightage}%` }}
          />
        ))}
      </div>
      {goals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {goals.map((goal, index) => (
            <div key={goal._id || index} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${SEGMENT_DOT_COLORS[index % SEGMENT_DOT_COLORS.length]}`} />
              <span className="max-w-[120px] truncate text-[11px] text-slate-500">{goal.title}</span>
              <span className="text-[11px] text-slate-600">{goal.weightage}%</span>
            </div>
          ))}
        </div>
      )}
      {goals.length === 0 && <p className="mt-2 text-[12px] text-slate-600">No goals allocated yet</p>}
      <p className="mt-2 text-[11px] text-slate-600">{totalWeightage}% of 100% allocated</p>
    </div>
  );
}
