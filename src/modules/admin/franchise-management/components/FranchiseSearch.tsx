import { useEffect, useRef, useState } from "react";
import type { UseFranchiseSearchReturn } from "../hooks/useFranchiseSearch.hook";

interface FranchiseSearchProps {
  searchState: UseFranchiseSearchReturn;
  onSearch: () => void;
  onClearFilters: () => void;
}

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
    currentPage,
    setCurrentPage,
    executeSearch,
  } = searchState;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const onSearchRef = useRef(onSearch);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [draftKeyword, setDraftKeyword] = useState(filters.keyword);
  const [searchRequestVersion, setSearchRequestVersion] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchDropdownOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchDropdownOpen]);

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSearchDropdownOpen]);

  useEffect(() => {
    setDraftKeyword(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (searchRequestVersion === 0) return;
    onSearchRef.current();
  }, [searchRequestVersion]);

  const handleSearch = () => {
    const nextKeyword = draftKeyword;

    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    setFilters((prev) => ({ ...prev, keyword: nextKeyword }));

    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    setSearchRequestVersion((prev) => prev + 1);
  };

  const handleClearSearch = () => {
    setDraftKeyword("");
    searchInputRef.current?.focus();
  };

  const handleClearAllFilters = () => {
    setDraftKeyword("");
    setIsSearchDropdownOpen(false);
    setSelectedHistoryIndex(-1);
    onClearFilters();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchDropdownOpen || searchHistory.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedHistoryIndex((prev) =>
          prev < searchHistory.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        event.preventDefault();
        if (selectedHistoryIndex >= 0) {
          setDraftKeyword(searchHistory[selectedHistoryIndex]);
          setIsSearchDropdownOpen(false);
          setSelectedHistoryIndex(-1);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsSearchDropdownOpen(false);
        setSelectedHistoryIndex(-1);
        break;
      default:
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
    void executeSearch({ is_active, page: 1 });
  };

  const handleDeletedFilterChange = (value: boolean) => {
    setFilters((prev) => ({ ...prev, is_deleted: value }));
    setCurrentPage(1);
    void executeSearch({ is_deleted: value, page: 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center mb-3">
        <div className="flex-1 relative" ref={dropdownRef}>
          <div className="relative">
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

            <input
              ref={searchInputRef}
              type="text"
              value={draftKeyword}
              onChange={(event) => {
                setDraftKeyword(event.target.value);
                if (event.target.value.trim()) {
                  setIsSearchDropdownOpen(false);
                }
              }}
              onFocus={() => {
                if (!draftKeyword.trim() && searchHistory.length > 0) {
                  setIsSearchDropdownOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name, code, address... (Ctrl+K)"
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />

            {draftKeyword && (
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

          {isSearchDropdownOpen &&
            searchHistory.length > 0 &&
            !draftKeyword && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    Recent searches
                  </span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      clearHistory();
                      setIsSearchDropdownOpen(false);
                    }}
                    className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setDraftKeyword(item);
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

        <button
          onClick={handleSearch}
          className="w-full lg:w-auto justify-center px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-[#6c4830] transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
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

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-wrap">
        <select
          value={filters.is_active === null ? "null" : String(filters.is_active)}
          onChange={(event) => handleStatusFilterChange(event.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="null">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button
          onClick={() => handleDeletedFilterChange(!filters.is_deleted)}
          style={{
            padding: "9px 16px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            backgroundColor: filters.is_deleted ? "#fff3e0" : "white",
            color: filters.is_deleted ? "#f57c00" : "#6c757d",
            fontWeight: "500",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor = filters.is_deleted
              ? "#f57c00"
              : "#bdbdbd";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = "#e0e0e0";
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          {filters.is_deleted ? "Deleted" : "Current"}
        </button>

        <button
          onClick={handleClearAllFilters}
          className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm whitespace-nowrap self-start"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
