"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import api from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import CenteredLoader from "../../../../components/ui/CenteredLoader";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const palette = ["#4f46e5", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#14b8a6", "#f97316"];

function value(data, fallback) {
  return data ?? fallback;
}

function getPayload(res) {
  return res.data.data;
}

function EmptyState() {
  return <div className="grid h-48 place-items-center rounded-md border border-dashed text-sm text-slate-500">No data yet</div>;
}

function HeatCell({ value: cellValue }) {
  if (cellValue === null || cellValue === undefined) return <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-400">Not open</span>;
  const cls = cellValue > 80 ? "bg-emerald-100 text-emerald-800" : cellValue >= 50 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  return <span className={`rounded-lg px-3 py-2 text-center text-sm font-semibold ${cls}`}>{cellValue}%</span>;
}

function PieLabel({ name, percent, count }) {
  return `${name}: ${count} (${Math.round(percent * 100)}%)`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [distributionTab, setDistributionTab] = useState("byThrustArea");
  const [trendLevel, setTrendLevel] = useState("employeeTrends");
  const [selectedTrendId, setSelectedTrendId] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/reports/analytics/qoq-trend"),
      api.get("/reports/analytics/goal-distribution"),
      api.get("/reports/analytics/heatmap"),
      api.get("/reports/analytics/managers")
    ])
      .then(([qoq, distribution, heatmap, managers]) => setData({
        qoq: getPayload(qoq),
        distribution: getPayload(distribution),
        heatmap: getPayload(heatmap),
        managers: getPayload(managers)
      }))
      .catch((err) => setError(err.response?.data?.error?.message || "Unable to load analytics"));
  }, []);

  const trendOptions = useMemo(() => data?.qoq?.[trendLevel] || [], [data, trendLevel]);

  const trendRows = useMemo(() => {
    const selected = trendOptions.find((item) => String(item.userId || item.id || item.employeeId || item.name) === selectedTrendId);
    return (data?.qoq?.orgTrend || []).map((row) => ({ ...row, selectedScore: selected ? selected[row.quarter] : null }));
  }, [data, trendOptions, selectedTrendId]);

  const selectedTrendLabel = useMemo(() => {
    const selected = trendOptions.find((item) => String(item.userId || item.id || item.employeeId || item.name) === selectedTrendId);
    return selected?.name || "";
  }, [trendOptions, selectedTrendId]);

  const pieData = useMemo(() => {
    const rows = data?.distribution?.[distributionTab] || [];
    return rows.map((row) => ({ name: row.name || "Unknown", count: row.count || 0, value: row.count || 0 }));
  }, [data, distributionTab]);

  const stats = useMemo(() => {
    const orgTrend = data?.qoq?.orgTrend || [];
    const latest = [...orgTrend].reverse().find((row) => row.avgScore || row.completionRate) || orgTrend[0] || {};
    const q1 = orgTrend.find((row) => row.quarter === "Q1")?.avgScore || 0;
    const q2 = orgTrend.find((row) => row.quarter === "Q2")?.avgScore || 0;
    const onTrack = data?.distribution?.byStatus?.find((row) => row.name === "on_track")?.count || 0;
    const managerAvg = data?.managers?.length ? Math.round(data.managers.reduce((sum, row) => sum + (row.checkInCompletionRate || 0), 0) / data.managers.length) : 0;
    return { avg: latest.avgScore || 0, completion: latest.completionRate || 0, q2Better: q2 > q1, onTrack, checkIn: managerAvg };
  }, [data]);

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.toLowerCase();
    return (data?.qoq?.employeeTrends || []).filter((employee) => [employee.name, employee.department, employee.manager].some((field) => String(field || "").toLowerCase().includes(query)));
  }, [data, employeeSearch]);

  if (error) return <Card><p className="text-sm text-red-600">{error}</p></Card>;
  if (!data) return <CenteredLoader label="Loading analytics..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-slate-900">Analytics Overview</h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{data.qoq?.activeCycle?.name || "Active Cycle"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-slate-500">Avg Org Progress Score</p><p className="mt-2 flex items-center gap-2 text-2xl font-semibold">{stats.avg}{stats.q2Better ? <ArrowUpRight className="text-emerald-600" size={20} /> : <ArrowDownRight className="text-rose-600" size={20} />}</p></Card>
        <Card><p className="text-sm text-slate-500">Overall Completion Rate</p><p className="mt-2 text-2xl font-semibold">{stats.completion}%</p></Card>
        <Card><p className="text-sm text-slate-500">Goals Currently On Track</p><p className="mt-2 text-2xl font-semibold">{stats.onTrack}</p></Card>
        <Card><p className="text-sm text-slate-500">Check-in Completion Rate</p><p className="mt-2 text-2xl font-semibold">{stats.checkIn}%</p></Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-900">Quarter-over-Quarter Performance Trend</h3>
        {trendRows.length ? <ResponsiveContainer width="100%" height={300}><ComposedChart data={trendRows}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="quarter" /><YAxis yAxisId="score" domain={[0, 150]} /><YAxis yAxisId="rate" orientation="right" domain={[0, 100]} /><Tooltip /><Legend verticalAlign="bottom" /><Bar yAxisId="rate" dataKey="completionRate" name="Goal Completion Rate %" fill="#10b981" fillOpacity={0.3} /><Line yAxisId="score" type="monotone" dataKey="avgScore" name="Org Avg Progress Score" stroke="#4f46e5" strokeWidth={2} dot />{selectedTrendId ? <Line yAxisId="score" type="monotone" dataKey="selectedScore" name={selectedTrendLabel} stroke="#f43f5e" strokeWidth={3} dot /> : null}</ComposedChart></ResponsiveContainer> : <EmptyState />}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex rounded-md border p-1 text-xs">
            {[["employeeTrends", "Individual"], ["teamTrends", "Team"], ["departmentTrends", "Department"]].map(([key, label]) => <button key={key} onClick={() => { setTrendLevel(key); setSelectedTrendId(""); }} className={`rounded px-3 py-1.5 ${trendLevel === key ? "bg-indigo-600 text-white" : "text-slate-600"}`}>{label}</button>)}
          </div>
          <select value={selectedTrendId} onChange={(e) => setSelectedTrendId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Compare with {trendLevel === "employeeTrends" ? "individual" : trendLevel === "teamTrends" ? "team" : "department"}</option>
            {trendOptions.map((item) => {
              const id = String(item.userId || item.id || item.employeeId || item.name);
              const detail = trendLevel === "employeeTrends" ? item.department : `${item.teamSize || 0} people`;
              return <option key={id} value={id}>{item.name}{detail ? ` - ${detail}` : ""}</option>;
            })}
          </select>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">Goal Distribution Analysis</h3>
            <div className="flex rounded-md border p-1 text-xs">
              {[["byThrustArea", "By Thrust Area"], ["byUomType", "By UoM Type"], ["byStatus", "By Status"]].map(([key, label]) => <button key={key} onClick={() => setDistributionTab(key)} className={`rounded px-3 py-1.5 ${distributionTab === key ? "bg-indigo-600 text-white" : "text-slate-600"}`}>{label}</button>)}
            </div>
          </div>
          {pieData.length ? <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" label={(props) => PieLabel({ ...props, count: props.value })} isAnimationActive>{pieData.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" /></PieChart></ResponsiveContainer> : <EmptyState />}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Check-in Completion by Department</h3>
          <div className="grid grid-cols-[minmax(120px,1fr)_repeat(4,minmax(74px,90px))] gap-2 overflow-x-auto">
            <span />
            {quarters.map((quarter) => <span key={quarter} className="text-center text-xs font-semibold uppercase text-slate-500">{quarter}</span>)}
            {(data.heatmap || []).map((row) => <div key={row.department} className="contents"><span className="py-2 text-sm font-medium text-slate-700">{row.department}</span>{quarters.map((quarter) => <HeatCell key={quarter} value={row[quarter]} />)}</div>)}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-slate-900">Manager Effectiveness Dashboard</h3>
        {data.managers?.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={data.managers.map((row) => ({ ...row, label: row.managerName?.length > 12 ? `${row.managerName.slice(0, 12)}...` : row.managerName }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis yAxisId="left" domain={[0, 100]} /><YAxis yAxisId="right" orientation="right" /><Tooltip formatter={(val, name, props) => [val, `${name} (team ${props.payload.teamSize})`]} /><Legend /><Bar yAxisId="left" dataKey="checkInCompletionRate" name="Check-in Completion %" fill="#4f46e5">{data.managers.map((row, index) => <Cell key={index} fill={row.checkInCompletionRate < 50 ? "#ef4444" : "#4f46e5"} fillOpacity={row.checkInCompletionRate < 50 ? 0.5 : 1} />)}</Bar><Bar yAxisId="left" dataKey="submissionRate" name="Submission Rate %" fill="#10b981">{data.managers.map((row, index) => <Cell key={index} fill={row.checkInCompletionRate < 50 ? "#f87171" : "#10b981"} fillOpacity={row.checkInCompletionRate < 50 ? 0.5 : 1} />)}</Bar><Bar yAxisId="right" dataKey="approvalAvgDays" name="Avg Approval Days" fill="#f59e0b" /></BarChart></ResponsiveContainer> : <EmptyState />}
        <div className="mt-5 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr>{["Manager", "Team Size", "Q1", "Q2", "Q3", "Q4", "Check-ins Done", "Avg Approval", "Submission Rate"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{data.managers.map((row) => <tr key={row.managerId} className={row.approvalAvgDays > 5 ? "bg-red-50" : "bg-white"}><td className="px-4 py-3 font-medium">{row.managerName}</td><td className="px-4 py-3">{row.teamSize}</td>{quarters.map((quarter) => <td key={quarter} className="px-4 py-3">{row.perQuarter?.[quarter]?.rate ?? row.checkIns?.[quarter] ?? 0}%</td>)}<td className="px-4 py-3">{row.checkInsDone}/{row.expectedCheckIns}</td><td className="px-4 py-3">{row.approvalAvgDays} days</td><td className="px-4 py-3">{row.submissionRate}%</td></tr>)}</tbody></table>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">Individual Employee Performance</h3>
          <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} className="rounded-md border py-2 pl-9 pr-3 text-sm" placeholder="Search employees" /></div>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr>{["Employee", "Dept", "Manager", "Q1 Score", "Q2 Score", "Q3 Score", "Q4 Score", "Trend"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{filteredEmployees.map((employee) => {
            const points = quarters.map((quarter) => ({ quarter, score: value(employee[quarter], 0) }));
            const improving = value(employee.Q4, employee.Q3 || employee.Q2 || employee.Q1 || 0) >= value(employee.Q1, 0);
            return <tr key={employee.userId || employee.employeeId || employee.name}><td className="px-4 py-3 font-medium">{employee.name}</td><td className="px-4 py-3">{employee.department}</td><td className="px-4 py-3">{employee.manager || "-"}</td>{quarters.map((quarter) => <td key={quarter} className="px-4 py-3">{employee[quarter] ?? "-"}</td>)}<td className="px-4 py-3"><LineChart width={80} height={30} data={points}><Line type="monotone" dataKey="score" stroke={improving ? "#16a34a" : "#dc2626"} dot={false} strokeWidth={2} /></LineChart></td></tr>;
          })}</tbody></table>
        </div>
      </Card>
    </div>
  );
}
