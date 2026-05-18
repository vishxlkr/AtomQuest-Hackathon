import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
export default function ApprovalActions({ onApprove, onReturn }) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  return <div className="flex gap-3"><Button variant="success" onClick={onApprove}>Approve</Button><Button variant="secondary" onClick={() => setOpen(true)}>Return with Remarks</Button><Modal open={open} title="Return Goal Sheet" onClose={() => setOpen(false)}><textarea className="mb-4 w-full resize-none rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" rows="4" value={remarks} onChange={(e) => setRemarks(e.target.value)} /><Button variant="danger" onClick={() => onReturn(remarks)}>Return</Button></Modal></div>;
}
