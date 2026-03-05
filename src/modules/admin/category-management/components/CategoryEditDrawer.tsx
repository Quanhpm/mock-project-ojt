import { useState, useEffect } from "react";
import { X, Info, Settings, Save } from "lucide-react";
import { useGetCategory } from "./hooks/useGetCategory";
import { useUpdateCategory } from "./hooks/useUpdateCategory";
import { useToggleStatus } from "./hooks/useToggleStatus";

interface CategoryEditDrawerProps {
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryEditDrawer({
  categoryId,
  isOpen,
  onClose,
  onSuccess,
}: CategoryEditDrawerProps) {
  const { category, isLoading } = useGetCategory(categoryId);
  const { updateDisplayOrder, isUpdating } = useUpdateCategory();
  const { toggleStatus, isToggling } = useToggleStatus();

  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (category) {
      setDisplayOrder(category.display_order);
      setIsActive(category.is_active);
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;

    try {
      // Update display order
      if (displayOrder !== category.display_order) {
        await updateDisplayOrder(category.id, { display_order: displayOrder });
      }

      // Update status
      if (isActive !== category.is_active) {
        await toggleStatus(category.id, category.is_active);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error already handled by hooks
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-slate-200">
        {/* Drawer Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Edit Category</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update category display order and status.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading...</p>
            </div>
          ) : !category ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">Category not found</p>
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Info className="text-[#8B5A2B] text-xl" size={20} />
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Category Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={category.category_name}
                      disabled
                      className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 text-sm cursor-not-allowed"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Category cannot be changed after creation.
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Franchise
                    </label>
                    <input
                      type="text"
                      value={category.franchise_name}
                      disabled
                      className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 text-sm cursor-not-allowed"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Franchise assignment is fixed.
                    </span>
                  </div>
                </div>
              </section>

              {/* Settings */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Settings className="text-[#8B5A2B] text-xl" size={20} />
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    Settings & Display
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                      Display Order
                    </span>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      min="1"
                      className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-colors"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">
                      Lower numbers appear first.
                    </span>
                  </label>
                  <div className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                      Status
                    </span>
                    <div className="h-11 flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B5A2B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5A2B]"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Category Assignment</p>
                    <p className="text-blue-700">
                      This category is assigned to <strong>{category.franchise_name}</strong>.
                      You can adjust the display order and status, but cannot change the category or franchise.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex items-center justify-end gap-3 mt-auto">
          <button
            onClick={onClose}
            disabled={isUpdating || isToggling}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating || isToggling || !category}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#8B5A2B] border border-transparent rounded-lg hover:bg-[#8B5A2B]/90 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isUpdating || isToggling ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
