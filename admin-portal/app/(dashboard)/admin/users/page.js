"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import UserTable from "../../../../components/admin/UserTable";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";
export default function UsersPage() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const buildUserQuery = (role) => {
    const params = new URLSearchParams({ role, isActive: "true", limit: "100" });
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  };
  const load = async () => {
    const [employeeRes, managerRes] = await Promise.all([
      api.get(`/admin/users?${buildUserQuery("employee")}`),
      api.get(`/admin/users?${buildUserQuery("manager")}`)
    ]);
    setEmployees(employeeRes.data.data.items);
    setManagers(managerRes.data.data.items);
  };
  useEffect(() => { load(); }, [search]);
  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    setDeletingId(user._id);
    try {
      await api.delete(`/admin/users/${user._id}`);
      toast.success("User deleted");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Could not delete user");
    } finally {
      setDeletingId(null);
    }
  };
  const createManager = async (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setIsCreating(true);
    try {
      await api.post("/admin/users", {
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim().toLowerCase(),
        password: form.get("password"),
        department: String(form.get("department") || "").trim(),
        role: "manager"
      });
      toast.success("Manager created");
      setOpen(false);
      formEl.reset();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Could not create manager");
    } finally {
      setIsCreating(false);
    }
  };
  return <div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-2xl font-semibold text-slate-100">User Management</h2><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input className="w-full rounded-lg border border-white/[0.08] bg-[#16161f] px-9 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 sm:w-72" placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} /></label><Button type="button" onClick={() => setOpen(true)}>Add Manager</Button></div></div><section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-base font-semibold text-slate-200">Employees</h3><span className="text-[12px] text-slate-500">{employees.length} active</span></div><UserTable users={employees} onDelete={deleteUser} deletingId={deletingId} /></section><section className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-base font-semibold text-slate-200">Managers</h3><span className="text-[12px] text-slate-500">{managers.length} active</span></div><UserTable users={managers} onDelete={deleteUser} deletingId={deletingId} /></section><Modal open={open} title="Add Manager" onClose={() => setOpen(false)}><form method="post" onSubmit={createManager} className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Full name<input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" /></label><label className="text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-md border px-3 py-2" /></label><label className="text-sm font-medium">Password<span className="relative mt-1 block"><input name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" className="w-full rounded-md border px-3 py-2 pr-10" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40" onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label><label className="text-sm font-medium">Department<input name="department" className="mt-1 w-full rounded-md border px-3 py-2" /></label><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isCreating}>Cancel</Button><Button type="submit" disabled={isCreating}>{isCreating ? "Creating..." : "Create Manager"}</Button></div></form></Modal></div>;
}
