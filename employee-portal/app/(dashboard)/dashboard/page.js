"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useGoals } from "../../../hooks/useGoals";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import WeightageBar from "../../../components/goals/WeightageBar";
import PageHeader from "../../../components/ui/PageHeader";
import { Calendar, CalendarDays, CheckCircle2, ClipboardCheck, Clock, FileText, Target, Users } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "manager") return <ManagerDashboard user={user} />;
  return <EmployeeDashboard user={user} />;
}

function ManagerDashboard({ user }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/reports/completion-dashboard").then((res) => setData(res.data.data)); }, []);
  const stats = [
    ["Team size", data?.totalEmployees, Users],
    ["Submitted", data?.submitted, ClipboardCheck],
    ["Approved", data?.approved, CheckCircle2],
    ["My check-ins done", data?.quarterlyCompletion?.Q1?.done || 0, Target],
  ];
  return (
    <div className="space-y-5">
      <PageHeader pageName="Dashboard" title="Dashboard" subtitle={`Signed in as ${user?.name || "User"} (${user?.role || "role"})`} />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <Card key={label} className="hover:border-white/10 hover:bg-[#1a1a24]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10"><Icon size={15} className="text-indigo-400" /></div>
            </div>
            <p className="text-[28px] font-bold leading-none tabular-nums text-slate-100">{value || 0}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/team"><Card className="text-[14px] font-semibold text-slate-200 hover:border-white/10 hover:bg-[#1a1a24]">Team goal approvals</Card></Link>
        <Link href="/checkins"><Card className="text-[14px] font-semibold text-slate-200 hover:border-white/10 hover:bg-[#1a1a24]">Quarterly check-ins</Card></Link>
        <Link href="/reports"><Card className="text-[14px] font-semibold text-slate-200 hover:border-white/10 hover:bg-[#1a1a24]">Reports and CSV export</Card></Link>
      </div>
    </div>
  );
}

function EmployeeDashboard({ user }) {
  const { sheet, goals } = useGoals();
  const approved = sheet?.approvalStatus === "approved" ? goals.length : 0;
  const pending = sheet?.approvalStatus === "submitted" ? 1 : 0;
  const totalWeightage = sheet?.totalWeightage || goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const stats = [
    { label: "Total Goals", value: goals.length, icon: Target, iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400", subtitle: "This cycle" },
    { label: "Approved Goals", value: approved, icon: CheckCircle2, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", subtitle: "Locked & active" },
    { label: "Pending Approval", value: pending, icon: Clock, iconBg: "bg-amber-500/10", iconColor: "text-amber-400", subtitle: "Awaiting manager" },
    { label: "Current Quarter", value: "Q4", icon: Calendar, iconBg: "bg-blue-500/10", iconColor: "text-blue-400", subtitle: "Active window" },
  ];
  const firstName = user?.name?.split(" ")[0] || "there";
  return (
    <div className="space-y-6">
      <PageHeader pageName="Dashboard" title={`Welcome back, ${firstName}`} subtitle="Here's your goal progress for FY 2025-26" />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group hover:border-white/10 hover:bg-[#1a1a24]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon size={15} className={stat.iconColor} />
              </div>
            </div>
            <p className="mb-1 text-[28px] font-bold leading-none tabular-nums text-slate-100">{stat.value}</p>
            <p className="text-[12px] text-slate-500">{stat.subtitle}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-200">Weightage Allocation</h3>
            <p className="mt-0.5 text-[12px] text-slate-500">{totalWeightage}% of 100% allocated across {goals.length} goals</p>
          </div>
          <Badge tone={totalWeightage === 100 ? "green" : totalWeightage > 100 ? "red" : "amber"}>
            {totalWeightage === 100 ? "Complete" : `${100 - totalWeightage}% remaining`}
          </Badge>
        </div>
        <WeightageBar goals={goals} />
      </Card>
      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-white/[0.04] px-5 py-4">
          <CalendarDays size={14} className="text-slate-500" />
          <h3 className="text-[14px] font-semibold text-slate-200">Upcoming</h3>
        </div>
        <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            <CalendarDays size={18} className="text-slate-600" />
          </div>
          <p className="text-[13px] font-medium text-slate-400">No active check-in window</p>
          <p className="mt-1 text-[12px] text-slate-600">Check-in windows are set by HR for each quarter</p>
        </div>
      </Card>
    </div>
  );
}
