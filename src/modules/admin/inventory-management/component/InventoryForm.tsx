import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, AlertCircle, Check } from "lucide-react";
import { mockProducts, mockFranchises } from "../../../../mockdata";
import productFranchise from "../../../../mockdata/product_franchise.json";

export default function InventoryForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: "",
    franchiseId: "",
    quantity: 0,
    alertThreshold: 10,
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.franchiseId) {
      alert("Please select both Product and Franchise");
      return;
    }
    
    console.log("Form data:", formData);
    alert("Inventory item created successfully!");
    navigate("/admin/inventory");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setFormData({
      ...formData,
      quantity: Math.max(0, formData.quantity + delta),
    });
  };

  const handleThresholdChange = (delta: number) => {
    setFormData({
      ...formData,
      alertThreshold: Math.max(0, formData.alertThreshold + delta),
    });
  };

  const toggleActive = () => {
    setFormData({
      ...formData,
      isActive: !formData.isActive,
    });
  };

  // Get available products for selected franchise
  const getAvailableProducts = () => {
    if (!formData.franchiseId) return mockProducts;
    
    const franchiseProductIds = productFranchise
      .filter(pf => pf.franchise_id === parseInt(formData.franchiseId) && pf.is_active)
      .map(pf => pf.product_id);
    
    return mockProducts.filter(p => franchiseProductIds.includes(p.id));
  };

  const selectedProduct = mockProducts.find(p => p.id === parseInt(formData.productId));
  const selectedFranchise = mockFranchises.find(f => f.id === parseInt(formData.franchiseId));

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Inventory › <span style={{ color: "#212529" }}>Create Inventory</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Create New Inventory Item
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Add a new inventory item with product, franchise, and stock details.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/inventory")}
            style={{
              padding: "10px 20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: "#8B4513",
              color: "white",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
          >
            Create Inventory
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Product & Franchise Selection */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Product & Franchise</h2>
              </div>

              {/* Franchise Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Franchise <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  name="franchiseId"
                  value={formData.franchiseId}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select Franchise</option>
                  {mockFranchises.filter(f => f.is_active && !f.is_deleted).map((franchise) => (
                    <option key={franchise.id} value={franchise.id}>
                      {franchise.name} - {franchise.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Product <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  disabled={!formData.franchiseId}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: formData.franchiseId ? "white" : "#f8f9fa",
                    cursor: formData.franchiseId ? "pointer" : "not-allowed"
                  }}
                >
                  <option value="">Select Product</option>
                  {getAvailableProducts().map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.SKU}
                    </option>
                  ))}
                </select>
                {!formData.franchiseId && (
                  <p style={{ fontSize: "11px", color: "#6c757d", margin: "4px 0 0 0" }}>
                    Please select a franchise first
                  </p>
                )}
              </div>

              {/* Selected Product Preview */}
              {selectedProduct && selectedFranchise && (
                <div style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "16px",
                  marginTop: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={`https://picsum.photos/seed/product${selectedProduct.id}/400`}
                      alt={selectedProduct.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        objectFit: "cover"
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                        {selectedProduct.name}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                        {selectedFranchise.name}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                        SKU: {selectedProduct.SKU}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Information */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Stock Information</h2>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Quantity <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-10)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "500"
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    required
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      textAlign: "center",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(10)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "500"
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Alert Threshold */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Alert Threshold <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handleThresholdChange(-1)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "500"
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="alertThreshold"
                    value={formData.alertThreshold}
                    onChange={handleChange}
                    min="0"
                    required
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      textAlign: "center",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleThresholdChange(1)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "500"
                    }}
                  >
                    +
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "#6c757d", margin: "4px 0 0 0" }}>
                  Alert when stock falls below this level
                </p>
              </div>

              {/* Warning */}
              <div style={{
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                gap: "8px"
              }}>
                <AlertCircle size={16} color="#8B4513" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ margin: 0, fontSize: "12px", color: "#6d3610" }}>
                  Low stock alerts will be triggered when quantity falls below the alert threshold.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Status */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Inventory Status</h2>
              </div>

              {/* Active Status */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "12px", color: "#374151" }}>
                  Status
                </label>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#374151" }}>Active Inventory</span>
                  <div
                    onClick={toggleActive}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: formData.isActive ? "#8B4513" : "#e0e0e0",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      position: "absolute",
                      top: "2px",
                      left: formData.isActive ? "22px" : "2px",
                      transition: "left 0.2s"
                    }} />
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "#6c757d", margin: "8px 0 0 0" }}>
                  {formData.isActive ? "This inventory item is active and visible in the system" : "This inventory item is inactive and hidden from the system"}
                </p>
              </div>

              {/* Stock Status Preview */}
              <div style={{
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0"
              }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#6c757d", marginBottom: "12px" }}>
                  STOCK STATUS PREVIEW
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>Current Quantity:</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                    {formData.quantity}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>Alert Threshold:</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffc107" }}>
                    {formData.alertThreshold}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#374151" }}>Status:</span>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: formData.quantity === 0 ? "#dc354520" : formData.quantity <= formData.alertThreshold ? "#ffc10720" : "#28a74520",
                    color: formData.quantity === 0 ? "#dc3545" : formData.quantity <= formData.alertThreshold ? "#ffc107" : "#28a745"
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: formData.quantity === 0 ? "#dc3545" : formData.quantity <= formData.alertThreshold ? "#ffc107" : "#28a745"
                    }} />
                    {formData.quantity === 0 ? "Out of Stock" : formData.quantity <= formData.alertThreshold ? "Low Stock" : "In Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Sync Status */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: "#212529",
        color: "white",
        padding: "12px 20px",
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontSize: "14px",
        fontWeight: "500"
      }}>
        <Check size={18} color="#4caf50" />
        Ready to create inventory item
      </div>
    </div>
  );
}
