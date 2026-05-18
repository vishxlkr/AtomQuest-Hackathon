import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
export default function ApprovalActions({ onApprove, onReturn }) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [action, setAction] = useState(null);
  const approve = async () => {
    if (action) return;
    setAction("approve");
    try {
      await onApprove();
    } finally {
      setAction(null);
    }
  };
  const returnSheet = async () => {
    if (action) return;
    setAction("return");
    try {
      await onReturn(remarks);
    } finally {
      setAction(null);
    }
  };
  return <div className="flex gap-3"><Button variant="success" onClick={approve} isLoading={action === "approve"} disabled={Boolean(action)}>{action === "approve" ? "Approving" : "Approve"}</Button><Button variant="secondary" onClick={() => setOpen(true)} disabled={Boolean(action)}>Return with Remarks</Button><Modal open={open} title="Return Goal Sheet" onClose={() => { if (!action) setOpen(false); }}><textarea className="mb-4 w-full resize-none rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60" rows="4" value={remarks} disabled={Boolean(action)} onChange={(e) => setRemarks(e.target.value)} /><Button variant="danger" onClick={returnSheet} isLoading={action === "return"} disabled={Boolean(action)}>{action === "return" ? "Returning" : "Return"}</Button></Modal></div>;
}
