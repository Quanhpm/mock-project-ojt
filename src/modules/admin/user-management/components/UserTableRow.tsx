import React from "react";
import type { UserItem } from "../hooks/useUserList.hook";

interface UserTableRowProps {
  user: UserItem;
  isActive: boolean;
  isUpdating: boolean;
  onToggleStatus: (userId: string) => void;
  onView: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isActive,
  isUpdating,
  onToggleStatus,
  onView,
  onEdit,
  onDelete,
}) => {
  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      {/* USER */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <div
              className="h-10 w-10 rounded-full shrink-0 border border-slate-200"
              style={{
                backgroundImage: `url('${user.avatar_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm border border-transparent">
              {initial}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 truncate">
              {user.name}
            </span>
            <span className="text-sm text-slate-500 truncate">
              {user.email}
            </span>
          </div>
        </div>
      </td>

      {/* PHONE */}
      <td className="p-4 text-slate-600">{user.phone || "—"}</td>

      {/* VERIFY STATUS */}
      <td className="p-4">
        {user.is_verified ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <span className="material-symbols-outlined text-[16px]">
              verified
            </span>
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <span className="material-symbols-outlined text-[16px]">
              pending
            </span>
            Unverified
          </span>
        )}
      </td>

      {/* STATUS */}
      <td className="p-4">
        <label
          className="relative inline-flex items-center cursor-pointer"
          style={{
            opacity: isUpdating ? 0.5 : 1,
            cursor: isUpdating ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => onToggleStatus(user.id)}
            disabled={isUpdating}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </td>

      {/* ACTIONS */}
      <td style={{ padding: "16px 20px", textAlign: "right" }}>
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          {/* View Button */}
          <button
            onClick={() => onView(user)}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4b5563",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e0f2fe";
              e.currentTarget.style.color = "#0066cc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4b5563";
            }}
            title="View Details"
          >
            <span className="material-symbols-outlined text-[20px]">
              visibility
            </span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(user)}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4b5563",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef3c7";
              e.currentTarget.style.color = "#92400e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4b5563";
            }}
            title="Edit"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(user)}
            style={{
              padding: "8px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4b5563",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#4b5563";
            }}
            title="Delete"
          >
            <span className="material-symbols-outlined text-[20px]">
              delete
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};
