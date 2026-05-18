export default function Spinner({ label = "Loading..." }) {
   return (
      <div role="status" aria-live="polite">
         <<div
        className="h-10 w-10 animate-spin rounded-full border-4 border-transparent border-t-indigo-500"
        aria-hidden="true"
      />
         <span className="sr-only">{label}</span>
      </div>
   );
}
