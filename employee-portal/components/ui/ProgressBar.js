export default function ProgressBar({ value = 0, tone = "indigo" }) {
  const color = tone === "green" ? "bg-emerald-500" : tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : "bg-indigo-500";
  return <div className="h-2 w-full overflow-hidden rounded-full bg-white/5"><div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} /></div>;
}
