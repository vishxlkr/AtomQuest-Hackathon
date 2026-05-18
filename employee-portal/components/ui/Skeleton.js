export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.06] bg-[#16161f] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-2.5 w-24 rounded bg-white/5" />
        <div className="h-8 w-8 rounded-lg bg-white/5" />
      </div>
      <div className="mb-1 h-8 w-16 rounded bg-white/5" />
      <div className="h-2.5 w-20 rounded bg-white/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-3 w-32 rounded bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-24 rounded bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-white/5" /></td>
    </tr>
  );
}

export function SkeletonPage() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-white/5" />
      <div className="h-7 w-64 rounded bg-white/5" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
