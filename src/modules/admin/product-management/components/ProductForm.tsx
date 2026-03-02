import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Upload, AlertCircle, Package, Check } from "lucide-react";
import { useCreateProduct } from "./hooks/useCreateProduct";
import type { ProductCreatePayload } from "./product.types";

export default function ProductForm() {
  const navigate = useNavigate();
  const { createProduct, isCreating, error } = useCreateProduct();

  const [formData, setFormData] = useState<ProductCreatePayload>({
    SKU: "",
    name: "",
    description: "",
    content: "",
    image_url: "",
    images_url: [],
    min_price: 0,
    max_price: 0,
    is_have_topping: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.SKU.trim()) errors.SKU = "SKU is required";
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (!formData.image_url.trim()) errors.image_url = "Main image is required";
    if (formData.min_price <= 0) errors.min_price = "Min price must be greater than 0";
    if (formData.max_price <= 0) errors.max_price = "Max price must be greater than 0";
    if (formData.max_price < formData.min_price) errors.max_price = "Max price must be greater than min price";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Call API
    await createProduct(formData, (newProduct) => {
      navigate("/admin/products");
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    let newValue: any = value;
    if (type === "number") {
      newValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setFormData(prev => ({
      ...prev,
      image_url: url,
    }));
    if (formErrors.image_url) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image_url;
        return newErrors;
      });
    }
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
            Add a new product with details, pricing, and images.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Product Identity Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Package size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Product Identity</h2>
              </div>

              {/* SKU and Product Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    SKU <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="SKU"
                    value={formData.SKU}
                    onChange={handleChange}
                    placeholder="COFFEE_5"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.SKU ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.SKU && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.SKU}</p>}
                </div>

                {/* Product Name */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Product Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Coffee 5"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.name ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.name && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.name}</p>}
                </div>
              </div>

              {/* Min and Max Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Min Price (VND) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="min_price"
                    value={formData.min_price || ''}
                    onChange={handleChange}
                    placeholder="30000"
                    step="1000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.min_price ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.min_price && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.min_price}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Max Price (VND) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="max_price"
                    value={formData.max_price || ''}
                    onChange={handleChange}
                    placeholder="50000"
                    step="1000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: formErrors.max_price ? "1px solid #ef4444" : "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                  {formErrors.max_price && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.max_price}</p>}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Description <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cà phê rang xay đậm vị truyền thống buổi sáng"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: formErrors.description ? "1px solid #ef4444" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
                {formErrors.description && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.description}</p>}
              </div>

              {/* Content (HTML) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Content (HTML) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder='<h3><b>Product Details</b></h3><p>Your content here...</p>'
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: formErrors.content ? "1px solid #ef4444" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "monospace"
                  }}
                />
                {formErrors.content && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.content}</p>}
              </div>

              {/* Main Image URL */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Main Image URL <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: formErrors.image_url ? "1px solid #ef4444" : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
                {formErrors.image_url && <p style={{ fontSize: "11px", color: "#ef4444", margin: "4px 0 0 0" }}>{formErrors.image_url}</p>}
                {formData.image_url && (
                  <div style={{ marginTop: "12px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e0e0e0" }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ width: "100%", height: "auto", maxHeight: "200px", objectFit: "cover" }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Additional Images Section */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Upload size={18} color="#8B4513" />
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Additional Info</h2>
              </div>

              {/* Additional Image URLs */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Additional Image URLs (one per line)
                </label>
                <textarea
                  value={formData.images_url?.join("\n") || ""}
                  onChange={(e) => {
                    const urls = e.target.value.split("\n").filter(url => url.trim());
                    setFormData(prev => ({ ...prev, images_url: urls }));
                  }}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* Has Topping */}
              <div style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>
                      Product Has Topping
                    </label>
                    <p style={{ fontSize: "12px", color: "#6c757d", margin: 0 }}>
                      Check if this product can have additional toppings
                    </p>
                  </div>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, is_have_topping: !prev.is_have_topping }))}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: formData.is_have_topping ? "#8B4513" : "#e0e0e0",
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
                      left: formData.is_have_topping ? "22px" : "2px",
                      transition: "left 0.2s"
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{
                backgroundColor: "#fee",
                border: "1px solid #fca",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                gap: "8px"
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ margin: 0, fontSize: "12px", color: "#991b1b" }}>
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
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
              color: "#374151",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#e0e0e0";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isCreating ? "not-allowed" : "pointer",
              backgroundColor: "#8B4513",
              color: "white",
              transition: "all 0.2s",
              opacity: isCreating ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => {
              if (!isCreating) {
                e.currentTarget.style.backgroundColor = "#6d3610";
              }
            }}
            onMouseLeave={(e) => {
              if (!isCreating) {
                e.currentTarget.style.backgroundColor = "#8B4513";
              }
            }}
          >
            {isCreating && (
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid transparent",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }}
              />
            )}
            {isCreating ? "Creating..." : "Create Product"}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </form>
    </div>
  );
}