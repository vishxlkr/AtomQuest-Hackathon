import { useEffect, useState } from "react";
import api from "../lib/api";

export function useGoals() {
  const [sheet, setSheet] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const reload = () => api.get("/goals/sheet/my")
    .then((res) => {
      setSheet(res.data.data);
      setMeta(res.data.meta || null);
      setError(null);
    })
    .catch((err) => {
      setSheet(null);
      setError(err.response?.data?.error || { message: "Could not load goals" });
      setMeta(null);
    })
    .finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  return { sheet, goals: sheet?.goals || [], isLoading, meta, error, reload };
}
