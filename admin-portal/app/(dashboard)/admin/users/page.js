"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import UserTable from "../../../../components/admin/UserTable";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";
export default function UsersPage() {
  const [data, setData] = useState({ items: [] });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const load = () => api.get(`/admin/users?search=${encodeURIComponent(search)}`).then((res) => setData(res.data.data));
  useEffect(() => { load(); }, [search]);
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
  return <div className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-2xl font-semibold">User Management</h2><div className="flex gap-2"><input className="rounded-md border px-3 py-2" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /><Button type="button" onClick={() => setOpen(true)}>Add Manager</Button></div></div><UserTable users={data.items} /><Modal open={open} title="Add Manager" onClose={() => setOpen(false)}><form method="post" onSubmit={createManager} className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium">Full name<input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" /></label><label className="text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-md border px-3 py-2" /></label><label className="text-sm font-medium">Password<input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-md border px-3 py-2" /></label><label className="text-sm font-medium">Department<input name="department" className="mt-1 w-full rounded-md border px-3 py-2" /></label><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isCreating}>Cancel</Button><Button type="submit" disabled={isCreating}>{isCreating ? "Creating..." : "Create Manager"}</Button></div></form></Modal></div>;
}
