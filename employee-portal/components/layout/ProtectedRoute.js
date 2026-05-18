"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

const managerPaths = ["/team", "/checkins", "/shared-goals", "/reports"];
const employeePaths = ["/goals", "/checkin"];
const startsWithAny = (pathname, paths) => paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
    if (!isLoading && user && !["employee", "manager"].includes(user.role)) router.replace("/login");
    if (!isLoading && user?.role === "employee" && startsWithAny(pathname, managerPaths)) router.replace("/dashboard");
    if (!isLoading && user?.role === "manager" && startsWithAny(pathname, employeePaths)) router.replace("/dashboard");
  }, [isLoading, user, router, pathname]);
  if (
    isLoading ||
    !user ||
    !["employee", "manager"].includes(user.role) ||
    (user.role === "employee" && startsWithAny(pathname, managerPaths)) ||
    (user.role === "manager" && startsWithAny(pathname, employeePaths))
  ) return <main className="grid min-h-screen place-items-center bg-[#111118]"><Spinner /></main>;
  return children;
}
