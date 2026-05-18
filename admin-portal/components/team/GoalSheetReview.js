import Badge from "../ui/Badge";
export default function GoalSheetReview({ sheet }) {
  return <div className="space-y-3">{sheet?.goals?.map((goal) => <div key={goal._id} className="rounded-xl border border-white/[0.06] bg-[#16161f] p-4"><div className="flex justify-between gap-4"><div><Badge>{goal.thrustArea}</Badge><h3 className="mt-2 text-[14px] font-semibold text-slate-200">{goal.title}</h3><p className="text-[12px] text-slate-500">{goal.uomType} | Target: {String(goal.target)}</p></div><p className="font-semibold text-indigo-400">{goal.weightage}%</p></div></div>)}</div>;
}
