"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RootPage() {
   const router = useRouter();
   const { user, loading } = useAuth();

   useEffect(() => {
      if (loading) return;

      if (user) {
         router.push("/dashboard");
      } else {
         router.push("/login");
      }
   }, [user, loading, router]);

   return (
      <div className="grid min-h-screen place-items-center bg-[#111118]">
         <div className="text-center">
            <p className="text-[13px] text-slate-500">Loading...</p>
         </div>
      </div>
   );
}
