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
  const [creating, setCreating] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const load = () => api.get("/admin/cycles").then((res) => setCycles(res.data.data));
  useEffect(() => { load(); }, []);
  const create = async (payload) => {
    if (creating) return;
    setCreating(true);
    try {
      await api.post("/admin/cycles", payload);
      setOpen(false);
      await load();
    } finally {
      setCreating(false);
    }
  };
  const activate = async (cycleId) => {
    if (activatingId) return;
    setActivatingId(cycleId);
    try {
      await api.patch(`/admin/cycles/${cycleId}/activate`);
      await load();
    } finally {
      setActivatingId(null);
    }
  };
  return <div className="space-y-4"><div className="flex justify-between"><h2 className="text-2xl font-semibold">Cycles</h2><Button onClick={() => setOpen(true)}>Create New Cycle</Button></div><Table rows={cycles} columns={[{ key: "name", label: "Name" }, { key: "year", label: "Year" }, { key: "status", label: "Status", render: (r) => <Badge tone={r.isActive ? "green" : "gray"}>{r.isActive ? "Active" : "Inactive"}</Badge> }, { key: "window", label: "Goal Setting Window", render: (r) => `${new Date(r.goalSettingOpen).toLocaleDateString()} - ${new Date(r.goalSettingClose).toLocaleDateString()}` }, { key: "action", label: "Action", render: (r) => !r.isActive && <Button variant="secondary" isLoading={activatingId === r._id} disabled={Boolean(activatingId)} onClick={() => activate(r._id)}>{activatingId === r._id ? "Activating" : "Activate"}</Button> }]} /><Modal open={open} title="Create Cycle" onClose={() => { if (!creating) setOpen(false); }}><CycleForm onSubmit={create} isSubmitting={creating} /></Modal></div>;
}
