import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Package, Edit, Trash2, RotateCcw, Plus, AlertTriangle } from "lucide-react";
import { searchProductCategoryFranchises, type ProductCategoryFranchise } from "../api/product-category-franchise.api";
import { getCategoryFranchiseById } from "../api/category-franchise.api";
import { useProductCategoryActions } from "../hooks/useProductCategoryActions.hook";
import EditProductCategoryDrawer from "../components/EditProductCategoryDrawer";
import AddProductToCategoryDrawer from "../components/AddProductToCategoryDrawer";
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
  const [inputKeyword, setInputKeyword] = useState("");
  const [committedKeyword, setCommittedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ isOpen: false, productId: "", productName: "" });
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCategoryFranchise | null>(null);
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);

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
      console.error("Failed to load products:", error);
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

  const handleSearch = () => {
    setCommittedKeyword(inputKeyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilter = () => {
    setInputKeyword("");
    setCommittedKeyword("");
    setStatusFilter("all");
    if (showDeleted) {
      setShowDeleted(false);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesKeyword =
      committedKeyword === "" ||
      item.product_name?.toLowerCase().includes(committedKeyword.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.is_active && !item.is_deleted) ||
      (statusFilter === "inactive" && !item.is_active && !item.is_deleted);
    return matchesKeyword && matchesStatus;
  });

  if (!categoryContext.categoryFranchiseId && !isLoading && !isLoadingCategoryContext) {
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
              <button
                onClick={() => setIsAssignDrawerOpen(true)}
                className="flex items-center justify-center gap-2 rounded-full h-10 px-6 bg-[#8B5A2B] text-white hover:bg-[#6d4622] transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={18} />
                <span>Assign Product</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 min-w-[220px]">
                  <label className="flex w-full items-center rounded-lg bg-slate-50 border border-slate-200 px-3">
                    <Search className="text-slate-400 shrink-0" size={18} />
                    <input
                      className="w-full bg-transparent border-none text-slate-900 focus:ring-0 placeholder:text-slate-400 px-2 py-2.5 text-sm outline-none"
                      placeholder="Search products..."
                      value={inputKeyword}
                      onChange={(e) => setInputKeyword(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </label>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5A2B] text-white rounded-lg text-sm font-medium hover:bg-[#6d4622] transition-colors shrink-0"
                >
                  <Search size={15} />
                  Search
                </button>

                {/* Status Filters */}
                <div className="flex items-center gap-2 shrink-0">
                  {(["all", "active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        statusFilter === s
                          ? "bg-[#8B5A2B] text-white border-[#8B5A2B]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Show Deleted */}
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
                    showDeleted
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Trash2 size={15} />
                  <span>{showDeleted ? "Hide Deleted" : "Show Deleted"}</span>
                </button>

                {/* Clear Filter */}
                <button
                  onClick={handleClearFilter}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors shrink-0"
                >
                  Clear Filter
                </button>
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
                  {committedKeyword
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
                          <label aria-label="Toggle product status" className="absolute top-4 right-4 inline-flex items-center cursor-pointer">
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
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold transition-colors"
                                >
                                  <Edit size={18} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item.id, item.product_name)}
                                  disabled={isDeleting}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={18} />
                                  Remove
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

      {/* Remove Product Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Warning Icon + Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Remove Product</h3>
              <p className="text-sm text-slate-500 mt-1">
                This will remove the product from this category only
              </p>
            </div>

            {/* Message */}
            <p className="text-slate-600 text-center mb-5">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-900">{deleteModal.productName}</span>{" "}
              from this category?
            </p>

            {/* Product Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Product Name</span>
                <span className="text-slate-900 font-semibold">{deleteModal.productName}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, productId: "", productName: "" })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove Product
                  </>
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
        onSuccess={() => {
          setIsEditDrawerOpen(false);
          setSelectedProduct(null);
          fetchProducts();
        }}
        productCategory={selectedProduct}
      />

      {/* Add Product to Category Drawer */}
      <AddProductToCategoryDrawer
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        onSuccess={() => {
          setIsAssignDrawerOpen(false);
          fetchProducts();
        }}
        categoryFranchiseId={categoryContext.categoryFranchiseId}
        categoryId={categoryContext.categoryId}
        categoryName={categoryContext.categoryName}
      />
    </div>
  );
}
