import Table from "../ui/Table";
import Badge from "../ui/Badge";
export default function UserTable({ users = [] }) {
  return <Table rows={users} columns={[{ key: "employeeId", label: "Employee ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "department", label: "Department" }, { key: "manager", label: "Manager", render: (r) => r.managerId?.name || "-" }, { key: "status", label: "Status", render: (r) => <Badge tone={r.isActive ? "green" : "red"}>{r.isActive ? "Active" : "Inactive"}</Badge> }]} />;
}
