"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
    if (!isLoading && user && !["manager", "admin"].includes(user.role)) router.replace("/login");
    if (!isLoading && user && (adminOnly || pathname.startsWith("/admin")) && user.role !== "admin") router.replace("/dashboard");
  }, [isLoading, user, router, adminOnly, pathname]);
  if (isLoading || !user) return <main className="grid min-h-screen place-items-center">Loading...</main>;
  return children;
}
