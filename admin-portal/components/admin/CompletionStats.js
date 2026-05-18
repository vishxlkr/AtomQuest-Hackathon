import Card from "../ui/Card";
export default function CompletionStats({ data }) {
  const stats = [["Total Employees", data?.totalEmployees], ["Submitted", data?.goalsSubmitted], ["Approved", data?.goalsApproved], ["Pending", data?.goalsPending]];
  return <div className="grid gap-4 md:grid-cols-4">{stats.map(([label, value]) => <Card key={label}><p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</p><p className="mt-2 text-[28px] font-bold tabular-nums text-slate-100">{value || 0}</p></Card>)}</div>;
}
