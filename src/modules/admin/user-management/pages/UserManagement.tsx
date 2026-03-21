import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserTableRow,
  Pagination,
  EditUserModal,
  DeleteUserDialog,
  ViewUserModal,
} from "../components";
import { useUserSearch, useUserStatus } from "../hooks";
import type { UserItem } from "../api/user.types";

/** Skeleton row cho trạng thái loading */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-44 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 w-28 bg-slate-200 rounded" />
    </td>
    <td className="p-4">
      <div className="h-6 w-20 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4">
      <div className="h-6 w-11 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4" />
  </tr>
);

function UserManagement() {
  const navigate = useNavigate();

  // ──────── Search Hook ────────
  const {
    data: users,
    isLoading,
    filters,
    setFilters,
    executeSearch,
    clearFilters,
    searchHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  } = useUserSearch();

  // Refs for search functionality
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);

  // ──────── Keyboard Shortcuts (Ctrl+K) ────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchDropdownOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchDropdownOpen]);

  // ──────── Click Outside to Close Dropdown ────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchDropdownOpen]);

  // Auto-correct currentPage if it exceeds totalPages after deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // ──────── Search Handlers ────────
  const handleSearch = () => {
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    executeSearch();
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: "" }));
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownOpen || searchHistory.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedHistoryIndex((prev) =>
          prev < searchHistory.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedHistoryIndex >= 0) {
          setFilters((prev) => ({
            ...prev,
            keyword: searchHistory[selectedHistoryIndex],
          }));
          setIsSearchDropdownOpen(false);
          setSelectedHistoryIndex(-1);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
        break;
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, is_active: value }));
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
  };

  // ──────── Status Toggle ────────
  const { toggleStatus, updatingId } = useUserStatus();
  const [userStatus, setUserStatus] = useState<Record<string, boolean>>({});

  const handleToggleUserStatus = useCallback(
    (userId: string) => {
      // Get current status from state or user data
      const currentStatus =
        userStatus[userId] ??
        users.find((u) => u.id === userId)?.is_active ??
        false;

      console.log(
        `🎯 Toggle status clicked for user ${userId}. Current status: ${currentStatus}`,
      );

      // Optimistic UI update: Update state immediately
      setUserStatus((prev) => ({
        ...prev,
        [userId]: !currentStatus,
      }));

      // Call API to update user status
      toggleStatus(
        userId,
        currentStatus,
        () => {
          // onSuccess - Refresh data to sync with server
          executeSearch();
        },
        () => {
          // onError - Rollback to previous state
          setUserStatus((prev) => ({
            ...prev,
            [userId]: currentStatus,
          }));
        },
      );
    },
    [userStatus, users, toggleStatus, executeSearch],
  );

  // ──────── Create redirect ────────
  const handleCreateClick = useCallback(() => {
    navigate("/admin/users/create");
  }, [navigate]);

  // ──────── View Modal ────────
  const [viewUser, setViewUser] = useState<UserItem | null>(null);

  const handleViewClick = useCallback((user: UserItem) => {
    setViewUser(user);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewUser(null);
  }, []);

  // ──────── Edit Modal ────────
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const handleEditClick = useCallback((user: UserItem) => {
    setEditUser(user);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditUser(null);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditUser(null);
    executeSearch(); // Refresh data
  }, [executeSearch]);

  // ──────── Delete Dialog ────────
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const handleDeleteClick = useCallback((user: UserItem) => {
    setDeleteTarget(user);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setDeleteTarget(null);
    executeSearch(); // Refresh data
  }, [executeSearch]);

  return (
    <div className="flex flex-col w-full">
      <main className="flex flex-col flex-1">
        {/* Page Header */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span className="text-slate-900 font-medium">Users</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                User Management
              </h2>
              <p className="text-slate-500">
                Total Users: {isLoading ? "..." : totalItems}
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              Create User
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 pb-8">
          {/* Filters & Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex gap-3 items-end">
              {/* Search Bar */}
              <div className="flex-1 relative" ref={dropdownRef}>
                <div className="relative">
                  {/* Search Icon */}
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>

                  {/* Search Input */}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        keyword: e.target.value,
                      }));
                      if (e.target.value.trim()) {
                        setIsSearchDropdownOpen(false);
                      }
                    }}
                    onFocus={() => {
                      if (!filters.keyword.trim() && searchHistory.length > 0) {
                        setIsSearchDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Tìm kiếm theo tên, email, số điện thoại... (Ctrl+K)"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />

                  {/* Clear Button */}
                  {filters.keyword && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-all"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Dropdown - History */}
                {isSearchDropdownOpen &&
                  searchHistory.length > 0 &&
                  !filters.keyword && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          Tìm kiếm gần đây
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearHistory();
                            setIsSearchDropdownOpen(false);
                          }}
                          className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                      {searchHistory.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, keyword: item }));
                            setIsSearchDropdownOpen(false);
                            setSelectedHistoryIndex(-1);
                          }}
                          className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-slate-50 ${
                            selectedHistoryIndex === index ? "bg-slate-100" : ""
                          }`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Status Filter */}
              <select
                value={filters.is_active}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
              </select>

              {/* Deleted Filter */}
              <select
                value={filters.is_deleted ? "true" : "false"}
                onChange={(e) =>
                  handleDeletedFilterChange(e.target.value === "true")
                }
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="false">Chưa xóa</option>
                <option value="true">Đã xóa</option>
              </select>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-[#6c4830] transition-colors font-medium text-sm flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Tìm kiếm
              </button>

              {/* Clear Filters Button */}
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Verify
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Loading state */}
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}

                  {/* Data rows */}
                  {!isLoading &&
                    users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        isActive={userStatus[user.id] ?? user.is_active}
                        isUpdating={updatingId === user.id}
                        onToggleStatus={handleToggleUserStatus}
                        onView={handleViewClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
                    ))}

                  {/* Empty state */}
                  {!isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-slate-300">
                            group_off
                          </span>
                          <p className="text-slate-500 font-medium">
                            No users found
                          </p>
                          <p className="text-sm text-slate-400">
                            There are no user records to display.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>

      {/* ═══════════ Modals ═══════════ */}

      {/* View User Modal */}
      <ViewUserModal
        isOpen={!!viewUser}
        user={viewUser}
        onClose={handleViewClose}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editUser}
        user={editUser}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={!!deleteTarget}
        userId={deleteTarget?.id ?? ""}
        userName={deleteTarget?.name ?? ""}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default UserManagement;
