import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import {
  searchProductFranchises,
  type ProductFranchiseItem,
} from "@/apis/endpoints/product-franchise.api";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import { productApi } from "@/apis/endpoints/product.api";

export default function InventoryForm() {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  // Step visibility
  const [formVisible, setFormVisible] = useState(false);

  // Franchise list & selection
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");

  // Product franchise list & selection
  const [productFranchises, setProductFranchises] = useState<ProductFranchiseItem[]>([]);
  const [productNamesById, setProductNamesById] = useState<Record<string, string>>({});
  const [selectedProductFranchiseId, setSelectedProductFranchiseId] = useState("");

  // Form fields
  const [quantity, setQuantity] = useState<number>(0);
  const [alertThreshold, setAlertThreshold] = useState<number>(10);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Click "Create" → fetch franchises → reveal form
  const handleClickCreate = async () => {
    try {
      const res = await franchiseApi.searchFranchises({
        searchCondition: { is_deleted: false, is_active: true },
        pageInfo: { pageNum: 1, pageSize: 100 },
      });
      setFranchises(res?.data ?? []);
      setFormVisible(true);
    } catch {
      alert("Không thể tải danh sách Franchise. Vui lòng thử lại.");
    }
  };

  // Step 2: Franchise onChange → fetch product_franchises for that franchise
  const handleFranchiseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const franchiseId = e.target.value;
    setSelectedFranchiseId(franchiseId);
    setSelectedProductFranchiseId("");
    setProductFranchises([]);
    setProductNamesById({});

    if (!franchiseId) return;

    setIsLoading(true);
    try {
      const res = await searchProductFranchises({
        searchCondition: { franchise_id: franchiseId, is_deleted: false },
        pageInfo: { pageNum: 1, pageSize: 100 },
      });
      const productFranchiseItems = res?.data ?? [];
      setProductFranchises(productFranchiseItems);

      const uniqueProductIds = Array.from(
        new Set(productFranchiseItems.map((item) => item.product_id).filter(Boolean)),
      );

      if (uniqueProductIds.length > 0) {
        const productResponses = await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const product = await productApi.getProductById(productId);
              return [productId, product?.name ?? "Sản phẩm không xác định"] as const;
            } catch {
              return [productId, "Sản phẩm không xác định"] as const;
            }
          }),
        );

        setProductNamesById(Object.fromEntries(productResponses));
      }
    } catch {
      alert("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Submit → createInventory API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductFranchiseId) {
      alert("Vui lòng chọn sản phẩm.");
      return;
    }
    if (quantity <= 0) {
      alert("Số lượng phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryApi.createInventory({
        product_franchise_id: selectedProductFranchiseId,
        quantity,
        alert_threshold: alertThreshold,
      });
      showSuccess("Tạo Inventory thành công!", "Inventory item đã được tạo mới.");
      handleReset();
      navigate("/admin/inventory");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Vui lòng thử lại.";
      console.error("[createInventory] FAILED:", err);
      showError("Tạo Inventory thất bại", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFranchiseId("");
    setSelectedProductFranchiseId("");
    setProductFranchises([]);
    setQuantity(0);
    setAlertThreshold(10);
    setFormVisible(false);
    navigate("/admin/inventory");
  };

  const selectedPF = productFranchises.find(pf => pf.id === selectedProductFranchiseId);

  // Auto-fetch franchises on mount — no confirmation step needed
  useEffect(() => {
    handleClickCreate();
  }, []);

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
            Chọn Franchise và sản phẩm để tạo mới Inventory.
          </p>
        </div>
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
            color: "#374151",
          }}
        >
          ← Quay lại
        </button>
      </div>

      {/* ── FORM ── */}
      {formVisible && (
        <>
          <form onSubmit={handleSubmit}>
            <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Card: Franchise & Product Selection */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "28px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                  <Package size={18} color="#8B4513" />
                  <h2 style={{ fontSize: "17px", fontWeight: "600", margin: 0 }}>
                    Chọn Franchise &amp; Sản phẩm
                  </h2>
                </div>

                {/* Franchise dropdown */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Franchise <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <select
                    value={selectedFranchiseId}
                    onChange={handleFranchiseChange}
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
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Franchise --</option>
                    {franchises.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product (product_franchise) dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Sản phẩm <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <select
                    value={selectedProductFranchiseId}
                    onChange={(e) => setSelectedProductFranchiseId(e.target.value)}
                    required
                    disabled={!selectedFranchiseId || isLoading}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                      backgroundColor: selectedFranchiseId ? "white" : "#f8f9fa",
                      cursor: selectedFranchiseId && !isLoading ? "pointer" : "not-allowed",
                      color: selectedFranchiseId ? "#212529" : "#adb5bd",
                    }}
                  >
                    <option value="">
                      {!selectedFranchiseId
                        ? "-- Hãy chọn Franchise trước --"
                        : isLoading
                        ? "Đang tải danh sách sản phẩm..."
                        : productFranchises.length === 0
                        ? "Không có sản phẩm nào"
                        : "-- Chọn sản phẩm --"}
                    </option>
                    {productFranchises.map((pf) => (
                      <option key={pf.id} value={pf.id}>
                        {productNamesById[pf.product_id] ?? "Đang tải tên sản phẩm..."}
                      </option>
                    ))}
                  </select>
                  {!selectedFranchiseId && (
                    <p style={{ fontSize: "12px", color: "#6c757d", margin: "6px 0 0 0" }}>
                      Vui lòng chọn Franchise để hiển thị danh sách sản phẩm.
                    </p>
                  )}
                </div>

                {/* Selected product summary */}
                {selectedPF && (
                  <div style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    backgroundColor: "#fff8f2",
                    border: "1px solid #f5cba7",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#6d3610",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>Sản phẩm đã chọn</p>
                    <p style={{ margin: 0 }}>
                      Tên sản phẩm: <strong>{productNamesById[selectedPF.product_id] ?? "Sản phẩm không xác định"}</strong>
                    </p>
                    <p style={{ margin: 0 }}>Product ID: <strong>{selectedPF.product_id}</strong></p>
                    <p style={{ margin: 0 }}>Size: <strong>{selectedPF.size}</strong></p>
                    <p style={{ margin: 0 }}>Giá cơ bản: <strong>{selectedPF.price_base.toLocaleString("vi-VN")}₫</strong></p>
                  </div>
                )}
              </div>

              {/* Card: Quantity */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "28px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <Package size={18} color="#8B4513" />
                  <h2 style={{ fontSize: "17px", fontWeight: "600", margin: 0 }}>Số lượng nhập kho</h2>
                </div>

                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                  Quantity <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(0, q - 10))}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "500",
                      flexShrink: 0,
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                    min="1"
                    required
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "15px",
                      textAlign: "center",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 10)}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "500",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                  Nhập số lượng sản phẩm cần nhập vào kho (tối thiểu 1).
                </p>

                {/* Alert Threshold */}
                <div style={{ marginTop: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Alert Threshold <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setAlertThreshold(t => Math.max(0, t - 1))}
                      style={{ width: "40px", height: "40px", border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "20px", fontWeight: "500", flexShrink: 0 }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(Math.max(0, Number(e.target.value)))}
                      min="0"
                      required
                      style={{ flex: 1, padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "15px", textAlign: "center", outline: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => setAlertThreshold(t => t + 1)}
                      style={{ width: "40px", height: "40px", border: "1px solid #e0e0e0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "20px", fontWeight: "500", flexShrink: 0 }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#6c757d" }}>
                    Ngưỡng cảnh báo tồn kho thấp (khi số lượng ≤ ngưỡng này sẽ hiện "Low Stock").
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  style={{
                    padding: "11px 24px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    backgroundColor: "white",
                    color: "#374151",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 28px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
                    backgroundColor: "#8B4513",
                    color: "white",
                    opacity: isSubmitting || isLoading ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  ) : null}
                  {isSubmitting ? "Đang lưu..." : "Lưu Inventory"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}

      {/* Spinner keyframe (injected once) */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
