"use client";
import { useState } from "react";
import Button from "../ui/Button";
import api from "../../lib/api";
export default function ExportButton({ query = "" }) {
  const [isExporting, setIsExporting] = useState(false);
  const run = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const res = await api.get(`/reports/export-csv${query}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "achievement_report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };
  return <Button variant="secondary" onClick={run} isLoading={isExporting}>{isExporting ? "Exporting" : "Export CSV"}</Button>;
}
