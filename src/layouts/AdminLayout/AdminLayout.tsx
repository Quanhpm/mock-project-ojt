import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { Menu } from "lucide-react";
import { useRoleBasedMenu } from '@/routes/admin/AdminRoleMenu';

function AdminLayout() {
  const allowedMenuItems = useRoleBasedMenu();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        menuItems={allowedMenuItems}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64">
        {/* Mobile Header with Menu Button */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-semibold text-gray-800">
            Brew Admin
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Content Area with Independent Scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
