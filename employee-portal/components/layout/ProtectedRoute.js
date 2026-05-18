"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
    if (!isLoading && user && user.role !== "employee") router.replace("/login");
  }, [isLoading, user, router]);
  if (isLoading || !user || user.role !== "employee") return <main className="grid min-h-screen place-items-center"><Spinner /></main>;
  return children;
}
