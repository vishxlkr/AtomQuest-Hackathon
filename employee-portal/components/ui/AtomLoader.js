export default function AtomLoader({ label = "Loading..." }) {
  return (
    <div role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
