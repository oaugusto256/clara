
import { useCallback, useState } from "react";
import { FaMoon, FaSun, FaUserCircle } from "react-icons/fa";

export const Navbar = () => {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'autumn';
  });

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'business' ? 'night' : 'business';
    document.documentElement.setAttribute('data-theme', newTheme);
    setTheme(newTheme);
  }, [theme]);

  return (
    <div className="navbar bg-base-100 shadow-lg shadow-b-gray-700 z-10">
      <div className="navbar-start" />
      <div className="navbar-end">
        <div className="dropdown dropdown-end flex gap-2">
          <button className="btn btn-sm btn-secondary rounded-full" onClick={toggleTheme} title="Toggle theme">
            {theme === 'business' ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>
          <button className="btn btn-sm btn-secondary rounded-full" title="User menu">
            <FaUserCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
