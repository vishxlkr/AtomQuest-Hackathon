"use client";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Table from "../../../../components/ui/Table";
export default function EscalationRulesPage() {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [creating, setCreating] = useState(false);
  const load = () => { api.get("/admin/escalation-rules").then((res) => setRules(res.data.data)); api.get("/admin/escalation-logs").then((res) => setLogs(res.data.data)); };
  useEffect(() => { load(); }, []);
  const create = async (e) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const f = new FormData(e.currentTarget);
      await api.post("/admin/escalation-rules", { triggerEvent: f.get("triggerEvent"), thresholdDays: Number(f.get("thresholdDays")), escalateTo: f.get("escalateTo"), isActive: true });
      e.currentTarget.reset();
      await load();
    } finally {
      setCreating(false);
    }
  };
  return <div className="space-y-5"><h2 className="text-2xl font-semibold">Escalation Rules</h2><Card><form onSubmit={create} className="grid gap-3 md:grid-cols-4"><select name="triggerEvent" disabled={creating} className="rounded-md border px-3 py-2 disabled:opacity-60"><option>GOAL_NOT_SUBMITTED</option><option>GOAL_NOT_APPROVED</option><option>CHECKIN_NOT_DONE</option></select><input name="thresholdDays" type="number" min="1" disabled={creating} className="rounded-md border px-3 py-2 disabled:opacity-60" placeholder="Days" /><select name="escalateTo" disabled={creating} className="rounded-md border px-3 py-2 disabled:opacity-60"><option value="manager">Manager</option><option value="skip_level">Skip Level</option><option value="admin">Admin</option></select><Button isLoading={creating}>{creating ? "Adding" : "Add Rule"}</Button></form></Card><Table rows={rules} columns={[{ key: "triggerEvent", label: "Trigger" }, { key: "thresholdDays", label: "Days" }, { key: "escalateTo", label: "Escalate To" }, { key: "isActive", label: "Active", render: (r) => r.isActive ? "Yes" : "No" }]} /><h3 className="text-lg font-semibold">Escalation Log</h3><Table rows={logs} columns={[{ key: "affectedUser", label: "Affected User", render: (r) => r.affectedUser?.name || "-" }, { key: "escalatedTo", label: "Escalated To", render: (r) => r.escalatedTo?.name || "-" }, { key: "triggeredAt", label: "When", render: (r) => new Date(r.triggeredAt).toLocaleString() }]} /></div>;
}
