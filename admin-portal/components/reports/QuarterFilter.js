export default function QuarterFilter({ value, onChange }) {
  return <select className="rounded-md border px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}><option value="">All Quarters</option><option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option></select>;
}
