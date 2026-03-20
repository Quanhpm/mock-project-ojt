import { useRef, useEffect, useState } from "react";
import type { UseFranchiseSearchReturn } from "../hooks/useFranchiseSearch.hook";

// ============================================================================
// PROPS
// ============================================================================

interface FranchiseSearchProps {
  /** Toàn bộ return value của useFranchiseSearch được truyền từ FranchiseTable */
  searchState: UseFranchiseSearchReturn;
  /** Callback được gọi khi người dùng bấm "Tìm kiếm" hoặc nhấn Enter */
  onSearch: () => void;
  /** Callback được gọi khi người dùng bấm "Xóa bộ lọc" */
  onClearFilters: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FranchiseSearch({
  searchState,
  onSearch,
  onClearFilters,
}: FranchiseSearchProps) {
  const {
    filters,
    setFilters,
    searchHistory,
    clearHistory,
    isSearchDropdownOpen,
    setIsSearchDropdownOpen,
    setCurrentPage,
    executeSearch,
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
    let is_active: boolean | null;
    if (value === "null") {
      is_active = null;
    } else if (value === "true") {
      is_active = true;
    } else {
      is_active = false;
    }
    setFilters((prev) => ({ ...prev, is_active }));
    setCurrentPage(1);
    setTimeout(() => executeSearch(), 0);
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
    setCurrentPage(1);
    setTimeout(() => executeSearch(), 0);
  };

  // ── Render ──
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        marginBottom: "20px",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Row 1: keyword input + Search button */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        {/* Search Bar */}
        <div
          style={{ flex: 1, position: "relative" }}
          ref={dropdownRef}
        >
          <div style={{ position: "relative" }}>
            {/* Search Icon */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#9ca3af",
              }}
            >
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
              placeholder="Search by name, code, address... (Ctrl+K)"
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
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = "#8B5A2B";
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                paddingLeft: "40px",
                paddingRight: filters.keyword ? "40px" : "14px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "inherit",
                backgroundColor: "#f9fafb",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {/* Clear Button */}
            {filters.keyword && (
              <button
                onClick={handleClearSearch}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#bdbdbd";
                  e.currentTarget.style.color = "#212529";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                  e.currentTarget.style.color = "#6c757d";
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "20px",
                  height: "20px",
                  border: "none",
                  borderRadius: "50%",
                  backgroundColor: "#e0e0e0",
                  color: "#6c757d",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
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
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  zIndex: 50,
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                    }}
                  >
                    Recent searches
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                      setIsSearchDropdownOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fee")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    style={{
                      fontSize: "11px",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                  >
                    Clear
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        selectedHistoryIndex === index
                          ? "#f3f4f6"
                          : "transparent")
                    }
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor:
                        selectedHistoryIndex === index
                          ? "#f3f4f6"
                          : "transparent",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "#9ca3af" }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6d4423";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8B5A2B";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#8B5A2B",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            height: "42px",
          }}
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
          Search
        </button>
      </div>

      {/* Row 2: Filters + Clear button */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Status Filter */}
        <select
          value={
            filters.is_active === null ? "null" : String(filters.is_active)
          }
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          style={{
            padding: "9px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "inherit",
            backgroundColor: "#f9fafb",
            cursor: "pointer",
            outline: "none",
            minWidth: "160px",
          }}
        >
          <option value="null">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Deleted Filter */}
        <select
          value={filters.is_deleted ? "true" : "false"}
          onChange={(e) => handleDeletedFilterChange(e.target.value === "true")}
          style={{
            padding: "9px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "inherit",
            backgroundColor: "#f9fafb",
            cursor: "pointer",
            outline: "none",
            minWidth: "140px",
          }}
        >
          <option value="false">Not deleted</option>
          <option value="true">Deleted</option>
        </select>

        {/* Clear Filters Button */}
        <button
          onClick={onClearFilters}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
          style={{
            padding: "9px 16px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
