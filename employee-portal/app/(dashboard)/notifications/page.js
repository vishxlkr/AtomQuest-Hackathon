"use client";
import api from "../../../lib/api";
import { useNotifications } from "../../../hooks/useNotifications";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";

export default function NotificationsPage() {
  const { items, reload } = useNotifications();
  const mark = async (id) => { await api.patch(`/notifications/${id}/read`); reload(); };
  return <div className="space-y-4"><PageHeader pageName="Notifications" title="Notifications" subtitle="Updates from approvals, check-ins, and HR actions." />{items.map((item) => <Card key={item._id} className="cursor-pointer hover:border-white/10 hover:bg-[#1a1a24]" onClick={() => mark(item._id)}><div className="flex justify-between gap-4"><div><h3 className="text-[14px] font-semibold text-slate-200">{item.title}</h3><p className="text-[13px] text-slate-500">{item.message}</p><p className="mt-2 text-[12px] text-slate-600">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.isRead && <Badge tone="indigo">New</Badge>}</div></Card>)}{!items.length && <Card><p className="text-[14px] text-slate-500">No notifications yet.</p></Card>}</div>;
}
