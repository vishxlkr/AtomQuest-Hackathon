import Table from "../ui/Table";
import Button from "../ui/Button";
export default function TeamCheckInStatus({ rows = [], quarter = "Current", onStart }) {
  return <Table rows={rows} columns={[{ key: "employee", label: "Employee", render: (r) => r.employee?.name }, { key: "current", label: `${quarter} Done`, render: (r) => r.currentQuarterDone ? "Yes" : "No" }, { key: "action", label: "Action", render: (r) => <Button onClick={() => onStart(r.sheet._id)}>{r.currentQuarterDone ? "Edit Check-in" : "Start Check-in"}</Button> }]} />;
}
