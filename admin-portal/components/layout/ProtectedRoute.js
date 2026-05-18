"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const canUseAdminPortal = ["admin", "hr"].includes(user?.role);
  const isAdminPortalPath = pathname.startsWith("/admin") || pathname.startsWith("/reports");
  const canViewPath = user?.role === "hr" ? pathname === "/admin/escalations" : isAdminPortalPath;
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
    if (!isLoading && user && !["admin", "hr"].includes(user.role)) router.replace("/login");
    if (!isLoading && canUseAdminPortal && !isAdminPortalPath) router.replace("/admin/dashboard");
    if (!isLoading && user?.role === "hr" && pathname !== "/admin/escalations") router.replace("/admin/escalations");
  }, [isLoading, user, router, adminOnly, pathname, canUseAdminPortal, isAdminPortalPath]);
  if (isLoading || !user || !canUseAdminPortal || !canViewPath) return <main className="grid min-h-screen place-items-center bg-[#111118]"><Spinner /></main>;
  return children;
}
