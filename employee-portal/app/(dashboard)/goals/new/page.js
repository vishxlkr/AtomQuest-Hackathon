"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import { useGoals } from "../../../../hooks/useGoals";
import GoalForm from "../../../../components/goals/GoalForm";
import Card from "../../../../components/ui/Card";
import PageHeader from "../../../../components/ui/PageHeader";
import CenteredLoader from "../../../../components/ui/CenteredLoader";

export default function NewGoalPage() {
  const router = useRouter();
  const { sheet, goals, isLoading, meta, error } = useGoals();
  const [isSaving, setIsSaving] = useState(false);
  const remaining = 100 - goals.reduce((s, g) => s + Number(g.weightage || 0), 0);
  const save = async (values) => {
    if (!sheet?._id || isSaving) return;
    if (Number(values.weightage || 0) > remaining) {
      toast.error(`Only ${remaining}% weightage is available`);
      return;
    }
    setIsSaving(true);
    try {
      await api.post(`/goals/sheet/${sheet._id}/goals`, values);
      toast.success("Goal saved");
      router.push("/goals");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Could not save goal");
      setIsSaving(false);
    }
  };
  if (isLoading) return <CenteredLoader label="Loading goal sheet..." />;
  if (meta?.code === "NO_ACTIVE_CYCLE") return <Card><p className="text-[14px] text-slate-400">No active goal cycle is available yet. Ask an admin to create and activate a cycle.</p></Card>;
  if (error) return <Card><p className="text-[13px] text-red-400">{error.message}</p></Card>;
  if (!sheet) return <Card><p className="text-[14px] text-slate-400">Goal sheet is not available yet.</p></Card>;
  return <div><PageHeader pageName="Goals / New" title="Add Goal" subtitle="Define the target, unit of measurement, and weightage for this cycle." /><GoalForm remaining={remaining} onSubmit={save} isSubmitting={isSaving} /></div>;
}
