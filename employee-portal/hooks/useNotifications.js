import { useEffect, useState } from "react";
import api from "../lib/api";

export function useNotifications() {
  const [data, setData] = useState({ items: [], unreadCount: 0 });
  const reload = () => api.get("/notifications").then((res) => setData(res.data.data));
  useEffect(() => { reload(); }, []);
  return { ...data, reload };
}
