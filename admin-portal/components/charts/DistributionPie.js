"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
const colors = ["#4f46e5", "#16a34a", "#f59e0b", "#dc2626", "#0891b2"];
export default function DistributionPie({ data = [] }) {
  const rows = data.map((x) => ({ name: x.name || x._id || "Unknown", value: x.count }));
  return <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={rows} dataKey="value" nameKey="name" label>{rows.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
}
