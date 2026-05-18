"use client";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import CenteredLoader from "../../../../components/ui/CenteredLoader";
import CompletionStats from "../../../../components/admin/CompletionStats";
import PageHeader from "../../../../components/ui/PageHeader";
export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/admin/dashboard").then((res) => setData(res.data.data)); }, []);
  if (!data) return <CenteredLoader label="Loading dashboard..." />;
  return <div className="space-y-5"><PageHeader pageName="Admin / Dashboard" title="Completion Dashboard" subtitle="Completion health across goal sheets and quarterly check-ins." /><CompletionStats data={data} /><Card><h3 className="mb-3 text-[14px] font-semibold text-slate-200">Quarter Completion</h3>{Object.entries(data?.checkInCompletion || {}).map(([q, v]) => <div key={q} className="mb-3"><div className="mb-1 flex justify-between text-[13px] text-slate-400"><span>{q}</span><span>{v.done}/{v.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${v.total ? (v.done / v.total) * 100 : 0}%` }} /></div></div>)}</Card></div>;
}
