"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../../lib/api";
import Card from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import GoalSheetReview from "../../../../components/team/GoalSheetReview";
import ApprovalActions from "../../../../components/team/ApprovalActions";
import PageHeader from "../../../../components/ui/PageHeader";
import CenteredLoader from "../../../../components/ui/CenteredLoader";
export default function ReviewPage() {
  const { sheetId } = useParams();
  const router = useRouter();
  const [sheet, setSheet] = useState(null);
  useEffect(() => { api.get("/goals/team/sheets").then((res) => setSheet(res.data.data.find((s) => s._id === sheetId))); }, [sheetId]);
  const approve = async () => { try { await api.patch(`/goals/sheet/${sheetId}/approve`); toast.success("Approved"); router.push("/team"); } catch (err) { toast.error(err.response?.data?.error?.message || "Approval failed"); } };
  const returnSheet = async (managerRemarks) => { await api.patch(`/goals/sheet/${sheetId}/return`, { managerRemarks }); router.push("/team"); };
  if (!sheet) return <CenteredLoader />;
  return <div className="space-y-5"><PageHeader pageName="Team / Review" title={sheet.employeeId?.name} subtitle={sheet.employeeId?.department} action={<Badge tone={sheet.isLocked ? "green" : "amber"}>{sheet.isLocked ? "Locked" : "Unlocked"}</Badge>} /><Card><p className={sheet.totalWeightage === 100 ? "text-[14px] font-semibold text-emerald-400" : "text-[14px] font-semibold text-red-400"}>Total weightage: {sheet.totalWeightage}%</p></Card><GoalSheetReview sheet={sheet} />{sheet.approvalStatus === "submitted" && <ApprovalActions onApprove={approve} onReturn={returnSheet} />}</div>;
}
