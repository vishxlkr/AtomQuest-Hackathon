import Badge from "../ui/Badge";

const actionTones = {
  GOALSHEET_APPROVED: "green",
  GOALSHEET_RETURNED: "amber",
  GOALSHEET_SUBMITTED: "blue",
  GOAL_UNLOCKED: "violet",
  SHEET_UNLOCKED: "violet",
  GOAL_UPDATED: "indigo",
  MANAGER_GOAL_UPDATED: "indigo",
  QUARTERLY_ACHIEVEMENT_UPDATED: "blue"
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function formatAction(action) {
  return String(action || "-").replaceAll("_", " ");
}

function formatValue(value) {
  if (value === null || value === undefined) return "-";
  if (typeof value !== "object") return String(value);

  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
  if (!entries.length) return "-";

  return entries.slice(0, 5).map(([key, entryValue]) => {
    const displayValue = typeof entryValue === "object" && entryValue !== null
      ? JSON.stringify(entryValue)
      : String(entryValue);
    return `${key}: ${displayValue}`;
  }).join("\n");
}

export default function AuditLogTable({ rows = [] }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] bg-[#16161f] px-5 py-12 text-center text-[13px] text-slate-500">
        No audit logs found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#16161f]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Timestamp", "Entity", "Action", "Changed By", "Previous Value", "New Value", "Reason"].map((heading) => (
                <th key={heading} className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-widest text-slate-500">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row) => (
              <tr key={row._id} className="align-top transition-colors hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-5 py-4 text-[13px] text-slate-300">{formatDate(row.timestamp)}</td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <Badge tone="gray">{row.entityType || "-"}</Badge>
                    {row.entityId && <p className="max-w-40 truncate text-[11px] text-slate-600" title={row.entityId}>{row.entityId}</p>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <Badge tone={actionTones[row.action] || "gray"}>{formatAction(row.action)}</Badge>
                </td>
                <td className="px-5 py-4 text-[13px] text-slate-300">
                  <div className="max-w-48">
                    <p className="truncate font-medium text-slate-200">{row.changedBy?.name || "-"}</p>
                    {row.changedBy?.email && <p className="truncate text-[12px] text-slate-500">{row.changedBy.email}</p>}
                  </div>
                </td>
                <td className="max-w-72 px-5 py-4">
                  <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-[12px] leading-5 text-slate-400">{formatValue(row.previousValue)}</pre>
                </td>
                <td className="max-w-72 px-5 py-4">
                  <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-black/20 p-3 text-[12px] leading-5 text-slate-400">{formatValue(row.newValue)}</pre>
                </td>
                <td className="max-w-64 px-5 py-4 text-[13px] text-slate-400">{row.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
