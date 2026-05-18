"use client";
import Button from "../ui/Button";
import api from "../../lib/api";
export default function ExportButton({ query = "" }) {
  const run = async () => { const res = await api.get(`/reports/export-csv${query}`, { responseType: "blob" }); const url = URL.createObjectURL(res.data); const a = document.createElement("a"); a.href = url; a.download = "achievement_report.csv"; a.click(); URL.revokeObjectURL(url); };
  return <Button variant="secondary" onClick={run}>Export CSV</Button>;
}
