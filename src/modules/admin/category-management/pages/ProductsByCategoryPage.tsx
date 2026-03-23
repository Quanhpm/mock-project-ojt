import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Package, Edit, Trash2, RotateCcw, AlertTriangle, X } from "lucide-react";
import { searchProductCategoryFranchises, type ProductCategoryFranchise } from "../api/product-category-franchise.api";
import { getCategoryFranchiseById } from "../api/category-franchise.api";
import { useProductCategoryActions } from "../hooks/useProductCategoryActions.hook";
import EditProductCategoryDrawer from "../components/EditProductCategoryDrawer";
import { getFranchiseId, useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { ROUTER_URL } from "@/routes/router.const";

interface DeleteModal {
  isOpen: boolean;
  productId: string;
  productName: string;
}

export default function ProductsByCategoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ categoryId: string }>();
  const franchiseId = useAdminAuthStore((state) => getFranchiseId(state));

  const state = (location.state as {
    categoryFranchiseId?: string;
    categoryId?: string;
    categoryName?: string;
    franchiseId?: string;
  } | null) ?? null;

  const [categoryContext, setCategoryContext] = useState({
    categoryFranchiseId: state?.categoryFranchiseId || params.categoryId || "",
    categoryId: state?.categoryId || "",
    categoryName: state?.categoryName || "",
    franchiseId: state?.franchiseId || franchiseId || "",
  });
  const [isLoadingCategoryContext, setIsLoadingCategoryContext] = useState(
    Boolean(params.categoryId && (!state?.categoryId || !state?.categoryName))
  );

  const [products, setProducts] = useState<ProductCategoryFranchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ isOpen: false, productId: "", productName: "" });
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCategoryFranchise | null>(null);

  const { deleteProduct, toggleStatus, restoreProduct, isDeleting, isToggling, isRestoring } = useProductCategoryActions(() => {
    fetchProducts();
  });

  useEffect(() => {
    const routeCategoryFranchiseId = params.categoryId || "";

    setCategoryContext((prev) => ({
      categoryFranchiseId: state?.categoryFranchiseId || routeCategoryFranchiseId,
      categoryId: state?.categoryId || prev.categoryId,
      categoryName: state?.categoryName || prev.categoryName,
      franchiseId: state?.franchiseId || prev.franchiseId || franchiseId || "",
    }));

    if (!routeCategoryFranchiseId || (state?.categoryId && state?.categoryName)) {
      setIsLoadingCategoryContext(false);
      return;
    }

    const loadCategoryContext = async () => {
      try {
        setIsLoadingCategoryContext(true);
        const categoryFranchise = await getCategoryFranchiseById(routeCategoryFranchiseId);
        setCategoryContext({
          categoryFranchiseId: categoryFranchise.id,
          categoryId: categoryFranchise.category_id,
          categoryName: categoryFranchise.category_name,
          franchiseId: categoryFranchise.franchise_id,
        });
      } catch (error) {
        console.error("Failed to load category context:", error);
      } finally {
        setIsLoadingCategoryContext(false);
      }
    };

    void loadCategoryContext();
  }, [params.categoryId, state?.categoryFranchiseId, state?.categoryId, state?.categoryName]);

  const fetchProducts = async () => {
    const effectiveFranchiseId = categoryContext.franchiseId || franchiseId;

    if (!categoryContext.categoryId || !effectiveFranchiseId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await searchProductCategoryFranchises({
        searchCondition: {
          franchise_id: effectiveFranchiseId,
          category_id: categoryContext.categoryId,
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
    void fetchProducts();
  }, [categoryContext.categoryFranchiseId, categoryContext.categoryId, categoryContext.franchiseId, franchiseId, showDeleted]);

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

  const handleEditClick = (product: ProductCategoryFranchise) => {
    setSelectedProduct(product);
    setIsEditDrawerOpen(true);
  };

  const filteredProducts = products.filter((item) =>
    item.product_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!isLoading && !isLoadingCategoryContext && !categoryContext.categoryFranchiseId) {
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
                {categoryContext.categoryName || "Category"}
              </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex flex-col">
                <h1 className="text-slate-900 text-3xl font-bold">
                  {categoryContext.categoryName} Products
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Manage all products within the {categoryContext.categoryName} category
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
                      placeholder={`Search products in ${categoryContext.categoryName}...`}
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
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading || isLoadingCategoryContext ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
                  >
                    <div className="h-64 w-full bg-slate-100 animate-pulse" />
                    <div className="p-6 flex flex-col gap-3">
                      <div className="h-5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded-md w-1/2 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/3 animate-pulse" />
                      <div className="mt-4 flex gap-3">
                        <div className="flex-1 h-10 bg-slate-100 rounded-xl animate-pulse" />
                        <div className="w-11 h-10 bg-slate-100 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
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
                          <label className="absolute top-4 right-4 inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_active}
                              onChange={() => handleToggleStatus(item.id, item.is_active)}
                              disabled={isToggling}
                              className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B5A2B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5A2B]"></div>
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
                                  onClick={() => handleEditClick(item)}
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
        <div
          onClick={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "480px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    backgroundColor: "#ffebee",
                    padding: "10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertTriangle size={24} color="#f44336" />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#212529",
                  }}
                >
                  Remove Product
                </h2>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  color: "#6c757d",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  margin: 0,
                  marginBottom: "16px",
                  fontSize: "15px",
                  color: "#495057",
                  lineHeight: "1.6",
                }}
              >
                Are you sure you want to remove this product from the category? This action can be undone later.
              </p>
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      textTransform: "uppercase" as const,
                      fontWeight: "600",
                    }}
                  >
                    Product ID
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#212529",
                      fontWeight: "500",
                    }}
                  >
                    #{deleteModal.productId}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      textTransform: "uppercase" as const,
                      fontWeight: "600",
                    }}
                  >
                    Product Name
                  </span>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#212529",
                      fontWeight: "500",
                    }}
                  >
                    {deleteModal.productName}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  backgroundColor: "white",
                  color: "#374151",
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  backgroundColor: isDeleting ? "#fca5a5" : "#f44336",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isDeleting ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid white",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
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
      {/* Edit Product Category Drawer */}
      <EditProductCategoryDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={(itemId, newDisplayOrder) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === itemId ? { ...p, display_order: newDisplayOrder } : p))
          );
          setIsEditDrawerOpen(false);
          setSelectedProduct(null);
          void fetchProducts();
        }}
        productCategory={selectedProduct}
      />
    </div>
  );
}
