"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import { useGoals } from "../../../../hooks/useGoals";
import GoalForm from "../../../../components/goals/GoalForm";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";

export default function NewGoalPage() {
  const router = useRouter();
  const { sheet, goals, meta, error } = useGoals();
  const remaining = 100 - goals.reduce((s, g) => s + Number(g.weightage || 0), 0);
  const save = async (values) => { try { await api.post(`/goals/sheet/${sheet._id}/goals`, values); router.push("/goals"); } catch (err) { toast.error(err.response?.data?.error?.message || "Could not save goal"); } };
  if (meta?.code === "NO_ACTIVE_CYCLE") return <Card><p className="text-[14px] text-slate-400">No active goal cycle is available yet. Ask an admin to create and activate a cycle.</p></Card>;
  if (error) return <Card><p className="text-[13px] text-red-400">{error.message}</p></Card>;
  return <div><PageHeader pageName="Goals / New" title="Add Goal" subtitle="Define the target, unit of measurement, and weightage for this cycle." />{sheet && <GoalForm remaining={remaining} onSubmit={save} />}</div>;
}
