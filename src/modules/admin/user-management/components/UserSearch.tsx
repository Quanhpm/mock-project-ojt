import { useRef, useEffect, useState } from "react";
import type { UseUserSearchReturn } from "../hooks/useUserSearch.hook";

// ============================================================================
// PROPS
// ============================================================================

interface UserSearchProps {
  /** Toàn bộ return value của useUserSearch được truyền từ UserManagement */
  searchState: UseUserSearchReturn;
  /** Callback được gọi khi người dùng bấm "Tìm kiếm" hoặc nhấn Enter */
  onSearch: () => void;
  /** Callback được gọi khi người dùng bấm "Xóa bộ lọc" */
  onClearFilters: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UserSearch({ searchState, onSearch, onClearFilters }: UserSearchProps) {
  const {
    filters,
    setFilters,
    searchHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
  } = searchState;

  // ── Refs & local state ──
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(-1);

  // ── Keyboard shortcut: Ctrl+K → focus input ──
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

  // ── Click outside → đóng dropdown ──
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

  // ── Handlers ──
  const handleSearch = () => {
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    onSearch();
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

  // ── Render ──
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      {/* Row 1: keyword input + Search button */}
      <div className="flex gap-3 items-center mb-3">
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

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-[#6c4830] transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
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
      </div>

      {/* Row 2: Filters + Clear button */}
      <div className="flex gap-3 items-center flex-wrap">
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

        {/* Clear Filters Button */}
        <button
          onClick={onClearFilters}
          className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm whitespace-nowrap"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}

