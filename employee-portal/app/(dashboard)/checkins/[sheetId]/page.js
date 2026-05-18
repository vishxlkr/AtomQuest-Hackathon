"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import CheckInForm from "../../../../components/checkin/CheckInForm";
import CenteredLoader from "../../../../components/ui/CenteredLoader";

function buildCheckInValues(sheet, checkIn, quarter) {
  const savedUpdates = checkIn?.goalUpdates || [];
  return (sheet?.goals || []).reduce((next, goal) => {
    const saved = savedUpdates.find((item) => String(item.goalId) === String(goal._id));
    const quarterly = goal.quarterly?.find((item) => item.quarter === quarter);
    next[goal._id] = saved?.managerNote || saved?.comment || quarterly?.managerComment || "";
    return next;
  }, {});
}

export default function CheckInSheetPage() {
  const { sheetId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheet, setSheet] = useState(null);
  const [values, setValues] = useState({});
  const [quarter, setQuarter] = useState(searchParams.get("quarter") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get("/goals/team/sheets"),
      api.get(`/checkin/${sheetId}/history`),
      quarter ? Promise.resolve({ data: { data: { quarter } } }) : api.get("/checkin/team/status")
    ])
      .then(([sheetsRes, historyRes, statusRes]) => {
        const nextQuarter = quarter || statusRes.data.data?.quarter || "";
        const nextSheet = sheetsRes.data.data.find((s) => s._id === sheetId);
        const checkIn = historyRes.data.data.find((item) => item.quarter === nextQuarter);
        setQuarter(nextQuarter);
        setSheet(nextSheet);
        setValues(buildCheckInValues(nextSheet, checkIn, nextQuarter));
      })
      .catch((err) => toast.error(err.response?.data?.error?.message || "Could not load check-in"))
      .finally(() => setIsLoading(false));
  }, [sheetId, quarter]);
  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post(`/checkin/${sheetId}/conduct`, { goalSheetId: sheetId, quarter, overallComment: "Quarterly check-in completed", goalUpdates: Object.entries(values).map(([goalId, managerNote]) => ({ goalId, managerNote })) });
      toast.success("Check-in submitted");
      router.push("/checkins");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Check-in submit failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) return <CenteredLoader label="Loading check-in..." />;
  return <div className="space-y-4"><h2 className="text-2xl font-semibold">Conduct Check-in{quarter ? ` - ${quarter}` : ""}</h2><CheckInForm sheet={sheet} quarter={quarter} values={values} setValues={setValues} onSubmit={submit} isSubmitting={isSubmitting} /></div>;
}
