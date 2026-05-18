"use client";
import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { clearToken, setToken } from "../../../lib/auth";

function CallbackContent() {
   const params = useSearchParams();
   const router = useRouter();
   useEffect(() => {
      const token = params.get("token");
      if (!token) {
         toast.error("Missing SSO token");
         router.replace("/login");
         return;
      }

      // Set token first
      setToken(token);

      // Create a temporary API instance with the new token in the header
      const tempApi = axios.create({
         baseURL:
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
         withCredentials: true,
         headers: { Authorization: `Bearer ${token}` },
      });

      tempApi
         .get("/auth/me")
         .then((res) => {
            const user = res.data.data;
            if (!["admin", "manager"].includes(user.role)) {
               clearToken();
               toast.error("Use the employee portal for this account");
               router.replace("/login");
               return;
            }
            router.replace(
               user.role === "admin" ? "/admin/dashboard" : "/dashboard",
            );
         })
         .catch(() => {
            clearToken();
            toast.error("Unable to complete SSO login");
            router.replace("/login");
         });
   }, []);
   return (
      <main className="grid min-h-screen place-items-center text-sm text-slate-600">
         Signing you in...
      </main>
   );
}

export default function AuthCallbackPage() {
   return (
      <Suspense
         fallback={
            <main className="grid min-h-screen place-items-center text-sm text-slate-600">
               Signing you in...
            </main>
         }
      >
         <CallbackContent />
      </Suspense>
   );
}
