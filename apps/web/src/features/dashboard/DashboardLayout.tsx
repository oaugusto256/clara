import React from "react";

/**
 * Clara Dashboard Layout
 *
 * This is the main container for the dashboard feature. It arranges the primary widgets:
 * - Transactions Table (virtualized)
 * - Category Pie Chart
 * - Monthly Evolution Chart
 * - Recommendations Summary
 *
 * All data is loaded via API, and no business logic is duplicated here.
 */
import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex relative overflow-visible">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col relative overflow-visible">
        <Navbar />
        <main className="flex-1 w-full h-full p-4 transition-all duration-300 bg-zinc-200">
          {children}
        </main>
      </div>
    </div>
  );
}
