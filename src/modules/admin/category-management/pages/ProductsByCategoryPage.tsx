import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Package, Edit, Trash2, Plus, RotateCcw } from "lucide-react";
import { searchProductCategoryFranchises, type ProductCategoryFranchise } from "../api/product-category-franchise.api";
import { useProductCategoryActions } from "../hooks/useProductCategoryActions.hook";
import { ROUTER_URL } from "@/routes/router.const";

interface DeleteModal {
  isOpen: boolean;
  productId: string;
  productName: string;
}

export default function ProductsByCategoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as {
    categoryFranchiseId: string;
    categoryId: string;
    categoryName: string;
    franchiseId: string;
  };

  const [products, setProducts] = useState<ProductCategoryFranchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ isOpen: false, productId: "", productName: "" });

  const { deleteProduct, toggleStatus, restoreProduct, isDeleting, isToggling, isRestoring } = useProductCategoryActions(() => {
    fetchProducts();
  });

  const fetchProducts = async () => {
    if (!state?.categoryId || !state?.franchiseId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await searchProductCategoryFranchises({
        searchCondition: {
          franchise_id: state.franchiseId,
          category_id: state.categoryId,
          product_id: "",
          is_active: "",
          is_deleted: showDeleted,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 30,
        },
      });

      setProducts(response.data);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [state?.categoryFranchiseId, showDeleted]);

  const handleBack = () => {
    navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.CATEGORY}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, productId: id, productName: name });
  };

  const handleConfirmDelete = async () => {
    await deleteProduct(deleteModal.productId, deleteModal.productName);
    setDeleteModal({ isOpen: false, productId: "", productName: "" });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatus(id, currentStatus);
  };

  const handleRestore = async (id: string, name: string) => {
    await restoreProduct(id, name);
  };

  const filteredProducts = products.filter((item) =>
    item.product_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!state?.categoryFranchiseId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Category information not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#6d4622] transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 md:px-10 lg:px-40 py-10">
        <div className="max-w-[1200px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <main className="p-10">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleBack}
                className="text-slate-500 hover:text-[#8B5A2B] transition-colors text-sm font-medium"
              >
                Categories
              </button>
              <span className="text-slate-400 text-sm font-medium">/</span>
              <span className="text-slate-900 text-sm font-semibold">
                {state.categoryName || "Category"}
              </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex flex-col">
                <h1 className="text-slate-900 text-3xl font-bold">
                  {state.categoryName} Products
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Manage all products within the {state.categoryName} category
                </p>
              </div>
              <button
                onClick={handleBack}
                className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
              >
                <ArrowLeft size={20} />
                <span>Back to Categories</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <label className="flex w-full items-center rounded-lg bg-slate-50 border border-slate-100 px-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                      className="w-full bg-transparent border-none text-slate-900 focus:ring-0 placeholder:text-slate-400 px-2 py-2.5 text-sm outline-none"
                      placeholder={`Search products in ${state.categoryName}...`}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </label>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleted(!showDeleted)}
                    className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                      showDeleted
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Trash2 size={16} />
                    <span>{showDeleted ? "Hide Deleted" : "Show Deleted"}</span>
                  </button>
                  <button
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#8B5A2B] text-white px-6 hover:bg-[#6d4622] transition-colors shadow-sm font-semibold text-sm ml-2"
                    onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.PRODUCT}/create`)}
                  >
                    <Plus size={18} />
                    Add Product
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No products found
                </h3>
                <p className="text-slate-500 mb-6">
                  {keyword
                    ? "Try adjusting your search terms"
                    : "There are no products in this category yet"}
                </p>
                <button
                  className="px-6 py-2.5 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#6d4622] transition-colors font-medium"
                  onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.PRODUCT}/create`)}
                >
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
                    >
                      {/* Product Image */}
                      <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                        <div
                          className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${item.is_deleted ? "opacity-50" : ""}`}
                        >
                          <Package className="w-24 h-24 text-slate-300" />
                        </div>
                        {/* Deleted Badge */}
                        {item.is_deleted && (
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-red-100 text-red-700">
                            <Trash2 size={14} />
                            Deleted
                          </div>
                        )}
                        {/* Status Toggle */}
                        {!item.is_deleted && (
                          <label className="absolute top-4 right-4 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_active}
                              onChange={() => handleToggleStatus(item.id, item.is_active)}
                              disabled={isToggling}
                              className="sr-only"
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors ${
                                item.is_active ? "bg-green-500" : "bg-slate-300"
                              } ${isToggling ? "opacity-50" : ""}`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                  item.is_active ? "translate-x-5" : "translate-x-0.5"
                                } mt-0.5`}
                              ></div>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-slate-900 font-bold text-xl flex-1">
                            {item.product_name}
                          </h3>
                          <span className="text-[#8B5A2B] font-bold text-lg ml-2">
                            ₫{item.price_base?.toLocaleString('vi-VN')}
                          </span>
                        </div>
                        
                        <p className="text-slate-500 text-sm mb-2">
                          {item.category_name} • {item.franchise_name}
                        </p>
                        
                        <p className="text-xs text-slate-400 mb-6">
                          Display Order: {item.display_order}
                        </p>

                        <div className="mt-auto">
                          {/* Size Info */}
                          {item.size && (
                            <div className="flex items-center gap-3 mb-6">
                              <span className="text-sm font-medium text-slate-500">Size:</span>
                              <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 border border-slate-100">
                                {item.size}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            {item.is_deleted ? (
                              <button
                                onClick={() => handleRestore(item.id, item.product_name)}
                                disabled={isRestoring}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-green-700 text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                <RotateCcw size={18} />
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/admin/${ROUTER_URL.ADMIN_ROUTER.PRODUCT}/${item.product_id}/edit`)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-700 text-sm font-bold transition-colors"
                                >
                                  <Edit size={18} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item.id, item.product_name)}
                                  disabled={isDeleting}
                                  className="w-11 h-11 flex items-center justify-center bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Remove Product</h3>
                <p className="text-sm text-slate-500">This action can be undone later</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to remove <span className="font-semibold">{deleteModal.productName}</span> from this category?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  "Remove Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
