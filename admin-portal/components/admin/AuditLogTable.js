import Table from "../ui/Table";
export default function AuditLogTable({ rows = [] }) {
  return <Table rows={rows} columns={[{ key: "timestamp", label: "Timestamp", render: (r) => new Date(r.timestamp).toLocaleString() }, { key: "entityType", label: "Entity" }, { key: "action", label: "Action" }, { key: "changedBy", label: "Changed By", render: (r) => r.changedBy?.name || "-" }, { key: "previousValue", label: "Previous Value", render: (r) => JSON.stringify(r.previousValue || {}) }, { key: "newValue", label: "New Value", render: (r) => JSON.stringify(r.newValue || {}) }, { key: "reason", label: "Reason" }]} />;
}
