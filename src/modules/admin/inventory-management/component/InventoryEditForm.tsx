import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { inventoryApi, type InventoryItem } from "@/apis/endpoints/inventory.api";

const editInventorySchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  alert_threshold: z.coerce.number().int().min(0, "Alert threshold cannot be negative"),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters"),
});

type EditInventoryFormValues = z.infer<typeof editInventorySchema>;

export default function InventoryEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditInventoryFormValues>({
    resolver: zodResolver(editInventorySchema),
    defaultValues: {
      quantity: 0,
      alert_threshold: 0,
      reason: "Manual inventory update",
    },
  });

  useEffect(() => {
    const loadInventory = async () => {
      if (!id) {
        showError("Invalid inventory", "Inventory id is missing.");
        navigate("/admin/inventory");
        return;
      }

      setIsLoading(true);
      try {
        const response = await inventoryApi.getInventoryById(id);
        if (!response) {
          showError("Not found", "Inventory item was not found.");
          navigate("/admin/inventory");
          return;
        }

        setInventory(response);
        form.reset({
          quantity: response.quantity,
          alert_threshold: response.alert_threshold,
          reason: "Manual inventory update",
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load inventory item.";
        showError("Load failed", message);
        navigate("/admin/inventory");
      } finally {
        setIsLoading(false);
      }
    };

    void loadInventory();
  }, [form, id, navigate, showError]);

  const stockState = useMemo(() => {
    const quantity = form.watch("quantity");
    const threshold = form.watch("alert_threshold");

    if (quantity <= 0) {
      return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
    }
    if (quantity <= threshold) {
      return { label: "Low Stock", className: "bg-amber-100 text-amber-700" };
    }
    return { label: "In Stock", className: "bg-emerald-100 text-emerald-700" };
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!inventory) return;

    setIsSubmitting(true);
    try {
      await inventoryApi.bulkAdjustInventory({
        items: [
          {
            product_franchise_id: inventory.product_franchise_id,
            change: values.quantity - inventory.quantity,
            alert_threshold: values.alert_threshold,
            reason: values.reason,
          },
        ],
      });

      showSuccess("Inventory updated", "Inventory item was updated successfully.");
      navigate("/admin/inventory");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update inventory item.";
      showError("Update failed", message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] py-10 px-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-slate-600">
          <Loader2 size={18} className="animate-spin" />
          Loading inventory item...
        </div>
      </div>
    );
  }

  if (!inventory) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </button>

        <div className="mb-6">
          <p className="text-sm text-slate-500">Inventory / Edit Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Edit Inventory Item</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update quantity and alert threshold for this inventory record.
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#8B4513]" />
            <h2 className="text-lg font-semibold text-slate-800">Inventory Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">Inventory ID</p>
              <p className="text-slate-900 font-medium mt-1">{inventory.id}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-slate-500">Franchise</p>
              <p className="text-slate-900 font-medium mt-1">{inventory.franchise_name ?? inventory.franchise_id}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <p className="text-slate-500">Product</p>
              <p className="text-slate-900 font-medium mt-1">{inventory.product_name ?? inventory.product_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                min={0}
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

          <div>
            <label className="block text-sm font-medium text-slate-700">Reason</label>
            <textarea
              rows={3}
              {...form.register("reason")}
              disabled={isSubmitting}
              className="mt-2 w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm"
              placeholder="Provide a reason for this inventory adjustment"
            />
            <p className="text-xs text-red-500 mt-1">{form.formState.errors.reason?.message}</p>
          </div>

          <div className="rounded-lg border border-[#f0dcc8] bg-[#fff8f2] p-4 text-sm text-[#6d3610]">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Stock Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stockState.className}`}>
                {stockState.label}
              </span>
            </div>
            <div className="mt-2 text-xs flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5" />
              <span>
                Current quantity is {inventory.quantity}. Saving will apply a delta of {form.watch("quantity") - inventory.quantity}.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#7F5539] text-white text-sm font-medium hover:bg-[#9C6644] disabled:opacity-70 inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
