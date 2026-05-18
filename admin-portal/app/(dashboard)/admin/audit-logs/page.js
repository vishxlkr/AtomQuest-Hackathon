"use client";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import AuditLogTable from "../../../../components/admin/AuditLogTable";
export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/admin/audit-logs").then((res) => setRows(res.data.data.items)); }, []);
  return <div className="space-y-4"><h2 className="text-2xl font-semibold">Audit Logs</h2><AuditLogTable rows={rows} /></div>;
}
