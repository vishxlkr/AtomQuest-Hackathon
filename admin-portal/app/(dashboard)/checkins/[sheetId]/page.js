"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../lib/api";
import CheckInForm from "../../../../components/checkin/CheckInForm";
export default function CheckInSheetPage() {
  const { sheetId } = useParams();
  const router = useRouter();
  const [sheet, setSheet] = useState(null);
  const [values, setValues] = useState({});
  useEffect(() => { api.get("/goals/team/sheets").then((res) => setSheet(res.data.data.find((s) => s._id === sheetId))); }, [sheetId]);
  const submit = async () => { await api.post(`/checkin/${sheetId}/conduct`, { goalSheetId: sheetId, quarter: "Q4", overallComment: "Quarterly check-in completed", goalUpdates: Object.entries(values).map(([goalId, managerNote]) => ({ goalId, managerNote })) }); router.push("/checkins"); };
  return <div className="space-y-4"><h2 className="text-2xl font-semibold">Conduct Check-in</h2><CheckInForm sheet={sheet} values={values} setValues={setValues} onSubmit={submit} /></div>;
}
