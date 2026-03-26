import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package, Upload, X } from "lucide-react";
import { mockProducts, mockCategories, mockFranchises } from "@/mockdata";
import productFranchises from "@/mockdata/product_franchise.json";
import inventory from "@/mockdata/inventory.json";
import axios from "axios";
import { ENV } from "@/config/env.config";
import { useToast } from "@/hooks/use-toast.hook";
import {
  CLOUDINARY_IMAGE_REQUIREMENT_TEXT,
  validateCloudinaryImageFile,
} from "@/utils";

export default function ProductEditForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions to get product data from normalized structure
  const getProductPrice = (productId: number, franchiseId: number = 1) => {
    const productFranchise = productFranchises.find(
      pf => pf.product_id === productId && pf.franchise_id === franchiseId
    );
    return productFranchise ? productFranchise.price_base : 0;
  };

  const getProductStock = (productId: number, franchiseId: number = 1) => {
    const productFranchise = productFranchises.find(
      pf => pf.product_id === productId && pf.franchise_id === franchiseId
    );
    if (productFranchise) {
      const inventoryItem = inventory.find(
        inv => inv.product_franchise_id === productFranchise.id
      );
      return inventoryItem ? inventoryItem.quantity : 0;
    }
    return 0;
  };

  const getProductFranchiseIds = (productId: number) => {
    return productFranchises
      .filter(pf => pf.product_id === productId)
      .map(pf => pf.franchise_id);
  };

  // Initialize form data based on product ID
  const [formData, setFormData] = useState(() => {
    if (id) {
      const productId = parseInt(id);
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        const price = getProductPrice(product.id);
        const stock = getProductStock(product.id);

        return {
          id: product.id.toString(),
          name: product.name,
          description: product.description,
          price: price.toString(),
          originalPrice: product.max_price.toString(),
          categoryId: product.category_id.toString(),
          brand: product.SKU, // Using SKU as brand for now
          sku: product.SKU,
          stock: stock,
          status: product.is_active ? "active" : "inactive",
          rating: 4.5, // Default rating
          reviewCount: 0, // Default review count
          tags: [] as string[], // Default empty tags
          specifications: {} as Record<string, string>, // Default empty specifications
          images: product.image_url ? [product.image_url] : []
        };
      }
    }

    return {
      id: "",
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      brand: "",
      sku: "",
      stock: 0,
      status: "active",
      rating: 0,
      reviewCount: 0,
      tags: [] as string[],
      specifications: {} as Record<string, string>,
      images: [] as string[]
    };
  });

  const [imagePreview, setImagePreview] = useState<string[]>(() => {
    if (id) {
      const productId = parseInt(id);
      const product = mockProducts.find(p => p.id === productId);
      return product?.image_url ? [product.image_url] : [];
    }
    return [];
  });

  const [franchiseAvailability, setFranchiseAvailability] = useState<number[]>(() => {
    if (id) {
      const productId = parseInt(id);
      return getProductFranchiseIds(productId);
    }
    return [];
  });

  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated product:", formData);
    console.log("Franchise availability:", franchiseAvailability);
    alert("Product updated successfully!");
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

  const toggleFranchise = (franchiseId: number) => {
    if (franchiseAvailability.includes(franchiseId)) {
      setFranchiseAvailability(franchiseAvailability.filter(id => id !== franchiseId));
    } else {
      setFranchiseAvailability([...franchiseAvailability, franchiseId]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey.trim()]: specValue.trim()
        }
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        validateCloudinaryImageFile(file);

        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", ENV.CLOUDINARY_UPLOAD_PRESET);
        uploadData.append("folder", "products");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
          uploadData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      setImagePreview((prev) => [...prev, ...urls]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
      showSuccess("Thành công", `Đã tải lên ${urls.length} ảnh.`);
    } catch (err: unknown) {
      console.error("Images Upload Error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải lên một hoặc nhiều ảnh.";
      showError("Upload thất bại", errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = imagePreview.filter((_, i) => i !== index);
    setImagePreview(newImages);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <span
          onClick={() => navigate("/admin/products")}
          style={{ cursor: "pointer", color: "#8B4513" }}
        >
          Products
        </span> › <span style={{ color: "#212529" }}>Edit Product</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <button
            onClick={() => navigate("/admin/products")}
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
            Back to Products
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            Edit Product
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Update product information, pricing, and availability across franchises.
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Product Identity */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <Package size={20} color="#8B4513" />
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Product Identity</h2>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Product ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    backgroundColor: "#f5f5f5",
                    color: "#6c757d"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter product description"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: "16px" }} className="grid-cols-1 sm:grid-cols-2">
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter brand"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Pricing</h2>
              <div style={{ display: "grid", gap: "16px" }} className="grid-cols-1 sm:grid-cols-2">
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    Current Price (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                    Original Price (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Product Images</h2>

              <div style={{
                border: "2px dashed #e0e0e0",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
                marginBottom: "16px"
              }}>
                <Upload size={32} color="#9e9e9e" style={{ margin: "0 auto 12px" }} />
                <p style={{ margin: 0, marginBottom: "8px", fontSize: "14px", color: "#6c757d" }}>
                  Click to upload or drag and drop
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: isUploading ? "#8B4513" : "#9e9e9e" }}>
                  {isUploading ? "Uploading..." : "PNG, JPG or WEBP"}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    padding: "8px 16px",
                    backgroundColor: isUploading ? "#e0e0e0" : "#8B4513",
                    color: isUploading ? "#9e9e9e" : "white",
                    borderRadius: "6px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = "#6d3610"; }}
                  onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = "#8B4513"; }}
                >
                  {isUploading ? "Uploading..." : "Choose Files"}
                </label>
                <p
                  style={{
                    margin: "12px 0 0 0",
                    fontSize: "12px",
                    color: "#6c757d",
                    textAlign: "center",
                  }}
                >
                  {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
                </p>
              </div>

              {imagePreview.length > 0 && (
                <div style={{ display: "grid", gap: "12px" }} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {imagePreview.map((img, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          backgroundColor: "#f44336",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white"
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Specifications</h2>

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Key (e.g., Screen Size)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 6.7 inch)"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#8B4513",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
                >
                  Add
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "13px", color: "#6c757d", fontWeight: "500" }}>{key}:</span>
                      <span style={{ fontSize: "14px", color: "#212529", marginLeft: "8px" }}>{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#f44336",
                        padding: "4px"
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Category */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Category</h2>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                  cursor: "pointer"
                }}
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Inventory */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Inventory</h2>

              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                Stock Quantity
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => handleStockChange(-1)}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "18px",
                    cursor: "pointer",
                    backgroundColor: "white"
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={formData.stock}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    textAlign: "center",
                    fontWeight: "600"
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleStockChange(1)}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "18px",
                    cursor: "pointer",
                    backgroundColor: "white"
                  }}
                >
                  +
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value="active">Active</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Tags</h2>

              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input
                  type="text"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#8B4513",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
                >
                  Add
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#f5e6d3",
                      color: "#8B4513",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Franchise Availability */}
            <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>Franchise Availability</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {mockFranchises.filter(f => f.is_active).map((franchise) => (
                  <label
                    key={franchise.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: franchiseAvailability.includes(franchise.id) ? "#fff3e0" : "white"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={franchiseAvailability.includes(franchise.id)}
                      onChange={() => toggleFranchise(franchise.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                        {franchise.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6c757d" }}>
                        {franchise.code}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
