import Table from "../ui/Table";
import Badge from "../ui/Badge";
const score = (v) => <Badge tone={v > 80 ? "green" : v >= 50 ? "amber" : "red"}>{v ?? "-"}</Badge>;
export default function AchievementTable({ rows = [] }) {
  return <Table rows={rows} columns={[{ key: "employee", label: "Employee", render: (r) => r.employee?.name }, { key: "goal", label: "Goal Title", render: (r) => r.goal?.title }, { key: "thrustArea", label: "Thrust Area", render: (r) => r.goal?.thrustArea }, { key: "target", label: "Target", render: (r) => String(r.goal?.target) }, { key: "q1", label: "Q1 Score", render: (r) => score(r.quarterly?.find((q) => q.quarter === "Q1")?.progressScore) }, { key: "q2", label: "Q2 Score", render: (r) => score(r.quarterly?.find((q) => q.quarter === "Q2")?.progressScore) }, { key: "q3", label: "Q3 Score", render: (r) => score(r.quarterly?.find((q) => q.quarter === "Q3")?.progressScore) }, { key: "q4", label: "Q4 Score", render: (r) => score(r.quarterly?.find((q) => q.quarter === "Q4")?.progressScore) }]} />;
}
