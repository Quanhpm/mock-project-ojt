import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import {
  searchProductFranchises,
  type ProductFranchiseItem,
} from "@/apis/endpoints/product-franchise.api";
import { inventoryApi } from "@/apis/endpoints/inventory.api";
import { productApi } from "@/apis/endpoints/product.api";
import {
  inventoryCreateDefaultValues,
  inventoryCreateFormSchema,
  type InventoryCreateFormInput,
  type InventoryCreateFormValues,
} from "./inventory-create.validation";

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${hasError ? "#dc2626" : "#e0e0e0"}`,
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: hasError ? "#fef2f2" : "white",
});

export default function InventoryForm() {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [productFranchises, setProductFranchises] = useState<ProductFranchiseItem[]>([]);
  const [productNamesById, setProductNamesById] = useState<Record<string, string>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const productFetchRequestRef = useRef(0);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<InventoryCreateFormInput, undefined, InventoryCreateFormValues>({
    defaultValues: inventoryCreateDefaultValues,
    resolver: zodResolver(inventoryCreateFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const selectedFranchiseId = useWatch({ control, name: "franchiseId" });
  const selectedProductFranchiseId = useWatch({
    control,
    name: "productFranchiseId",
  });

  const selectedProductFranchise = useMemo(
    () =>
      productFranchises.find((product) => product.id === selectedProductFranchiseId) ??
      null,
    [productFranchises, selectedProductFranchiseId],
  );

  useEffect(() => {
    const loadFranchises = async () => {
      try {
        const response = await franchiseApi.searchFranchises({
          searchCondition: { is_deleted: false, is_active: true },
          pageInfo: { pageNum: 1, pageSize: 100 },
        });
        setFranchises(response?.data ?? []);
      } catch {
        showError("Load Failed", "Unable to load franchises. Please try again.");
      }
    };

    void loadFranchises();
    window.setTimeout(() => {
      setFocus("franchiseId");
    }, 0);
  }, [setFocus, showError]);

  useEffect(() => {
    const requestId = productFetchRequestRef.current + 1;
    productFetchRequestRef.current = requestId;

    setValue("productFranchiseId", "");
    clearErrors("productFranchiseId");
    setProductFranchises([]);
    setProductNamesById({});

    if (!selectedFranchiseId) {
      setIsLoadingProducts(false);
      return;
    }

    setIsLoadingProducts(true);

    const loadProducts = async () => {
      try {
        const response = await searchProductFranchises({
          searchCondition: {
            franchise_id: selectedFranchiseId,
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 100 },
        });

        const items = response?.data ?? [];
        if (productFetchRequestRef.current !== requestId) {
          return;
        }

        setProductFranchises(items);

        const uniqueProductIds = Array.from(
          new Set(items.map((item) => item.product_id).filter(Boolean)),
        );

        if (uniqueProductIds.length === 0) {
          setProductNamesById({});
          return;
        }

        const productResponses = await Promise.all(
          uniqueProductIds.map(async (productId) => {
            try {
              const product = await productApi.getProductById(productId);
              return [productId, product?.name ?? "Unknown product"] as const;
            } catch {
              return [productId, "Unknown product"] as const;
            }
          }),
        );

        if (productFetchRequestRef.current !== requestId) {
          return;
        }

        setProductNamesById(Object.fromEntries(productResponses));
      } catch {
        if (productFetchRequestRef.current === requestId) {
          showError("Load Failed", "Unable to load products. Please try again.");
        }
      } finally {
        if (productFetchRequestRef.current === requestId) {
          setIsLoadingProducts(false);
        }
      }
    };

    void loadProducts();
  }, [clearErrors, selectedFranchiseId, setValue, showError]);

  const handleClose = () => {
    if (isSubmitting) return;
    setSubmitError("");
    reset(inventoryCreateDefaultValues);
    setProductFranchises([]);
    setProductNamesById({});
    navigate("/admin/inventory");
  };

  const handleValidSubmit = async (values: InventoryCreateFormValues) => {
    setSubmitError("");

    try {
      await inventoryApi.createInventory({
        product_franchise_id: values.productFranchiseId,
        quantity: values.quantity,
        alert_threshold: values.alertThreshold,
      });

      showSuccess("Created", "The inventory item has been created successfully.");
      reset(inventoryCreateDefaultValues);
      setProductFranchises([]);
      setProductNamesById({});
      navigate("/admin/inventory");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create inventory right now.";
      setSubmitError(message);
    }
  };

  const handleInvalidSubmit = () => {
    setSubmitError("");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Inventory &rsaquo; <span style={{ color: "#212529" }}>Create Inventory</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/inventory")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6c757d",
              fontSize: "14px",
            }}
          >
            <ArrowLeft size={18} />
            Back to Inventory
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 8px" }}>
            Create Inventory
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            Select a franchise, choose a product, and enter the starting stock values.
          </p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
      >
        <div style={{ maxWidth: "760px", display: "grid", gap: "24px" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <Package size={18} color="#8B4513" />
              <h2 style={{ fontSize: "17px", fontWeight: "600", margin: 0 }}>
                Franchise and Product
              </h2>
            </div>

            <div style={{ display: "grid", gap: "20px" }}>
              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Franchise <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  {...register("franchiseId")}
                  style={fieldStyle(!!errors.franchiseId)}
                  disabled={isSubmitting}
                >
                  <option value="">-- Select franchise --</option>
                  {franchises.map((franchise) => (
                    <option key={franchise.id} value={franchise.id}>
                      {franchise.name} ({franchise.code})
                    </option>
                  ))}
                </select>
                {errors.franchiseId && (
                  <p className="text-sm text-red-600" style={{ margin: 0 }}>
                    {errors.franchiseId.message}
                  </p>
                )}
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Product <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <select
                  {...register("productFranchiseId")}
                  style={fieldStyle(!!errors.productFranchiseId)}
                  disabled={!selectedFranchiseId || isLoadingProducts || isSubmitting}
                >
                  <option value="">
                    {!selectedFranchiseId
                      ? "-- Select franchise first --"
                      : isLoadingProducts
                        ? "Loading products..."
                        : productFranchises.length === 0
                          ? "No products available"
                          : "-- Select product --"}
                  </option>
                  {productFranchises.map((product) => (
                    <option key={product.id} value={product.id}>
                      {productNamesById[product.product_id] ?? "Loading product name..."}
                    </option>
                  ))}
                </select>
                {!selectedFranchiseId && (
                  <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
                    Select a franchise to load the available products.
                  </p>
                )}
                {errors.productFranchiseId && (
                  <p className="text-sm text-red-600" style={{ margin: 0 }}>
                    {errors.productFranchiseId.message}
                  </p>
                )}
              </div>
            </div>

            {selectedProductFranchise && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 16px",
                  backgroundColor: "#fff8f2",
                  border: "1px solid #f5cba7",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#6d3610",
                  display: "grid",
                  gap: "4px",
                }}
              >
                <p style={{ margin: 0, fontWeight: "600" }}>Selected product</p>
                <p style={{ margin: 0 }}>
                  Product name:{" "}
                  <strong>
                    {productNamesById[selectedProductFranchise.product_id] ?? "Unknown product"}
                  </strong>
                </p>
                <p style={{ margin: 0 }}>
                  Product ID: <strong>{selectedProductFranchise.product_id}</strong>
                </p>
                <p style={{ margin: 0 }}>
                  Size: <strong>{selectedProductFranchise.size}</strong>
                </p>
                <p style={{ margin: 0 }}>
                  Base price:{" "}
                  <strong>
                    {selectedProductFranchise.price_base.toLocaleString("en-US", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <Package size={18} color="#8B4513" />
              <h2 style={{ fontSize: "17px", fontWeight: "600", margin: 0 }}>
                Stock Settings
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Quantity <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...register("quantity")}
                  style={fieldStyle(!!errors.quantity)}
                  disabled={isSubmitting}
                />
                <p
                  className={errors.quantity ? "text-sm text-red-600" : ""}
                  style={{ margin: 0, fontSize: "12px", color: errors.quantity ? "#dc2626" : "#6c757d", minHeight: "18px" }}
                >
                  {errors.quantity?.message ?? "Enter the opening quantity for this inventory item."}
                </p>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                  Alert Threshold <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...register("alertThreshold")}
                  style={fieldStyle(!!errors.alertThreshold)}
                  disabled={isSubmitting}
                />
                <p
                  className={errors.alertThreshold ? "text-sm text-red-600" : ""}
                  style={{ margin: 0, fontSize: "12px", color: errors.alertThreshold ? "#dc2626" : "#6c757d", minHeight: "18px" }}
                >
                  {errors.alertThreshold?.message ?? "Show the low-stock state when quantity is at or below this number."}
                </p>
              </div>
            </div>
          </div>

          {submitError && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
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
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingProducts}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 28px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isSubmitting || isLoadingProducts ? "not-allowed" : "pointer",
                backgroundColor: "#8B4513",
                color: "white",
                opacity: isSubmitting || isLoadingProducts ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : null}
              {isSubmitting ? "Saving..." : "Save Inventory"}
            </button>
          </div>
        </div>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
