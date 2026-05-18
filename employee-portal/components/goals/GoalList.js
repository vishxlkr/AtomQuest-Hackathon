import GoalCard from "./GoalCard";
export default function GoalList({ goals = [], currentUserId, editable = false }) {
  if (!goals.length) return <p className="rounded-xl border border-dashed border-white/[0.08] bg-[#16161f] p-6 text-center text-[13px] text-slate-500">No goals added yet.</p>;
  return <div className="space-y-3">{goals.map((goal) => <GoalCard key={goal._id} goal={goal} currentUserId={currentUserId} editable={editable} />)}</div>;
}
