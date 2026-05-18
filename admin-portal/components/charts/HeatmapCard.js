export default function HeatmapCard({ rows = [] }) {
  return <div className="grid gap-2">{rows.map((row) => <div key={row.department || row.label} className="grid grid-cols-5 gap-2 text-sm"><span>{row.department || row.label}</span>{["Q1", "Q2", "Q3", "Q4"].map((q) => <span key={q} className={`rounded-md px-2 py-1 text-center ${row[q] > 80 ? "bg-green-100" : row[q] > 50 ? "bg-amber-100" : "bg-red-100"}`}>{row[q] || 0}%</span>)}</div>)}</div>;
}
