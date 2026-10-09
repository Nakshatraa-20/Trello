import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8f1e6]">
      {/* Left sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#e5d8c7] p-6">
        Sidebar
      </aside>

      {/* Right side */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top navbar */}
        <header className="h-16 border-b border-[#e5d8c7] px-6 flex items-center">
          Top Navbar
        </header>

        {/* Current page */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}