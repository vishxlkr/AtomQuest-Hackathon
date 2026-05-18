"use client";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import AuditLogTable from "../../../../components/admin/AuditLogTable";
import CenteredLoader from "../../../../components/ui/CenteredLoader";
export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { api.get("/admin/audit-logs").then((res) => setRows(res.data.data.items)).finally(() => setIsLoading(false)); }, []);
  if (isLoading) return <CenteredLoader label="Loading audit logs..." />;
  return <div className="space-y-4"><h2 className="text-2xl font-semibold">Audit Logs</h2><AuditLogTable rows={rows} /></div>;
}
