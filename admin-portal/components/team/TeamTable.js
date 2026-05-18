"use client";
import { useRouter } from "next/navigation";
import Badge from "../ui/Badge";
import Table from "../ui/Table";
import Button from "../ui/Button";
export default function TeamTable({ rows = [] }) {
  const router = useRouter();
  const columns = [
    { key: "employee", label: "Employee Name", render: (r) => r.employeeId?.name },
    { key: "department", label: "Department", render: (r) => r.employeeId?.department },
    { key: "submitted", label: "Goals Submitted", render: (r) => r.goals?.length || 0 },
    { key: "status", label: "Status", render: (r) => <Badge tone={r.approvalStatus === "approved" ? "green" : r.approvalStatus === "returned" ? "red" : "amber"}>{r.approvalStatus}</Badge> },
    { key: "weightage", label: "Weightage", render: (r) => `${r.totalWeightage || 0}%` },
    { key: "actions", label: "Actions", render: (r) => <Button onClick={() => router.push(`/team/${r._id}`)}>Review</Button> }
  ];
  return <Table columns={columns} rows={rows} />;
}
