"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import AtomLoader from "../components/ui/AtomLoader";

export default function RootPage() {
   const router = useRouter();
   const { user, isLoading } = useAuth();

   useEffect(() => {
      if (isLoading) return;

      if (user) {
         router.push("/dashboard");
      } else {
         router.push("/login");
      }
   }, [user, isLoading, router]);

   return (
      <div className="grid min-h-screen place-items-center bg-[#111118]">
         <AtomLoader />
      </div>
   );
}
