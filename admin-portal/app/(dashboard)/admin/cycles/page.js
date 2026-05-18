"use client";
import { useEffect, useState } from "react";
import api from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";
import Table from "../../../../components/ui/Table";
import Badge from "../../../../components/ui/Badge";
import CycleForm from "../../../../components/admin/CycleForm";
export default function CyclesPage() {
  const [cycles, setCycles] = useState([]);
  const [open, setOpen] = useState(false);
  const load = () => api.get("/admin/cycles").then((res) => setCycles(res.data.data));
  useEffect(() => { load(); }, []);
  const create = async (payload) => { await api.post("/admin/cycles", payload); setOpen(false); load(); };
  return <div className="space-y-4"><div className="flex justify-between"><h2 className="text-2xl font-semibold">Cycles</h2><Button onClick={() => setOpen(true)}>Create New Cycle</Button></div><Table rows={cycles} columns={[{ key: "name", label: "Name" }, { key: "year", label: "Year" }, { key: "status", label: "Status", render: (r) => <Badge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "Active" : "Inactive"}</Badge> }, { key: "window", label: "Goal Setting Window", render: (r) => `${new Date(r.goalSettingOpen).toLocaleDateString()} - ${new Date(r.goalSettingClose).toLocaleDateString()}` }, { key: "action", label: "Action", render: (r) => !r.isActive && <Button variant="secondary" onClick={() => api.patch(`/admin/cycles/${r._id}/activate`).then(load)}>Activate</Button> }]} /><Modal open={open} title="Create Cycle" onClose={() => setOpen(false)}><CycleForm onSubmit={create} /></Modal></div>;
}
