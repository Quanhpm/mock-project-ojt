import React, { useEffect, useRef, useState, useCallback } from "react";
import { Search, X, Clock, Loader2 } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  onRemoveSuggestion?: (suggestion: string) => void;
  showSuggestions?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Professional Search Bar Component with:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Global shortcut (Ctrl+K / Cmd+K)
 * - Search history dropdown
 * - Loading indicator
 * - Clear button
 * - Full accessibility
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Tìm kiếm sản phẩm, SKU...",
  suggestions = [],
  onSuggestionClick,
  onRemoveSuggestion,
  showSuggestions = true,
  disabled = false,
  className = "",
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  // Show dropdown when focused and have suggestions
  useEffect(() => {
    setShowDropdown(isFocused && showSuggestions && suggestions.length > 0);
  }, [isFocused, showSuggestions, suggestions.length]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || suggestions.length === 0) {
        if (e.key === "Escape") {
          inputRef.current?.blur();
          setIsFocused(false);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const selectedSuggestion = suggestions[selectedIndex];
            onSuggestionClick?.(selectedSuggestion);
            setShowDropdown(false);
            setIsFocused(false);
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    },
    [showDropdown, suggestions, selectedIndex, onSuggestionClick],
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle clear button click
  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion);
    setShowDropdown(false);
  };

  // Handle remove suggestion
  const handleRemoveSuggestion = (e: React.MouseEvent, suggestion: string) => {
    e.stopPropagation();
    onRemoveSuggestion?.(suggestion);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div
        className={`
          relative flex items-center
          bg-white rounded-lg border
          transition-all duration-200 ease-in-out
          ${
            isFocused
              ? "ring-2 ring-blue-500 border-transparent shadow-lg"
              : "border-gray-300 shadow-sm hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
        `}
      >
        {/* Search Icon */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <Search
            className={`w-5 h-5 transition-colors duration-200 ${
              isFocused ? "text-blue-500" : "text-gray-400"
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-20 py-2.5
            text-sm text-gray-900
            placeholder-gray-400
            bg-transparent
            border-none outline-none
            disabled:cursor-not-allowed
          `}
          aria-label="Search products"
          aria-describedby="search-hint"
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Loading Spinner */}
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {/* Clear Button */}
          {value && !disabled && !isLoading && (
            <button
              onClick={handleClear}
              className="
                p-1 rounded-full
                text-gray-400 hover:text-gray-600
                hover:bg-gray-100
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              aria-label="Clear search"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Keyboard Shortcut Hint (shown when not focused and no value) */}
          {!isFocused && !value && (
            <div
              className="
                hidden sm:flex items-center gap-1
                px-2 py-1 rounded
                text-xs text-gray-400
                bg-gray-100 border border-gray-200
              "
            >
              <kbd className="font-sans">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-sans">K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 w-full mt-2
            bg-white rounded-lg border border-gray-200
            shadow-lg overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-200
          "
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Lịch sử tìm kiếm
            </p>
          </div>

          {/* Suggestions List */}
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full px-4 py-2.5
                    flex items-center justify-between gap-3
                    text-sm text-left
                    transition-colors duration-150
                    ${
                      selectedIndex === index
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  type="button"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Clock
                      className={`w-4 h-4 shrink-0 ${
                        selectedIndex === index
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="truncate">{suggestion}</span>
                  </div>

                  {/* Remove Button */}
                  {onRemoveSuggestion && (
                    <button
                      onClick={(e) => handleRemoveSuggestion(e, suggestion)}
                      className="
                        p-1 rounded
                        text-gray-400 hover:text-red-500
                        hover:bg-red-50
                        transition-colors duration-150
                        focus:outline-none focus:ring-2 focus:ring-red-500
                      "
                      aria-label={`Remove ${suggestion} from history`}
                      type="button"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Footer Hint */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Dùng{" "}
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                ↑
              </kbd>{" "}
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                ↓
              </kbd>{" "}
              để di chuyển,{" "}
              <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                Enter
              </kbd>{" "}
              để chọn
            </p>
          </div>
        </div>
      )}

      {/* Screen reader hint */}
      <span id="search-hint" className="sr-only">
        Nhấn Ctrl+K để focus vào ô tìm kiếm. Dùng phím mũi tên để điều hướng gợi
        ý.
      </span>
    </div>
  );
};

export default SearchBar;
