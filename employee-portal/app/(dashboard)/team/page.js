"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/api";
import CenteredLoader from "../../../components/ui/CenteredLoader";
import TeamTable from "../../../components/team/TeamTable";
export default function TeamPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { api.get("/goals/team/sheets").then((res) => setRows(res.data.data)).finally(() => setIsLoading(false)); }, []);
  const filtered = status ? rows.filter((r) => r.approvalStatus === status) : rows;
  if (isLoading) return <CenteredLoader label="Loading team..." />;
  return <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">My Team</h2><select className="rounded-md border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Statuses</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="returned">Returned</option></select></div><TeamTable rows={filtered} /></div>;
}
