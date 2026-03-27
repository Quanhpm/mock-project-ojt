import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Store,
  X,
  LogOut,
} from "lucide-react";
import type { AdminMenuItem } from "@/routes/admin/Admin.menu";
import { useAdminAuthStore, getRoleCode, getFranchiseId } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { useAdminLogout } from "@/modules/admin/auth-admin/hooks/use-admin-logout.hook";
import { ROUTER_URL } from "@/routes/router.const";
import FranchiseSwitcherDropdown from "./FranchiseSwitcherDropdown";

// Theme colors
const THEME_COLORS = {
  primary: "#7f5539",
  primaryLight: "#7f55391a",
} as const;

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  menuItems: AdminMenuItem[]; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen, 
  onMobileClose, 
  menuItems 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useAdminAuthStore();
  const { logout } = useAdminLogout();
  const roleCode = getRoleCode(store);
  const franchiseId = getFranchiseId(store);
  const { admin } = store;
  const [hasAvatarError, setHasAvatarError] = React.useState(false);
  const avatarUrl = admin?.avatar_url?.trim() || "";

  React.useEffect(() => {
    setHasAvatarError(false);
  }, [avatarUrl]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true });
  };

  const toAbsoluteAdminPath = (path: string) => {
    if (path.startsWith("/")) {
      return path;
    }

    return `${ROUTER_URL.ADMIN}/${path}`;
  };

  const normalizePath = (path: string) => path.replace(/\/+$/, "");

  const isActivePath = (item: AdminMenuItem) => {
    const currentPath = normalizePath(location.pathname);
    const targetPath = normalizePath(toAbsoluteAdminPath(item.path));

    if (item.activeExcludes?.some((excludePath) => {
      const absoluteExcludePath = normalizePath(toAbsoluteAdminPath(excludePath));
      return currentPath === absoluteExcludePath || currentPath.startsWith(`${absoluteExcludePath}/`);
    })) {
      return false;
    }

    if (item.isEnd) {
      return currentPath === targetPath;
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
  };

  const isAccountPageActive = () => {
    const currentPath = normalizePath(location.pathname);
    const accountPath = normalizePath("/admin/account");
    return currentPath === accountPath || currentPath.startsWith(`${accountPath}/`);
  };

  const handleProfileClick = () => {
    navigate("/admin/account");
    onMobileClose();
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            <Store className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-gray-800">Brew Admin</span>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onMobileClose}
          className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav
        className="flex-1 px-4 py-6 space-y-1 overflow-y-auto"
        aria-label="Main navigation"
      >
        {menuItems.map((item) => {
          const isActive = isActivePath(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              style={
                isActive
                  ? {
                      backgroundColor: THEME_COLORS.primaryLight,
                      color: THEME_COLORS.primary,
                    }
                  : {}
              }
            >
              <span
                style={isActive ? { color: THEME_COLORS.primary } : {}}
                className={isActive ? "" : "text-gray-500"}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - User Info */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-2">
        {/* Franchise Switcher Dropdown */}
        <FranchiseSwitcherDropdown />

        {/* User Profile - Clickable */}
        <button
          onClick={handleProfileClick}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
            ${
              isAccountPageActive()
                ? "bg-amber-50 shadow-sm"
                : "bg-gray-50 hover:bg-amber-50"
            }
          `}
        >
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            {avatarUrl && !hasAvatarError ? (
              <img
                src={avatarUrl}
                alt={admin?.name || admin?.email || "Admin avatar"}
                className="h-full w-full object-cover"
                onError={() => setHasAvatarError(true)}
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p
              className={`text-sm font-semibold truncate transition-colors ${
                isAccountPageActive()
                  ? "text-amber-900"
                  : "text-gray-800 group-hover:text-amber-900"
              }`}
            >
              {admin?.name || admin?.email || "Admin User"}
            </p>
            <p
              className={`text-xs truncate transition-colors ${
                isAccountPageActive()
                  ? "text-amber-700"
                  : "text-gray-500 group-hover:text-amber-700"
              }`}
            >
              {admin?.email || roleCode} {franchiseId && `- Franchise ${franchiseId}`}
            </p>
          </div>
        </button>

        {/* Logout Button - Separate */}
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop (fixed) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile (drawer) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[min(18rem,100vw)] max-w-full bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
