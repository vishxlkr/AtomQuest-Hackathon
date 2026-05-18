"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
import { CheckCircle2, ClipboardCheck, FileText, Target, Users } from "lucide-react";
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/reports/completion-dashboard").then((res) => setData(res.data.data)); }, []);
  const stats = user?.role === "admin"
    ? [["Total employees", data?.totalEmployees, Users], ["Submitted", data?.submitted, ClipboardCheck], ["Approved", data?.approved, CheckCircle2], ["Draft", data?.draft, FileText], ["Returned", data?.returned, Target], ["Completion %", data?.totalEmployees ? Math.round((data.approved / data.totalEmployees) * 100) : 0, CheckCircle2]]
    : [["Team size", data?.totalEmployees, Users], ["Submitted", data?.submitted, ClipboardCheck], ["Approved", data?.approved, CheckCircle2], ["My check-ins done", data?.quarterlyCompletion?.Q1?.done || 0, Target]];
  return (
    <div className="space-y-5">
      <PageHeader pageName="Dashboard" title="Dashboard" subtitle={`Signed in as ${user?.name || "User"} (${user?.role || "role"})`} />
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
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
