import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Upload, AlertCircle, Package, Check } from "lucide-react";

export default function ProductForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: "PRD-001",
    name: "",
    category: "",
    basePrice: "",
    stock: 100,
    description: "",
    visibleOnMobile: true,
    availableForDelivery: true,
    flashSaleEligible: false,
  });

  const [franchises] = useState([
    { id: 1, name: "Downtown - 5th Ave", code: "#LOC-001", basePrice: 5.50, specificPrice: 5.50, available: true },
    { id: 2, name: "Westside Mall", code: "#LOC-015", basePrice: 5.50, specificPrice: 5.95, available: true },
    { id: 3, name: "Airport Terminal B", code: "#LOC-022", basePrice: 5.50, specificPrice: 7.50, available: false },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);
    alert("Product created successfully!");
    navigate("/admin/products");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStockChange = (delta: number) => {
    setFormData({
      ...formData,
      stock: Math.max(0, formData.stock + delta),
    });
  };

  const toggleSwitch = (field: string) => {
    setFormData({
      ...formData,
      [field]: !formData[field as keyof typeof formData],
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Products › <span style={{ color: "#212529" }}>Create Product</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Create New Product
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Add a new product with identity, pricing, and inventory details.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
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
              backgroundColor: "#ff9800",
              color: "white"
            }}
          >
            Create Product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Product Identity Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#ff9800" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Product Identity</h2>
              </div>

              {/* Product ID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Product ID
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={formData.productId}
                      disabled
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        backgroundColor: "#f8f9fa",
                        boxSizing: "border-box",
                        paddingRight: "36px"
                      }}
                    />
                    <RefreshCw size={16} color="#6c757d" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#ff9800", margin: "4px 0 0 0" }}>AUTO-GENERATED</p>
                </div>

                {/* Product Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vanilla Bean Latte"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Category and Base Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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
                    <option value="">Hot Coffees</option>
                    <option value="coffee">Coffee</option>
                    <option value="pastry">Pastry</option>
                    <option value="merchandise">Merchandise</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="5.50"
                    step="0.01"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Rich espresso combined with creamy steamed milk and Madagascar vanilla bean syrup."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Product Images */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Product Images
                </label>
                <div style={{
                  border: "2px dashed #e0e0e0",
                  borderRadius: "8px",
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  cursor: "pointer"
                }}>
                  <Upload size={32} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                  <p style={{ margin: 0, fontSize: "14px", color: "#6c757d", fontWeight: "500" }}>
                    Update product visuals
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
                    PNG, JPG or WebP (max. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Franchise Mapping Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={18} color="#ff9800" />
                  <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Franchise Mapping</h2>
                </div>
                <button
                  type="button"
                  style={{
                    fontSize: "13px",
                    color: "#ff9800",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Select All Locations
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase" }}>
                      Franchise Location
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase" }}>
                      Base Price
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase" }}>
                      Specific Price
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#6c757d", textTransform: "uppercase" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {franchises.map((franchise) => (
                    <tr key={franchise.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input type="checkbox" defaultChecked={franchise.available} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                          <div>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>{franchise.name}</p>
                            <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>ID: {franchise.code}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: "14px" }}>${franchise.basePrice.toFixed(2)}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "14px" }}>$</span>
                          <input
                            type="number"
                            defaultValue={franchise.specificPrice.toFixed(2)}
                            step="0.01"
                            style={{
                              width: "80px",
                              padding: "6px 8px",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              fontSize: "14px",
                              outline: "none"
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: franchise.available ? "#e8f5e9" : "#f5f5f5",
                          color: franchise.available ? "#4caf50" : "#9e9e9e"
                        }}>
                          {franchise.available ? "Available" : "Not Listed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Inventory Status Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#ff9800" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Inventory Status</h2>
              </div>

              {/* Stock Level */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Initial Stock Level
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handleStockChange(-1)}
                    style={{
                      width: "32px",
                      height: "32px",
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
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
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
                    onClick={() => handleStockChange(1)}
                    style={{
                      width: "32px",
                      height: "32px",
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

              {/* Warning */}
              <div style={{
                backgroundColor: "#fff3e0",
                border: "1px solid #ffb74d",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                gap: "8px",
                marginBottom: "20px"
              }}>
                <AlertCircle size={16} color="#ff9800" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ margin: 0, fontSize: "12px", color: "#e65100" }}>
                  Provide is now managed within the core identity and franchise map for better consistency.
                </p>
              </div>

              {/* Product Visibility */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "12px", color: "#374151" }}>
                  Product Visibility
                </label>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "Visible on Mobile App", field: "visibleOnMobile" },
                    { label: "Available for Delivery", field: "availableForDelivery" },
                    { label: "Flash Sale eligible", field: "flashSaleEligible" }
                  ].map((item) => (
                    <div key={item.field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#374151" }}>{item.label}</span>
                      <div
                        onClick={() => toggleSwitch(item.field)}
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          backgroundColor: formData[item.field as keyof typeof formData] ? "#ff9800" : "#e0e0e0",
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
                          left: formData[item.field as keyof typeof formData] ? "22px" : "2px",
                          transition: "left 0.2s"
                        }} />
                      </div>
                    </div>
                  ))}
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
        All changes synced to ID System
      </div>
    </div>
  );
}