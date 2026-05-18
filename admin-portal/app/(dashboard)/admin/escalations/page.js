"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import api from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";

const events = [
  ["GOAL_NOT_SUBMITTED", "Employee has not submitted goals"],
  ["GOAL_NOT_APPROVED", "Manager has not approved goals"],
  ["CHECKIN_NOT_DONE", "Check-in not completed in window"]
];
const colors = {
  GOAL_NOT_SUBMITTED: "bg-amber-100 text-amber-800",
  GOAL_NOT_APPROVED: "bg-orange-100 text-orange-800",
  CHECKIN_NOT_DONE: "bg-red-100 text-red-800"
};

function badge(event) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[event] || "bg-slate-100 text-slate-700"}`}>{event}</span>;
}

function defaultForm() {
  return { triggerEvent: "GOAL_NOT_SUBMITTED", thresholdDays: 3, escalateTo: "manager", description: "", isActive: true };
}

export default function EscalationsPage() {
  const [tab, setTab] = useState("rules");
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({});
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ triggerEvent: "", isResolved: "", dateFrom: "", dateTo: "" });

  const loadRules = () => api.get("/escalations/rules").then((res) => setRules(res.data.data));
  const loadLogs = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
    return api.get("/escalations/logs", { params }).then((res) => {
      const payload = res.data.data;
      setLogs(payload.items || payload);
      setLogMeta(payload);
    });
  };

  useEffect(() => { loadRules(); }, []);
  useEffect(() => { loadLogs(); }, [filters]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return {
      open: logs.filter((log) => !log.isResolved).length,
      resolvedToday: logs.filter((log) => log.isResolved && log.resolvedAt && new Date(log.resolvedAt).toDateString() === today).length,
      week: logs.filter((log) => new Date(log.triggeredAt) >= weekAgo).length
    };
  }, [logs]);

  const submitRule = async (e) => {
    e.preventDefault();
    const payload = { ...form, thresholdDays: Number(form.thresholdDays) };
    if (editingId) await api.patch(`/escalations/rules/${editingId}`, payload);
    else await api.post("/escalations/rules", payload);
    setShowModal(false);
    setEditingId(null);
    setForm(defaultForm());
    await loadRules();
  };

  const editRule = (rule) => {
    setEditingId(rule._id);
    setForm({ triggerEvent: rule.triggerEvent, thresholdDays: rule.thresholdDays, escalateTo: rule.escalateTo, description: rule.description || "", isActive: rule.isActive });
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">Escalations</h2>
        <div className="flex rounded-lg border bg-white p-1 text-sm">
          <button onClick={() => setTab("rules")} className={`rounded-md px-4 py-2 ${tab === "rules" ? "bg-indigo-600 text-white" : "text-slate-600"}`}>Rules</button>
          <button onClick={() => setTab("logs")} className={`rounded-md px-4 py-2 ${tab === "logs" ? "bg-indigo-600 text-white" : "text-slate-600"}`}>Escalation Log</button>
        </div>
      </div>

      {tab === "rules" ? (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Escalation Rules</h3>
            <Button onClick={() => { setForm(defaultForm()); setEditingId(null); setShowModal(true); }}><Plus size={16} />Add Rule</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500"><tr>{["Trigger Event", "Threshold (days)", "Escalate To", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {rules.map((rule) => <tr key={rule._id}>
                  <td className="px-4 py-3">{badge(rule.triggerEvent)}<p className="mt-1 text-xs text-slate-500">{rule.description}</p></td>
                  <td className="px-4 py-3">{rule.thresholdDays}</td>
                  <td className="px-4 py-3 capitalize">{rule.escalateTo.replace("_", " ")}</td>
                  <td className="px-4 py-3"><button onClick={async () => { await api.patch(`/escalations/rules/${rule._id}`, { isActive: !rule.isActive }); await loadRules(); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{rule.isActive ? "Active" : "Inactive"}</button></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => editRule(rule)}>Edit</Button><button onClick={async () => { await api.delete(`/escalations/rules/${rule._id}`); await loadRules(); }} className="rounded-md border px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><p className="text-sm text-slate-500">Open Escalations</p><p className="mt-2 text-2xl font-semibold text-red-600">{stats.open}</p></Card>
            <Card><p className="text-sm text-slate-500">Resolved Today</p><p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.resolvedToday}</p></Card>
            <Card><p className="text-sm text-slate-500">Total This Week</p><p className="mt-2 text-2xl font-semibold">{stats.week}</p></Card>
          </div>
          <Card>
            <h3 className="mb-4 font-semibold">Escalation History</h3>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <select value={filters.triggerEvent} onChange={(e) => setFilters((prev) => ({ ...prev, triggerEvent: e.target.value }))} className="rounded-md border px-3 py-2"><option value="">All Events</option>{events.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={filters.isResolved} onChange={(e) => setFilters((prev) => ({ ...prev, isResolved: e.target.value }))} className="rounded-md border px-3 py-2"><option value="">All</option><option value="true">Resolved</option><option value="false">Open</option></select>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} className="rounded-md border px-3 py-2" />
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} className="rounded-md border px-3 py-2" />
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr>{["Date", "Employee", "Event", "Escalated To", "Message", "Resolved", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y">{logs.map((log) => <tr key={log._id} className={log.isResolved ? "bg-white" : "bg-red-50"}><td className="px-4 py-3">{new Date(log.triggeredAt).toLocaleString()}</td><td className="px-4 py-3">{log.affectedUserId?.name || "-"}</td><td className="px-4 py-3">{badge(log.triggerEvent)}</td><td className="px-4 py-3">{log.escalatedToUserId?.name || "-"}</td><td className="max-w-md px-4 py-3 text-slate-600">{log.message}</td><td className="px-4 py-3">{log.isResolved ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"><CheckCircle2 size={14} />Resolved</span> : <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"><AlertTriangle size={14} />Open</span>}</td><td className="px-4 py-3">{!log.isResolved ? <Button type="button" variant="secondary" onClick={async () => { await api.patch(`/escalations/logs/${log._id}/resolve`); await loadLogs(); }}>Mark Resolved</Button> : "-"}</td></tr>)}</tbody></table>
            </div>
            <p className="mt-3 text-xs text-slate-500">{logMeta.total || logs.length} total escalation logs</p>
          </Card>
        </div>
      )}

      {showModal ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
        <form onSubmit={submitRule} className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{editingId ? "Edit Rule" : "Add Rule"}</h3><button type="button" onClick={() => setShowModal(false)}><X size={18} /></button></div>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Trigger Event<select value={form.triggerEvent} onChange={(e) => setForm((prev) => ({ ...prev, triggerEvent: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2">{events.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block text-sm font-medium">Trigger after X days<input type="number" min="1" value={form.thresholdDays} onChange={(e) => setForm((prev) => ({ ...prev, thresholdDays: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2" /></label>
            <label className="block text-sm font-medium">Escalate To<select value={form.escalateTo} onChange={(e) => setForm((prev) => ({ ...prev, escalateTo: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2"><option value="manager">Manager</option><option value="skip_level">Skip Level</option><option value="admin">Admin</option></select></label>
            <label className="block text-sm font-medium">Description<textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2" rows={3} /></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit">{editingId ? "Save Changes" : "Create Rule"}</Button></div>
        </form>
      </div> : null}
    </div>
  );
}
