"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
   AlertTriangle,
   BarChart2,
   ClipboardCheck,
   FileText,
   LayoutDashboard,
   LogOut,
   Settings,
   Shield,
   Target,
   Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouteLoading } from "./RouteLoadingProvider";

const isHrefActive = (href, path) =>
   path === href || path?.startsWith(`${href}/`);

export default function Sidebar() {
   const { user, logout } = useAuth();
   const { startRouteLoading } = useRouteLoading();
   const pathname = usePathname();
   const managerLinks = [
      ["/dashboard", "Dashboard", LayoutDashboard],
      ["/team", "My Team", Users],
      ["/checkins", "Check-ins", ClipboardCheck],
      ["/shared-goals", "Shared Goals", Target],
      ["/reports", "Reports", FileText],
   ];
   const adminLinks = [
      ["/admin/dashboard", "Dashboard", LayoutDashboard],
      ["/admin/users", "User Management", Users],
      ["/admin/cycles", "Cycles", Settings],
      ["/admin/audit-logs", "Audit Logs", Shield],
      ["/reports", "Reports", FileText],
      ["/admin/analytics", "Analytics", BarChart2],
      ["/admin/escalations", "Escalations", AlertTriangle],
   ];
   const links = user?.role === "admin" ? adminLinks : managerLinks;
   const [optimisticHref, setOptimisticHref] = useState(null);
   const activePath = optimisticHref || pathname;
   const isActive = (href) => isHrefActive(href, activePath);
   const activeIndex = links.findIndex(([href]) => isActive(href));

   useEffect(() => {
      if (optimisticHref && isHrefActive(optimisticHref, pathname)) {
         setOptimisticHref(null);
      }
   }, [optimisticHref, pathname]);

   return (
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-white/5 bg-[#0d0d14]">
         <div className="border-b border-white/5 px-5 pb-5 pt-6">
            <div className="flex items-center gap-2.5">
               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/30">
                  <span className="text-xs font-bold text-white">A</span>
               </div>
               <span className="text-[15px] font-semibold tracking-tight text-white">
                  AtomQuest
               </span>
            </div>
            <p className="ml-9 mt-1.5 text-[10px] uppercase tracking-wider text-slate-500">
               Admin Portal
            </p>
         </div>
         <nav className="flex-1 px-3 py-4">
            <div className="relative space-y-1">
               {activeIndex >= 0 && (
                  <div
                     className="pointer-events-none absolute left-0 right-0 top-0 h-10 rounded-lg border border-indigo-500/20 bg-indigo-600/15 shadow-[0_0_20px_rgba(79,70,229,0.08)] transition-transform duration-300 ease-out"
                     style={{ transform: `translateY(${activeIndex * 44}px)` }}
                  >
                     <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400" />
                  </div>
               )}
               {links.map(([href, label, Icon]) => {
                  const active = isActive(href);
                  return (
                     <Link
                        key={href}
                        href={href}
                        onClick={() => {
                           if (!isHrefActive(href, pathname))
                              startRouteLoading();
                           setOptimisticHref(href);
                        }}
                        aria-current={active ? "page" : undefined}
                        className={`group relative z-10 flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors duration-200 ${
                           active
                              ? "text-indigo-400"
                              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        }`}
                     >
                        <Icon
                           size={15}
                           className={`transition-colors duration-200 ${label === "Escalations" && !active ? "text-amber-500" : active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}
                        />
                        {label}
                     </Link>
                  );
               })}
            </div>
         </nav>
         <div className="border-t border-white/5 px-3 pb-4 pt-3">
            <button
               type="button"
               onClick={logout}
               className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition-all duration-200 hover:border-white/[0.08] hover:bg-[#1c1c28] focus:outline-none focus-visible:border-indigo-500/40 focus-visible:bg-[#1c1c28] focus-visible:ring-2 focus-visible:ring-indigo-500/20"
               aria-label="Logout"
            >
               <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-[11px] font-bold text-white">
                     {user?.name?.charAt(0).toUpperCase()}
                  </span>
               </div>
               <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-slate-300 transition-colors duration-200 group-hover:text-white">
                     {user?.name}
                  </p>
                  <p className="text-[10px] capitalize text-slate-500 transition-colors duration-200 group-hover:text-slate-300">
                     {user?.role}
                  </p>
               </div>
               <div className="flex-shrink-0 text-slate-500 transition-colors duration-200 group-hover:text-red-300">
                  <LogOut size={13} />
               </div>
            </button>
         </div>
      </aside>
   );
}
