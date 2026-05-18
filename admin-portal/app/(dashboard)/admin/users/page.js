"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import UserTable from "../../../../components/admin/UserTable";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";

export default function UsersPage() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [managerUpdatingId, setManagerUpdatingId] = useState(null);

  const buildUserQuery = (role) => {
    const params = new URLSearchParams({ role, isActive: "true", limit: "100" });
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  };

  const load = async () => {
    const [employeeRes, managerRes, managerOptionsRes] = await Promise.all([
      api.get(`/admin/users?${buildUserQuery("employee")}`),
      api.get(`/admin/users?${buildUserQuery("manager")}`),
      api.get("/admin/users?role=manager&isActive=true&limit=100")
    ]);
    setEmployees(employeeRes.data.data.items);
    setManagers(managerRes.data.data.items);
    setManagerOptions(managerOptionsRes.data.data.items);
  };

  useEffect(() => { load(); }, [search]);

  const openManagerModal = (employee) => {
    setSelectedEmployee(employee);
    setManagerSearch("");
  };

  const closeManagerModal = () => {
    if (managerUpdatingId) return;
    setSelectedEmployee(null);
    setManagerSearch("");
  };

  const filteredManagerOptions = managerOptions.filter((manager) => {
    const term = managerSearch.trim().toLowerCase();
    if (!term) return true;
    return [manager.name, manager.email, manager.employeeId, manager.department].filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  });

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

  const updateEmployeeManager = async (employee, managerId) => {
    setManagerUpdatingId(employee._id);
    try {
      await api.patch(`/admin/users/${employee._id}`, { managerId: managerId || null });
      toast.success("Manager updated");
      await load();
      setSelectedEmployee(null);
      setManagerSearch("");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Could not update manager");
    } finally {
      setManagerUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-100">User Management</h2>
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input className="w-full rounded-lg border border-white/[0.08] bg-[#16161f] px-9 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 sm:w-72" placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-200">Employees</h3>
          <span className="text-[12px] text-slate-500">{employees.length} active</span>
        </div>
        <UserTable users={employees} onManageManager={openManagerModal} managerUpdatingId={managerUpdatingId} onDelete={deleteUser} deletingId={deletingId} />
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-200">Managers</h3>
          <span className="text-[12px] text-slate-500">{managers.length} active</span>
        </div>
        <UserTable users={managers} onDelete={deleteUser} deletingId={deletingId} />
      </section>
      <Modal open={Boolean(selectedEmployee)} title={selectedEmployee ? `Assign manager to ${selectedEmployee.name}` : "Assign manager"} onClose={closeManagerModal}>
        <div className="space-y-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input autoFocus className="w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-9 py-2.5 text-[13px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" placeholder="Search managers by name, email, ID, or department" value={managerSearch} onChange={(e) => setManagerSearch(e.target.value)} />
          </label>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-white/[0.06]">
            <button type="button" className="flex w-full items-center justify-between border-b border-white/[0.04] px-4 py-3 text-left text-[13px] text-slate-300 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60" disabled={managerUpdatingId === selectedEmployee?._id} onClick={() => updateEmployeeManager(selectedEmployee, "")}>
              <span>No manager</span>
              {!selectedEmployee?.managerId && <span className="text-[12px] text-indigo-300">Current</span>}
            </button>
            {filteredManagerOptions.map((manager) => {
              const isCurrent = String(selectedEmployee?.managerId?._id || selectedEmployee?.managerId || "") === String(manager._id);
              return (
                <button key={manager._id} type="button" className="flex w-full items-center justify-between gap-4 border-b border-white/[0.04] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60" disabled={managerUpdatingId === selectedEmployee?._id} onClick={() => updateEmployeeManager(selectedEmployee, manager._id)}>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-slate-200">{manager.name}</span>
                    <span className="block truncate text-[12px] text-slate-500">{manager.email}{manager.department ? ` - ${manager.department}` : ""}</span>
                  </span>
                  {isCurrent && <span className="shrink-0 text-[12px] text-indigo-300">Current</span>}
                </button>
              );
            })}
            {!filteredManagerOptions.length && <div className="px-4 py-8 text-center text-[13px] text-slate-500">No managers found</div>}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" disabled={Boolean(managerUpdatingId)} onClick={closeManagerModal}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
