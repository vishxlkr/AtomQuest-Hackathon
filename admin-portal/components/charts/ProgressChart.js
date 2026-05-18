"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export default function ProgressChart({ data = [] }) {
  return <ResponsiveContainer width="100%" height={260}><LineChart data={data}><XAxis dataKey="quarter" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="avgScore" name="Average Score" stroke="#4f46e5" /><Line type="monotone" dataKey="completionRate" name="Completion Rate" stroke="#10b981" /></LineChart></ResponsiveContainer>;
}
