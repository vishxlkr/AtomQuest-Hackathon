import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
export default function UserTable({ users = [], onDelete, deletingId }) {
  return <Table rows={users} columns={[{ key: "employeeId", label: "Employee ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "department", label: "Department" }, { key: "manager", label: "Manager", render: (r) => r.managerId?.name || "-" }, { key: "status", label: "Status", render: (r) => <Badge tone={r.isActive ? "green" : "red"}>{r.isActive ? "Active" : "Inactive"}</Badge> }, { key: "actions", label: "Actions", render: (r) => <Button type="button" variant="danger" className="px-3 py-1.5" disabled={!r.isActive || deletingId === r._id} isLoading={deletingId === r._id} onClick={() => onDelete?.(r)}>Delete</Button> }]} />;
}
