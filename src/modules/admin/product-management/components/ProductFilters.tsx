import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { mockCategories } from "@/mockdata";
import { mockFranchises } from "@/mockdata";

interface ProductFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onFranchiseChange: (franchiseId: string) => void;
  searchValue?: string;
  categoryValue?: string;
  franchiseValue?: string;
}

export default function ProductFilters({
  onSearchChange,
  onCategoryChange,
  onFranchiseChange,
  searchValue = "",
  categoryValue = "",
  franchiseValue = ""
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localCategory, setLocalCategory] = useState(categoryValue);
  const [localFranchise, setLocalFranchise] = useState(franchiseValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalCategory("");
    setLocalFranchise("");
    onSearchChange("");
    onCategoryChange("");
    onFranchiseChange("");
  };

  const hasActiveFilters = localSearch || localCategory || localFranchise;

  return (
    <div style={{ 
      backgroundColor: "white", 
      padding: "20px", 
      borderRadius: "12px",
      marginBottom: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "600",
          color: "#212529"
        }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "13px",
              color: "#6c757d",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      <div style={{ 
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "16px",
        alignItems: "end"
      }}>
        {/* Search by Name */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#495057"
          }}>
            Search by Product Name or ID
          </label>
          <div style={{ 
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}>
            <Search size={18} color="#6c757d" style={{ 
              position: "absolute", 
              left: "12px" 
            }} />
            <input
              type="text"
              placeholder="Enter product name or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#ff9800"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={16} color="#6c757d" />
              </button>
            )}
          </div>
        </div>

        {/* Filter by Category */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#495057"
          }}>
            Category
          </label>
          <select
            value={localCategory}
            onChange={(e) => {
              setLocalCategory(e.target.value);
              onCategoryChange(e.target.value);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#ff9800"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          >
            <option value="">All Categories</option>
            {mockCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Franchise */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#495057"
          }}>
            Franchise
          </label>
          <select
            value={localFranchise}
            onChange={(e) => {
              setLocalFranchise(e.target.value);
              onFranchiseChange(e.target.value);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#ff9800"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          >
            <option value="">All Franchises</option>
            {mockFranchises.filter(f => f.is_active && !f.is_deleted).map((franchise) => (
              <option key={franchise.id} value={franchise.id.toString()}>
                {franchise.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <span style={{
            fontSize: "13px",
            color: "#6c757d",
            fontWeight: "500"
          }}>
            Active Filters:
          </span>
          {localSearch && (
            <span style={{
              backgroundColor: "#fff3e0",
              color: "#f57c00",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              Name/ID: {localSearch}
              <button
                onClick={() => setLocalSearch("")}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {localCategory && (
            <span style={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              Category: {mockCategories.find(c => c.id == Number(localCategory))?.name}
              <button
                onClick={() => {
                  setLocalCategory("");
                  onCategoryChange("");
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
          {localFranchise && (
            <span style={{
              backgroundColor: "#f3e5f5",
              color: "#7b1fa2",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              Franchise: {mockFranchises.find(f => f.id.toString() === localFranchise)?.name}
              <button
                onClick={() => {
                  setLocalFranchise("");
                  onFranchiseChange("");
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
