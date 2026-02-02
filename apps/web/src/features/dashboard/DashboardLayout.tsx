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
export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col gap-4 py-8 px-2 min-h-screen">
        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-white tracking-wide">Clara</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <a href="#" className="flex items-center gap-3 px-4 py-1 rounded-md text-white bg-gray-700 font-semibold"><span className="i-heroicons-home w-5 h-5" />Dashboard</a>
          <a href="#" className="flex items-center gap-3 px-4 py-1 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"><span className="i-heroicons-banknotes w-5 h-5" />Transactions</a>
          <a href="#" className="flex items-center gap-3 px-4 py-1 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"><span className="i-heroicons-tag w-5 h-5" />Categories</a>
          <a href="#" className="flex items-center gap-3 px-4 py-1 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition"><span className="i-heroicons-chart-pie w-5 h-5" />Reports</a>
        </nav>
        <div className="text-center mt-auto pt-4 border-t border-gray-700 text-xs text-gray-500">&copy; {new Date().getFullYear()} Clara</div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-12 bg-gray-950 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
