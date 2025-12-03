import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-[#f5f7fa] text-gray-800 overflow-hidden">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* MAIN CONTENT WRAPPER */}
      <div
        className={`
          flex flex-col h-full flex-1
          transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-20"}
        `}
      >
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* CONTENT AREA - Always full width/height */}
        <main className="flex-1 h-full overflow-y-auto p-6 bg-[#f5f7fa]">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;
