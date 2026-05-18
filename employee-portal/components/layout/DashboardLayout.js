import Sidebar from "./Sidebar";
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#111118]">
      <Sidebar />
      <main className="ml-[220px] min-h-screen bg-[#111118]">
        <div className="mx-auto max-w-[1200px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
