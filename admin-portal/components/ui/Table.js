export default function Table({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#16161f]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((c) => (
                <th key={c.key} className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-widest text-slate-500">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row, i) => (
              <tr key={row._id || row.id || i} className="transition-colors hover:bg-white/[0.02]">
                {columns.map((c) => <td key={c.key} className="px-5 py-4 text-[13px] text-slate-300">{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
