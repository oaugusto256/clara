import { FaChartPie, FaChevronLeft, FaChevronRight, FaTable, FaTachometerAlt, FaTags } from "react-icons/fa";
import { NavLink } from "./NavLink";

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => (
  <aside className={`navbar bg-base-300 shadow-sm z-10 transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? "w-44" : "w-16"}`}>
    <div className="navbar-start flex items-center w-full my-4">
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
        className="btn btn-secondary btn-xs mx-auto mb-2"
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
      </button>
      {sidebarOpen ? <div className="text-center text-xs text-base-content my-4">&copy; {new Date().getFullYear()} Clara</div> : null}
    </div>
  </aside>
);
