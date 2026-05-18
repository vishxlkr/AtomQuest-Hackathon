export default function Card({ children, className = "", padded = true, ...props }) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#16161f] ${padded ? "p-5" : ""} shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-all duration-200 ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </section>
  );
}
