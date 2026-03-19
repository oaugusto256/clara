
import { useTheme } from "@/hooks/useTheme";
import { FaMoon, FaSun, FaUserCircle } from "react-icons/fa";

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="navbar bg-base-300 shadow-b shadow-sm z-11">
      <div className="navbar-start" />
      <div className="navbar-end">
        <div className="dropdown dropdown-end flex gap-2">
          <button className="btn btn-sm rounded-full" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>
          <button className="btn btn-sm rounded-full" title="User menu">
            <FaUserCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
