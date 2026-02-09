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

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${sidebarOpen ? "w-44" : "w-16"} bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen`}>
        <div className="flex items-center w-full my-6">
          <span className="text-2xl font-bold text-white text-center w-full">{sidebarOpen ? "Clara" : "C"}</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a href="#" className={`flex items-center px-4 py-1 mx-2 rounded-md font-semibold transition ${sidebarOpen ? "text-white bg-gray-700" : "text-white bg-gray-700 justify-center"}`}>{<FaTachometerAlt className={sidebarOpen ? 'mr-2' : ""} />} {sidebarOpen && "Dashboard"}</a>
          <a href="#" className={`flex items-center px-4 py-1 mx-2 rounded-md transition ${sidebarOpen ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-300 justify-center"}`}>{<FaTable className={sidebarOpen ? 'mr-2' : ""} />} {sidebarOpen && "Transactions"}</a>
          <a href="#" className={`flex items-center px-4 py-1 mx-2 rounded-md transition ${sidebarOpen ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-300 justify-center"}`}>{<FaTags className={sidebarOpen ? 'mr-2' : ""} />} {sidebarOpen && "Categories"}</a>
          <a href="#" className={`flex items-center px-4 py-1 mx-2 rounded-md transition ${sidebarOpen ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-300 justify-center"}`}>{<FaChartPie className={sidebarOpen ? 'mr-2' : ""} />} {sidebarOpen && "Reports"}</a>
        </nav>
        <div className="flex flex-col">
          <button
            className="mx-auto mb-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 focus:outline-none"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
          </button>
          {sidebarOpen ? <div className="text-center text-xs text-gray-500 my-4">&copy; {new Date().getFullYear()} Clara</div> : null}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4 bg-gray-950 min-h-screen transition-all duration-300">
        <div className="w-full h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
