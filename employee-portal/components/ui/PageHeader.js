export default function PageHeader({ portal = "Employee Portal", pageName, title, subtitle, action }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-[11px] uppercase tracking-widest text-slate-600">
        {portal} / {pageName}
      </p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
