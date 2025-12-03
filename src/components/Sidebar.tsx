import React from "react";
import { NavLink } from "react-router-dom";
import { Home, FileText, Target } from "lucide-react";

import LogoFull from "../assets/logo-full-one-color.png";
import LogoIcon from "../assets/logo-icon-one-color.png";

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const baseLink =
    "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150";

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-[#E6F1FB] h-screen shadow-md fixed top-0 left-0 flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200 flex flex-col items-center">
        {open ? (
          <img src={LogoFull} className="w-[170px] object-contain" />
        ) : (
          <img src={LogoIcon} className="w-12 h-12 object-contain" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {/* Dashboard → we’ll use Minutes for now */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#005BAA] bg-[#0668C2]/10"
                : "text-gray-700 hover:bg-[#0668C2]/20 hover:text-[#005BAA]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1.5 bg-[#005BAA] rounded-r-lg" />
              )}
              <Home size={18} />
              {open && "Dashboard"}
            </>
          )}
        </NavLink>

        {/* Meeting Minutes */}
        <NavLink
          to="/minutes"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#005BAA] bg-[#0668C2]/10"
                : "text-gray-700 hover:bg-[#0668C2]/20 hover:text-[#005BAA]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1.5 bg-[#005BAA] rounded-r-lg" />
              )}
              <FileText size={18} />
              {open && "Meeting Minutes"}
            </>
          )}
        </NavLink>

        {/* Meeting Results */}
        <NavLink
          to="/results"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#005BAA] bg-[#0668C2]/10"
                : "text-gray-700 hover:bg-[#0668C2]/20 hover:text-[#005BAA]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1.5 bg-[#005BAA] rounded-r-lg" />
              )}
              <Target size={18} />
              {open && "Meeting Results"}
            </>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-300">
        {open ? "© 2025 Notulen" : "©25"}
      </footer>
    </aside>
  );
};

export default Sidebar;
