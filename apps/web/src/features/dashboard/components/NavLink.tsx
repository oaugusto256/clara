import React from "react";

export interface NavLinkProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  sidebarOpen: boolean;
  active?: boolean;
}

/**
 * Standardized NavLink for Clara sidebar navigation.
 * Handles icon, label, and sidebar open/closed state.
 */
export const NavLink = ({ href, icon, label, sidebarOpen, active = false }: NavLinkProps) => {
  return (
    <a
      href={href}
      className={`flex items-center px-4 py-1 mx-2 rounded-md font-semibold duration-200 ${sidebarOpen
        ? `${active ? "bg-primary text-white" : "text-gray-400"}`
        : `text-center ${active ? "bg-primary text-white" : "text-gray-400"}`
        }`}
    >
      {icon && React.cloneElement(icon as React.ReactElement, { className: sidebarOpen ? "mr-2" : "" })}
      {sidebarOpen && label}
    </a>
  );
};
