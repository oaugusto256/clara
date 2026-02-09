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
import { FaChartPie, FaChevronLeft, FaChevronRight, FaTable, FaTachometerAlt, FaTags } from "react-icons/fa";
import { NavLink } from "./components/NavLink";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className={`navbar bg-base-100 border-r border-primary transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? "w-44" : "w-16"}`}>
        <div className="navbar-start flex items-center w-full my-6">
          <span className="text-2xl font-bold text-base-content text-center w-full">{sidebarOpen ? "Clara" : "C"}</span>
        </div>
        <ul className="menu menu-vertical flex-1 gap-2">
          <li><NavLink active href="#" icon={<FaTachometerAlt />} label="Dashboard" sidebarOpen={sidebarOpen} /></li>
          <li><NavLink href="#" icon={<FaTable />} label="Transactions" sidebarOpen={sidebarOpen} /></li>
          <li><NavLink href="#" icon={<FaTags />} label="Categories" sidebarOpen={sidebarOpen} /></li>
          <li><NavLink href="#" icon={<FaChartPie />} label="Reports" sidebarOpen={sidebarOpen} /></li>
        </ul>
        <div className="flex flex-col">
          <button
            className="btn btn-xs btn-primary mx-auto mb-2"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
          </button>
          {sidebarOpen ? <div className="text-center text-xs text-base-content my-4">&copy; {new Date().getFullYear()} Clara</div> : null}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 min-h-screen transition-all duration-300 bg-zinc-100">
        <div className="w-full h-full ">
          {children}
        </div>
      </main>
    </div>
  );
}
