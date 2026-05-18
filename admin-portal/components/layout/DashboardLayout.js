import Sidebar from "./Sidebar";
import RouteLoadingProvider from "./RouteLoadingProvider";
export default function DashboardLayout({ children }) {
  return (
    <RouteLoadingProvider>
      <div className="min-h-screen bg-[#111118]">
        <Sidebar />
        <main className="ml-[220px] min-h-screen bg-[#111118]">
          <div className="mx-auto max-w-[1200px] px-8 py-8">{children}</div>
        </main>
      </div>
    </RouteLoadingProvider>
  );
}
