"use client";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../../../lib/api";
import { useGoals } from "../../../../../hooks/useGoals";
import GoalForm from "../../../../../components/goals/GoalForm";
import PageHeader from "../../../../../components/ui/PageHeader";

export default function EditGoalPage() {
  const { id } = useParams();
  const router = useRouter();
  const { goals } = useGoals();
  const goal = goals.find((g) => g._id === id);
  const remaining = 100 - goals.filter((g) => g._id !== id).reduce((s, g) => s + Number(g.weightage || 0), 0);
  const save = async (values) => { try { await api.patch(`/goals/${id}`, values); router.push("/goals"); } catch (err) { toast.error(err.response?.data?.error?.message || "Could not update goal"); } };
  return <div><PageHeader pageName="Goals / Edit" title="Edit Goal" subtitle="Update goal details without changing approval workflow." />{goal && <GoalForm goal={goal} remaining={remaining} onSubmit={save} />}</div>;
}
