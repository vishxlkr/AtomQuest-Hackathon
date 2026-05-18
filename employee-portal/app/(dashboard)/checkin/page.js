"use client";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { useGoals } from "../../../hooks/useGoals";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import QuarterTabs from "../../../components/checkin/QuarterTabs";
import AchievementForm from "../../../components/checkin/AchievementForm";
import PageHeader from "../../../components/ui/PageHeader";

function score(goal, achievement) {
  if (achievement === undefined || achievement === "") return null;
  if (goal.uomType === "min") return Math.min(150, Math.round((Number(achievement) / Number(goal.target)) * 10000) / 100);
  if (goal.uomType === "max") return Number(achievement) ? Math.min(150, Math.round((Number(goal.target) / Number(achievement)) * 10000) / 100) : null;
  if (goal.uomType === "zero") return Number(achievement) === 0 ? 100 : 0;
  return 100;
}

export default function CheckinPage() {
  const { sheet, goals, reload } = useGoals();
  const [quarter, setQuarter] = useState("Q4");
  const [values, setValues] = useState({});
  const lockedGoals = useMemo(() => goals.filter(() => sheet?.isLocked), [goals, sheet]);
  const save = async () => {
    const items = lockedGoals.map((goal) => ({ goalId: goal._id, quarter, ...values[goal._id] }));
    try { await api.patch("/checkin/quarterly", { items }); toast.success("Achievements saved"); reload(); }
    catch (err) { toast.error(err.response?.data?.error?.message || "Window may be closed"); }
  };
  return <div className="space-y-5"><PageHeader pageName="Check-in" title="Quarterly Check-in" subtitle="Achievement entry is available only during the configured quarter window." /><QuarterTabs value={quarter} onChange={setQuarter} />{!sheet?.isLocked && <Card><p className="text-[14px] text-slate-400">Your sheet must be approved and locked before quarterly achievements can be entered.</p></Card>}<div className="space-y-3">{lockedGoals.map((goal) => { const current = goal.quarterly?.find((q) => q.quarter === quarter) || {}; const value = { ...current, ...(values[goal._id] || {}) }; value.progressScore = score(goal, value.actualAchievement); return <AchievementForm key={goal._id} goal={goal} value={value} onChange={(next) => setValues((state) => ({ ...state, [goal._id]: next }))} />; })}</div>{lockedGoals.length > 0 && <Button onClick={save}>Save All</Button>}</div>;
}
