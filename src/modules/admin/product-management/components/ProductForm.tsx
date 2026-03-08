import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle, Package } from "lucide-react";
import { useCreateProduct } from "./hooks/useCreateProduct";
import type { ProductCreatePayload } from "../../../../types/product.types";
import { useAssignProductFranchise } from "../hooks/useAssignProductFranchise.hook";
import { CKEditorField } from "@/components/ui";
import { SIZE_OPTIONS } from "@/types/product-option.type";

export default function ProductForm() {
  const navigate = useNavigate();
  const { createProduct, isCreating, error } = useCreateProduct();

  const {
    currentStep,
    isSubmitting: isAssigning,
    error: assignError,
    franchises,
    isFranchisesLoading,
    handleAssignFranchise,
    goToStep2,
  } = useAssignProductFranchise(() => {
    navigate("/admin/products");
  });

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

  // ──────── Step 2 fields ────────
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [priceBase, setPriceBase] = useState<number>(0);

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

    // Call API — on success, chuyển sang Step 2
    await createProduct(formData, (newProduct) => {
      goToStep2(newProduct.id);
    });
  };

  // ──────── Step 2 submit ────────
  const isStep2Valid =
    selectedFranchiseId.trim() !== "" &&
    selectedSize.trim() !== "" &&
    priceBase > 0;

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleAssignFranchise({
        franchise_id: selectedFranchiseId,
        size: selectedSize,
        price_base: priceBase,
      });
    } catch {
      // Error handled in hook
    }
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
    <div className="w-full flex flex-col">
      <main className="flex flex-col flex-1">
        {/* ═══════════ Page Header with Step Indicator ═══════════ */}
        <header className="w-full px-8 py-6 flex flex-col gap-6 shrink-0 z-10 bg-white border-b border-slate-200">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="/admin/products">
                Products
              </a>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-slate-900 font-medium">
                {currentStep === 1 ? "Create Product" : "Assign Franchise"}
              </span>
            </nav>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                {currentStep === 1 ? "Create New Product" : "Assign Franchise"}
              </h2>
              <p className="text-slate-500">
                {currentStep === 1
                  ? "Step 1 of 2 — Enter product information"
                  : "Step 2 of 2 — Select franchise, size and price"}
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-0">
            {/* Step 1 dot */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 1
                    ? "bg-primary text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {currentStep > 1 ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  "1"
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 1 ? "text-gray-800" : "text-green-600"
                }`}
              >
                Create Product
              </span>
            </div>

            {/* Connector */}
            <div
              className={`flex-1 h-0.5 mx-3 rounded transition-colors ${
                currentStep > 1 ? "bg-green-500" : "bg-gray-200"
              }`}
            />

            {/* Step 2 dot */}
            <div className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep === 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 2 ? "text-gray-800" : "text-gray-400"
                }`}
              >
                Assign Franchise
              </span>
            </div>
          </div>
        </header>

        {/* ═══════════ Content Area ═══════════ */}
        <div className="px-8 pb-8 flex-1">
          {/* ───── Step 1: Create Product ───── */}
          {currentStep === 1 && (
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

                    {/* Content */}
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                        Content <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <CKEditorField
                        value={formData.content}
                        onChange={(data) => {
                          setFormData(prev => ({ ...prev, content: data }));
                          if (formErrors.content) {
                            setFormErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.content;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="Enter product content here..."
                        hasError={!!formErrors.content}
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

              {/* Step 1 Footer */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      Creating...
                    </>
                  ) : (
                    <>
                      Next
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ───── Step 2: Assign Franchise ───── */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              {/* Error Banner */}
              {assignError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5 flex-shrink-0">
                    error
                  </span>
                  <p className="text-sm text-red-700">{assignError}</p>
                </div>
              )}

              <form onSubmit={handleStep2Submit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="space-y-5">
                  {/* Success banner from Step 1 */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-[18px]">
                      check_circle
                    </span>
                    <p className="text-sm text-green-700 font-medium">
                      Product created successfully! Now assign a franchise.
                    </p>
                  </div>

                  {/* Franchise dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Franchise <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        storefront
                      </span>
                      <select
                        value={selectedFranchiseId}
                        onChange={(e) => setSelectedFranchiseId(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                        required
                      >
                        <option value="">
                          {isFranchisesLoading ? "Loading franchises..." : "— Select a franchise —"}
                        </option>
                        {franchises.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.name} ({f.code})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Size dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        straighten
                      </span>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full h-10 pl-9 pr-8 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                        required
                      >
                        <option value="">— Select a size —</option>
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.label} ({s.code})
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Price Base */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Price Base (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        payments
                      </span>
                      <input
                        type="number"
                        value={priceBase || ""}
                        onChange={(e) => setPriceBase(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 35000"
                        step="1000"
                        min="0"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm shadow-sm"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep2Valid || isAssigning}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save & Finish
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}