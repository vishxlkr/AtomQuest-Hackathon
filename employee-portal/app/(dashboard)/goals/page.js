"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { useGoals } from "../../../hooks/useGoals";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import GoalList from "../../../components/goals/GoalList";
import WeightageBar from "../../../components/goals/WeightageBar";
import CenteredLoader from "../../../components/ui/CenteredLoader";
import PageHeader from "../../../components/ui/PageHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Plus, Send } from "lucide-react";

export default function GoalsPage() {
  const { sheet, goals, isLoading, meta, error, reload } = useGoals();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (isLoading) return <CenteredLoader />;
  const createSheet = async () => { try { await api.post("/goals/sheet/create"); reload(); } catch (err) { toast.error(err.response?.data?.error?.message || "Could not create goal sheet"); } };
  const submit = async () => {
    if (!sheet?._id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/goals/sheet/${sheet._id}/submit`);
      toast.success("Submitted for approval");
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (meta?.code === "NO_ACTIVE_CYCLE") return <Card><p className="text-[14px] text-slate-400">No active goal cycle is available yet. Ask an admin to create and activate a cycle.</p></Card>;
  if (error) return <Card><p className="mb-4 text-[13px] text-red-400">{error.message}</p><Button onClick={reload}>Retry</Button></Card>;
  if (!sheet) return <Card><p className="mb-4 text-[14px] text-slate-400">Create your goal sheet for the active cycle.</p><Button onClick={createSheet}>Create Goal Sheet</Button></Card>;
  const editable = ["draft", "returned"].includes(sheet.approvalStatus);
  return (
    <div className="space-y-5">
      <PageHeader
        pageName="Goals"
        title="My Goals"
        subtitle="Total weightage must equal exactly 100% before submission."
        action={<StatusBadge status={sheet.approvalStatus} />}
      />
      {sheet.managerRemarks && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[13px] text-red-400">{sheet.managerRemarks}</p>}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-200">Weightage Allocation</h3>
            <p className="mt-0.5 text-[12px] text-slate-500">{sheet.totalWeightage}% of 100% allocated across {goals.length} goals</p>
          </div>
          <Badge tone={sheet.totalWeightage === 100 ? "green" : sheet.totalWeightage > 100 ? "red" : "amber"}>{sheet.totalWeightage === 100 ? "Complete" : `${100 - sheet.totalWeightage}% remaining`}</Badge>
        </div>
        <WeightageBar goals={goals} />
      </Card>
      <div className="flex gap-3">
        {editable && <Link href="/goals/new"><Button><Plus size={14} />Add Goal</Button></Link>}
        {editable && sheet.totalWeightage === 100 && goals.length > 0 && <Button onClick={submit} isLoading={isSubmitting} disabled={isSubmitting}>{!isSubmitting && <Send size={14} />}Submit for Approval</Button>}
      </div>
      <GoalList goals={goals} currentUserId={user?.id || user?._id} editable={editable} />
    </div>
  );
}
