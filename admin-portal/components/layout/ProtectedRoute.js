"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
    if (!isLoading && user && user.role !== "admin") router.replace("/login");
    if (!isLoading && user?.role === "admin" && !pathname.startsWith("/admin")) router.replace("/admin/dashboard");
  }, [isLoading, user, router, adminOnly, pathname]);
  if (isLoading || !user || user.role !== "admin" || !pathname.startsWith("/admin")) return <main className="grid min-h-screen place-items-center bg-[#111118]"><Spinner /></main>;
  return children;
}
