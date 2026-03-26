import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package, Check, ArrowLeft, Save } from "lucide-react";
import { mockProducts, mockFranchises } from "../../../../mockdata";
import productFranchise from "../../../../mockdata/product_franchise.json";
import inventory from "../../../../mockdata/inventory.json";

export default function InventoryEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Helper functions
  const getProductName = (productFranchiseId: number) => {
    const pf = productFranchise.find(pf => pf.id === productFranchiseId);
    if (!pf) return "Unknown Product";
    const product = mockProducts.find(p => p.id === pf.product_id);
    return product?.name || "Unknown Product";
  };

  const getFranchiseName = (productFranchiseId: number) => {
    const pf = productFranchise.find(pf => pf.id === productFranchiseId);
    if (!pf) return "Unknown Franchise";
    const franchise = mockFranchises.find(f => f.id === pf.franchise_id);
    return franchise?.name || "Unknown Franchise";
  };

  const getProductSKU = (productFranchiseId: number) => {
    const pf = productFranchise.find(pf => pf.id === productFranchiseId);
    if (!pf) return "";
    const product = mockProducts.find(p => p.id === pf.product_id);
    return product?.SKU || "";
  };

  const getProductId = (productFranchiseId: number) => {
    const pf = productFranchise.find(pf => pf.id === productFranchiseId);
    return pf?.product_id || 0;
  };

  // Initialize form data
  const [formData, setFormData] = useState(() => {
    if (id) {
      const inventoryId = parseInt(id);
      const item = inventory.find(i => i.id === inventoryId);
      if (item) {
        return {
          id: item.id,
          productFranchiseId: item.product_franchise_id,
          quantity: item.quantity,
          alertThreshold: item.alert_threshold,
          isActive: item.is_active,
        };
      }
    }

    return {
      id: 0,
      productFranchiseId: 0,
      quantity: 0,
      alertThreshold: 10,
      isActive: true,
    };
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated inventory:", formData);
    alert("Inventory item updated successfully!");
    navigate("/admin/inventory");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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



  const productName = getProductName(formData.productFranchiseId);
  const franchiseName = getFranchiseName(formData.productFranchiseId);
  const productSKU = getProductSKU(formData.productFranchiseId);
  const productId = getProductId(formData.productFranchiseId);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <span 
          onClick={() => navigate("/admin/inventory")}
          style={{ cursor: "pointer", color: "#8B4513" }}
        >
          Inventory
        </span> › <span style={{ color: "#212529" }}>Edit Inventory</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <button
            onClick={() => navigate("/admin/inventory")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6c757d",
              fontSize: "14px"
            }}
          >
            <ArrowLeft size={18} />
            Back to Inventory
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Edit Inventory Item
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Update inventory quantity, alert threshold, and status.
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Inventory Identity */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Inventory Identity</h2>
              </div>

              {/* Inventory ID */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Inventory ID
                </label>
                <input
                  type="text"
                  value={`#${formData.id}`}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Product & Franchise Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Product & Franchise <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  value={formData.productFranchiseId}
                  onChange={(e) => setFormData({ ...formData, productFranchiseId: parseInt(e.target.value) })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="0">Select Product & Franchise</option>
                  {productFranchise.map((pf) => {
                    const product = mockProducts.find(p => p.id === pf.product_id);
                    const franchise = mockFranchises.find(f => f.id === pf.franchise_id);
                    return (
                      <option key={pf.id} value={pf.id}>
                        {product?.name || "Unknown"} - {franchise?.name || "Unknown"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Preview Selected Product */}
              {formData.productFranchiseId > 0 && (
                <div style={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <img
                      src={`https://picsum.photos/seed/product${productId}/400`}
                      alt={productName}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "8px",
                        objectFit: "cover"
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                        {productName}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                        SKU: {productSKU}
                      </p>
                    </div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    backgroundColor: "white", 
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <p style={{ margin: 0, fontSize: "11px", color: "#6c757d", marginBottom: "4px" }}>
                      FRANCHISE
                    </p>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                      {franchiseName}
                    </p>
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

            {/* Activity Log Preview */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0, marginBottom: "16px" }}>Recent Activity</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ 
                  padding: "12px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "6px",
                  borderLeft: "3px solid #8B4513"
                }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>Last Updated</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", fontWeight: "500", color: "#212529" }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ 
                  padding: "12px", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "6px",
                  borderLeft: "3px solid #28a745"
                }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>Created</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", fontWeight: "500", color: "#212529" }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
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
        Ready to save changes
      </div>

    </div>
  );
}
