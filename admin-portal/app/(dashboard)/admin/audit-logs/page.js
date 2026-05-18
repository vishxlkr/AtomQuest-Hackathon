"use client";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import api from "../../../../lib/api";
import AuditLogTable from "../../../../components/admin/AuditLogTable";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import CenteredLoader from "../../../../components/ui/CenteredLoader";
import PageHeader from "../../../../components/ui/PageHeader";

const entityOptions = [
  ["", "All entities"],
  ["goal", "Goals"],
  ["goalsheet", "Goal sheets"],
  ["cycle", "Cycles"],
  ["user", "Users"]
];

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1 });
  const [filters, setFilters] = useState({ entityType: "", action: "", from: "", to: "" });
  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const limit = 20;

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) params.set(key, value.trim());
    });
    return params.toString();
  }, [filters, page]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const load = async ({ refresh = false } = {}) => {
    setError("");
    if (refresh) setIsRefreshing(true);
    try {
      const res = await api.get(`/admin/audit-logs?${query}`);
      const payload = res.data.data || {};
      setRows(payload.items || []);
      setMeta({ total: payload.total || 0, page: payload.page || page });
    } catch (err) {
      setRows([]);
      setMeta({ total: 0, page });
      setError(err.response?.data?.error?.message || "Could not load audit logs");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [query]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({ entityType: "", action: "", from: "", to: "" });
  };

  if (isInitialLoading) return <CenteredLoader label="Loading audit logs..." />;

  return (
    <div className="space-y-5">
      <PageHeader
        pageName="Admin / Audit Logs"
        title="Audit Logs"
        subtitle="Review goal, sheet, cycle, and user changes across the system."
        action={(
          <Button type="button" variant="secondary" onClick={() => load({ refresh: true })} isLoading={isRefreshing}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        )}
      />

      <Card>
        <div className="grid gap-3 lg:grid-cols-[minmax(160px,220px)_minmax(180px,1fr)_repeat(2,minmax(150px,180px))_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-slate-400">Entity</span>
            <select className="w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" value={filters.entityType} onChange={(event) => updateFilter("entityType", event.target.value)}>
              {entityOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-slate-400">Action</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-9 py-2.5 text-[13px] uppercase text-slate-200 outline-none placeholder:normal-case placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="Example: GOAL_UPDATED" value={filters.action} onChange={(event) => updateFilter("action", event.target.value)} />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-slate-400">From</span>
            <input type="date" className="w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" value={filters.from} onChange={(event) => updateFilter("from", event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-slate-400">To</span>
            <input type="date" className="w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3 py-2.5 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" value={filters.to} onChange={(event) => updateFilter("to", event.target.value)} />
          </label>
          <Button type="button" variant="ghost" onClick={clearFilters}>Clear</Button>
        </div>
      </Card>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div>}

      <AuditLogTable rows={rows} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-slate-500">
          Showing {rows.length ? ((meta.page - 1) * limit) + 1 : 0}-{Math.min(meta.page * limit, meta.total)} of {meta.total} logs
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" disabled={page <= 1 || isRefreshing} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <span className="min-w-20 text-center text-[12px] text-slate-500">Page {meta.page} of {totalPages}</span>
          <Button type="button" variant="secondary" disabled={page >= totalPages || isRefreshing} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
