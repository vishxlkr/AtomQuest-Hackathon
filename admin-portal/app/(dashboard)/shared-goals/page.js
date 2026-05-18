"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";
export default function SharedGoalsPage() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => { api.get("/users/employees").then((res) => setEmployees(res.data.data)); }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const f = new FormData(e.currentTarget);
      await api.post("/goals/shared/push", { thrustArea: f.get("thrustArea"), title: f.get("title"), description: f.get("description"), uomType: f.get("uomType"), target: f.get("target"), weightage: Number(f.get("weightage") || 10), targetEmployeeIds: selected });
      toast.success("Shared goal pushed");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Could not push shared goal");
    } finally {
      setIsSubmitting(false);
    }
  };
  const input = "w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60";
  return <div className="space-y-4"><PageHeader pageName="Shared Goals" title="Shared Goals" subtitle="Create and push a shared goal to selected employees." /><Card><form onSubmit={submit} className="space-y-3"><input name="thrustArea" disabled={isSubmitting} className={input} placeholder="Thrust Area" /><input name="title" disabled={isSubmitting} className={input} placeholder="Title" /><textarea name="description" disabled={isSubmitting} className={`${input} resize-none`} placeholder="Description" /><select name="uomType" disabled={isSubmitting} className={`${input} cursor-pointer appearance-none`}><option value="min">Min</option><option value="max">Max</option><option value="timeline">Timeline</option><option value="zero">Zero</option></select><input name="target" disabled={isSubmitting} className={input} placeholder="Target" /><input name="weightage" type="number" min="10" max="100" disabled={isSubmitting} className={input} placeholder="Weightage" /><div className="grid gap-2 md:grid-cols-2">{employees.map((e) => <label key={e._id} className="flex gap-2 text-[13px] text-slate-400"><input type="checkbox" disabled={isSubmitting} checked={selected.includes(e._id)} onChange={(ev) => setSelected((s) => ev.target.checked ? [...s, e._id] : s.filter((id) => id !== e._id))} />{e.name}</label>)}</div><p className="text-[12px] text-slate-500">{selected.length} employees selected</p><Button isLoading={isSubmitting}>{isSubmitting ? "Pushing" : "Push Shared Goal"}</Button></form></Card></div>;
}
