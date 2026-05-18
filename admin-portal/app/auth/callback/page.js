"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { clearToken, setToken } from "../../../lib/auth";

export default function AuthCallbackPage() {
   const router = useRouter();

   useEffect(() => {
      const handleCallback = async () => {
         // Get token from URL search params
         const searchParams = new URLSearchParams(window.location.search);
         const token = searchParams.get("token");

         if (!token) {
            toast.error("Missing SSO token");
            router.replace("/login");
            return;
         }

         try {
            // Set token first
            setToken(token);

            // Create a temporary API instance with the new token in the header
            const tempApi = axios.create({
               baseURL:
                  process.env.NEXT_PUBLIC_API_URL ||
                  "http://localhost:5000/api/v1",
               withCredentials: true,
               headers: { Authorization: `Bearer ${token}` },
            });

            const res = await tempApi.get("/auth/me");
            const user = res.data.data;
            if (user.role !== "admin") {
               clearToken();
               toast.error("Use the employee portal for this account");
               router.replace("/login");
               return;
            }
            router.replace("/admin/dashboard");
         } catch (err) {
            clearToken();
            toast.error("Unable to complete SSO login");
            router.replace("/login");
         }
      };

      handleCallback();
   }, [router]);

   return (
      <main className="grid min-h-screen place-items-center text-sm text-slate-600">
         Signing you in...
      </main>
   );
}
