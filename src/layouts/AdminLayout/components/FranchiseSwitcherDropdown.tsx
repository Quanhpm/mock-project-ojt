import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { switchContext, getProfile } from "@/apis/endpoints/auth.api";
import { ROUTER_URL } from "@/routes/router.const";

const THEME_COLORS = {
  primary: "#7f5539",
  primaryLight: "#7f55391a",
} as const;

const FranchiseSwitcherDropdown: React.FC = () => {
  const navigate = useNavigate();
  const store = useAdminAuthStore();
  const { roles, activeContext, setProfile } = store;

  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter franchise roles
  const franchiseRoles = roles.filter((r) => r.scope === "FRANCHISE");
  const hasGlobalRole = roles.some((r) => r.scope === "GLOBAL");

  // If no franchise roles, don't render
  if (franchiseRoles.length === 0) {
    return null;
  }

  // Determine current selection
  const currentFranchiseId = activeContext?.franchiseId || null;
  const currentLabel =
    currentFranchiseId === null && activeContext?.scope === "GLOBAL"
      ? "Global (Toàn hệ thống)"
      : franchiseRoles.find((r) => r.franchise_id === currentFranchiseId)
          ?.franchise_name || "Chọn chi nhánh";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = async (franchiseId: string | null) => {
    if (switching) return;
    setIsOpen(false);
    setSwitching(true);

    try {
      await switchContext(franchiseId);
      const updatedProfile = await getProfile();

      if (!updatedProfile) {
        throw new Error("Không thể lấy thông tin sau khi chuyển chi nhánh");
      }

      setProfile(updatedProfile);

      // Redirect to dashboard
      navigate(`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Switch context error:", error);
      alert("Không thể chuyển chi nhánh, vui lòng thử lại");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg 
          transition-all duration-200 border
          ${
            switching
              ? "bg-gray-100 cursor-not-allowed opacity-60"
              : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Building2
            size={18}
            style={{ color: THEME_COLORS.primary }}
            className="flex-shrink-0"
          />
          <span className="text-sm font-medium text-gray-800 truncate">
            {switching ? "Đang chuyển..." : currentLabel}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !switching && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto"
          style={{ minWidth: "240px" }}
        >
          {/* Global Option (if has global role) */}
          {hasGlobalRole && (
            <button
              onClick={() => handleSwitch(null)}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 transition-colors
                hover:bg-gray-50
                ${
                  currentFranchiseId === null && activeContext?.scope === "GLOBAL"
                    ? "bg-amber-50"
                    : ""
                }
              `}
            >
              <span
                className={`text-sm font-medium ${
                  currentFranchiseId === null && activeContext?.scope === "GLOBAL"
                    ? "text-amber-900"
                    : "text-gray-700"
                }`}
              >
                Global (Toàn hệ thống)
              </span>
              {currentFranchiseId === null && activeContext?.scope === "GLOBAL" && (
                <Check size={16} style={{ color: THEME_COLORS.primary }} />
              )}
            </button>
          )}

          {/* Divider if has global */}
          {hasGlobalRole && (
            <div className="h-px bg-gray-200 my-1" />
          )}

          {/* Franchise Options */}
          {franchiseRoles.map((role) => (
            <button
              key={role.franchise_id}
              onClick={() => handleSwitch(role.franchise_id)}
              className={`
                w-full flex items-center justify-between px-4 py-2.5 transition-colors
                hover:bg-gray-50
                ${
                  currentFranchiseId === role.franchise_id
                    ? "bg-amber-50"
                    : ""
                }
              `}
            >
              <span
                className={`text-sm font-medium ${
                  currentFranchiseId === role.franchise_id
                    ? "text-amber-900"
                    : "text-gray-700"
                }`}
              >
                {role.franchise_name || `Franchise ${role.franchise_id}`}
              </span>
              {currentFranchiseId === role.franchise_id && (
                <Check size={16} style={{ color: THEME_COLORS.primary }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FranchiseSwitcherDropdown;
