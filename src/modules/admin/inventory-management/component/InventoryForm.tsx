import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { franchiseApi, type FranchiseItem } from "@/apis/endpoints/franchise.api";
import {
  searchProductFranchises,
  type ProductFranchiseItem,
} from "@/apis/endpoints/product-franchise.api";
import { inventoryApi } from "@/apis/endpoints/inventory.api";

const createInventorySchema = z.object({
  franchise_id: z.string().trim().min(1, "Franchise is required"),
  product_franchise_id: z.string().trim().min(1, "Product is required"),
  quantity: z.coerce.number().int().gt(0, "Quantity must be greater than 0"),
  alert_threshold: z.coerce.number().int().min(0, "Alert threshold cannot be negative"),
});

type CreateInventoryFormValues = z.infer<typeof createInventorySchema>;

export default function InventoryForm() {
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [franchises, setFranchises] = useState<FranchiseItem[]>([]);
  const [productFranchises, setProductFranchises] = useState<ProductFranchiseItem[]>([]);
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      franchise_id: "",
      product_franchise_id: "",
      quantity: 1,
      alert_threshold: 10,
    },
  });

  const selectedFranchiseId = form.watch("franchise_id");

  useEffect(() => {
    const loadFranchises = async () => {
      setIsFranchisesLoading(true);
      try {
        const response = await franchiseApi.searchFranchises({
          searchCondition: { is_deleted: false, is_active: true },
          pageInfo: { pageNum: 1, pageSize: 100 },
        });
        setFranchises(response?.data ?? []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load franchises.";
        showError("Load failed", message);
      } finally {
        setIsFranchisesLoading(false);
      }
    };

    void loadFranchises();
  }, [showError]);

  useEffect(() => {
    const loadProductFranchises = async () => {
      form.setValue("product_franchise_id", "");
      setProductFranchises([]);

      if (!selectedFranchiseId) return;

      setIsProductsLoading(true);
      try {
        const response = await searchProductFranchises({
          searchCondition: { franchise_id: selectedFranchiseId, is_deleted: false },
          pageInfo: { pageNum: 1, pageSize: 100 },
        });
        setProductFranchises(response?.data ?? []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load product list.";
        showError("Load failed", message);
      } finally {
        setIsProductsLoading(false);
      }
    };

    void loadProductFranchises();
  }, [form, selectedFranchiseId, showError]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await inventoryApi.createInventory({
        product_franchise_id: values.product_franchise_id,
        quantity: values.quantity,
        alert_threshold: values.alert_threshold,
      });
      showSuccess("Inventory created", "New inventory item was created successfully.");
      navigate("/admin/inventory");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create inventory.";
      showError("Create failed", message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const selectedProduct = productFranchises.find(
    (item) => item.id === form.watch("product_franchise_id"),
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Inventory / Create Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Create New Inventory Item</h1>
          <p className="text-sm text-slate-500 mt-1">Select franchise and product to create inventory entry.</p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-[#8B4513]" />
            <h2 className="text-lg font-semibold text-slate-800">Inventory Information</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">Franchise</label>
              <select
                {...form.register("franchise_id")}
                disabled={isFranchisesLoading || isSubmitting}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
              >
                <option value="">
                  {isFranchisesLoading ? "Loading franchises..." : "Select franchise"}
                </option>
                {franchises.map((franchise) => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.name} ({franchise.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.franchise_id?.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Product</label>
              <select
                {...form.register("product_franchise_id")}
                disabled={!selectedFranchiseId || isProductsLoading || isSubmitting}
                className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
              >
                <option value="">
                  {!selectedFranchiseId
                    ? "Select franchise first"
                    : isProductsLoading
                    ? "Loading products..."
                    : "Select product"}
                </option>
                {productFranchises.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name ?? item.product_id} | Size: {item.size} | Base price: {item.price_base}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.product_franchise_id?.message}</p>
            </div>

            {selectedProduct && (
              <div className="rounded-lg border border-[#f0dcc8] bg-[#fff8f2] p-4 text-sm text-[#6d3610]">
                <p className="font-semibold mb-1">Selected Product</p>
                <p>Product: {selectedProduct.product_name ?? selectedProduct.product_id}</p>
                <p>Size: {selectedProduct.size}</p>
                <p>Base price: {selectedProduct.price_base}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="number"
                  min={1}
                  {...form.register("quantity")}
                  disabled={isSubmitting}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                />
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.quantity?.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Alert Threshold</label>
                <input
                  type="number"
                  min={0}
                  {...form.register("alert_threshold")}
                  disabled={isSubmitting}
                  className="mt-2 w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
                />
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.alert_threshold?.message}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/inventory")}
              disabled={isSubmitting}
              className="text-sm text-slate-600 hover:text-slate-800 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isProductsLoading || isFranchisesLoading}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] disabled:opacity-70 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}