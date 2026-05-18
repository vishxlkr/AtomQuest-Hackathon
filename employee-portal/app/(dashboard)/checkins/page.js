"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import Card from "../../../components/ui/Card";
import CenteredLoader from "../../../components/ui/CenteredLoader";
import TeamCheckInStatus from "../../../components/checkin/TeamCheckInStatus";
import PageHeader from "../../../components/ui/PageHeader";
export default function CheckinsPage() {
  const [data, setData] = useState(null);
  const router = useRouter();
  useEffect(() => { api.get("/checkin/team/status").then((res) => setData(res.data.data)); }, []);
  if (!data) return <CenteredLoader label="Loading check-ins..." />;
  return <div className="space-y-4"><PageHeader pageName="Check-ins" title="Check-ins" subtitle="Review team check-in completion and manager follow-up." /><Card><p className="text-[28px] font-bold tabular-nums text-slate-100">{data.completionPercentage}%</p><p className="text-[12px] text-slate-500">Completion percentage for {data.quarter || "selected quarter"}</p></Card><TeamCheckInStatus rows={data.rows} quarter={data.quarter} onStart={(id) => router.push(`/checkins/${id}?quarter=${data.quarter || ""}`)} /></div>;
}
