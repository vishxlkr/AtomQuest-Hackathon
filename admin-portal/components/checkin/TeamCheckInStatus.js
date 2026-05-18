import Table from "../ui/Table";
import Button from "../ui/Button";
export default function TeamCheckInStatus({ rows = [], onStart }) {
  return <Table rows={rows} columns={[{ key: "employee", label: "Employee", render: (r) => r.employee?.name }, { key: "q1", label: "Q1 Done", render: (r) => r.currentQuarterDone ? "Yes" : "No" }, { key: "q2", label: "Q2 Done", render: () => "-" }, { key: "q3", label: "Q3 Done", render: () => "-" }, { key: "q4", label: "Q4 Done", render: () => "-" }, { key: "action", label: "Action", render: (r) => <Button onClick={() => onStart(r.sheet._id)}>Start Check-in</Button> }]} />;
}
