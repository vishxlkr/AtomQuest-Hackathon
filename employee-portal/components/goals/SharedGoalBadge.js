export default function SharedGoalBadge({ isShared }) {
  return isShared ? <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-400">Shared</span> : null;
}
