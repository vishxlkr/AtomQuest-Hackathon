"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/api";
import AchievementTable from "../../../components/reports/AchievementTable";
import CenteredLoader from "../../../components/ui/CenteredLoader";
import QuarterFilter from "../../../components/reports/QuarterFilter";
import ExportButton from "../../../components/reports/ExportButton";
export default function ReportsPage() {
  const [quarter, setQuarter] = useState("");
  const [rows, setRows] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const query = quarter ? `?quarter=${quarter}` : "";
  useEffect(() => { api.get(`/reports/achievement${query}`).then((res) => setRows(res.data.data)).finally(() => setIsInitialLoading(false)); }, [query]);
  if (isInitialLoading) return <CenteredLoader label="Loading report..." />;
  return <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Achievement Report</h2><div className="flex gap-2"><QuarterFilter value={quarter} onChange={setQuarter} /><ExportButton query={query} /></div></div><AchievementTable rows={rows} /></div>;
}
