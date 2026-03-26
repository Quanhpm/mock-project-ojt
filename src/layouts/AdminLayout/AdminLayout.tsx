import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { Menu } from "lucide-react";
import { useRoleBasedMenu } from '@/routes/admin/AdminRoleMenu';
import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";

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
    <div className="flex min-h-[100svh] bg-gray-50 overflow-x-hidden lg:h-screen lg:overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        menuItems={allowedMenuItems}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        {/* Mobile Header with Menu Button */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
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
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="px-4 py-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global loading overlay — bật khi bất kỳ API nào đang chạy */}
      <GlobalLoadingOverlay />
    </div>
  );
}

export default AdminLayout;
