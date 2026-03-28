import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Eye,
  Package,
  Plus,
  RotateCcw,
  Store,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast.hook";
import { Pagination } from "@/modules/admin/user-management/components/Pagination";
import type { Franchise } from "@/types/franchise.types";
import { useFranchiseSearch } from "../hooks";
import FranchiseDelete from "./FranchiseDelete";
import FranchiseDetailModal from "./FranchiseDetailModal";
import FranchiseEditModal from "./FranchiseEditModal";
import FranchiseRestore from "./FranchiseRestore";
import { FranchiseSearch } from "./FranchiseSearch";
import { useGetFranchiseById } from "./hooks/useGetFranchiseById";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-200 shrink-0" />
        <div className="flex flex-col gap-2 min-w-0">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="p-4">
      <div className="h-4 w-24 bg-slate-200 rounded" />
    </td>
    <td className="p-4">
      <div className="h-4 w-56 bg-slate-100 rounded" />
    </td>
    <td className="p-4">
      <div className="h-6 w-11 bg-slate-200 rounded-full" />
    </td>
    <td className="p-4">
      <div className="ml-auto flex justify-end gap-2">
        <div className="h-9 w-9 rounded-lg bg-slate-100" />
        <div className="h-9 w-9 rounded-lg bg-slate-100" />
        <div className="h-9 w-9 rounded-lg bg-slate-100" />
      </div>
    </td>
  </tr>
);

export default function FranchiseTable() {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const searchState = useFranchiseSearch();
  const {
    franchises,
    isLoading,
    error,
    executeSearch,
    clearFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    deleteFranchise,
    toggleFranchiseStatus,
    restoreFranchise,
  } = searchState;

  const [isLoadingDetail, setIsLoadingDetail] = useState<string | null>(null);
  const { franchise: selectedFranchise, isLoading: isLoadingFranchiseDetail, fetchFranchise } =
    useGetFranchiseById();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    franchiseId: string | number;
    franchiseName: string;
  }>({
    isOpen: false,
    franchiseId: "",
    franchiseName: "",
  });
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    franchiseId: string | number;
    franchiseName: string;
  }>({
    isOpen: false,
    franchiseId: "",
    franchiseName: "",
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    franchiseId: string | number | null;
  }>({
    isOpen: false,
    franchiseId: null,
  });

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    void executeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const handleViewFranchise = async (id: string | number) => {
    setIsLoadingDetail(String(id));

    try {
      await fetchFranchise(String(id));
      setIsDetailModalOpen(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load franchise details";
      showError("Error", errorMessage);
    } finally {
      setIsLoadingDetail(null);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    void executeSearch({
      keyword: "",
      is_active: null,
      is_deleted: false,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderTableRow = (franchise: Franchise) => {
    const initial = franchise.name?.charAt(0)?.toUpperCase() || "F";

    return (
      <tr
        key={franchise.id}
        className="group hover:bg-slate-50 transition-colors"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            {franchise.logo_url ? (
              <div
                className="h-10 w-10 rounded-lg shrink-0 border border-slate-200 bg-slate-100"
                style={{
                  backgroundImage: `url('${franchise.logo_url}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm border border-transparent">
                {initial}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-slate-900 truncate">
                {franchise.name}
              </span>
              <span className="text-sm text-slate-500 truncate">
                {franchise.code}
              </span>
            </div>
          </div>
        </td>

        <td className="p-4 text-slate-600">{franchise.code || "—"}</td>

        <td className="p-4 text-slate-600 max-w-[320px]">
          <span className="block truncate">{franchise.address || "—"}</span>
        </td>

        <td className="p-4">
          <label
            className="relative inline-flex items-center"
            style={{
              opacity: isLoading || franchise.is_deleted ? 0.5 : 1,
              cursor:
                isLoading || franchise.is_deleted ? "not-allowed" : "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(franchise.is_active)}
              onChange={() =>
                !isLoading &&
                !franchise.is_deleted &&
                toggleFranchiseStatus(
                  franchise.id,
                  Boolean(franchise.is_active),
                )
              }
              disabled={isLoading || franchise.is_deleted}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </td>

        <td className="p-4 text-right">
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => handleViewFranchise(franchise.id)}
              disabled={isLoadingDetail === String(franchise.id)}
              className="p-2 rounded-lg text-slate-600 hover:bg-sky-100 hover:text-sky-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title={
                isLoadingDetail === String(franchise.id) ? "Loading..." : "View"
              }
            >
              <Eye size={20} />
            </button>

            {!franchise.is_deleted && (
              <>
                <button
                  onClick={() =>
                    navigate(`/admin/franchises/${franchise.id}/products`)
                  }
                  className="p-2 rounded-lg text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                  title="Products"
                >
                  <Package size={20} />
                </button>

                <button
                  onClick={() =>
                    setEditModal({ isOpen: true, franchiseId: franchise.id })
                  }
                  className="p-2 rounded-lg text-slate-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (franchise.is_deleted) {
                  setRestoreModal({
                    isOpen: true,
                    franchiseId: franchise.id,
                    franchiseName: franchise.name,
                  });
                  return;
                }

                setDeleteModal({
                  isOpen: true,
                  franchiseId: franchise.id,
                  franchiseName: franchise.name,
                });
              }}
              className={`p-2 rounded-lg transition-colors ${
                franchise.is_deleted
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : "text-slate-600 hover:bg-red-100 hover:text-red-600"
              }`}
              title={franchise.is_deleted ? "Restore" : "Delete"}
            >
              {franchise.is_deleted ? (
                <RotateCcw size={20} />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main className="flex flex-col flex-1">
        <header className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a className="hover:text-primary transition-colors" href="#">
                Home
              </a>
              <span className="material-symbols-outlined text-[16px]">
                chevron_right
              </span>
              <span className="text-slate-900 font-medium">Franchises</span>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Franchise Management
              </h2>
              <p className="text-slate-500">
                Total Franchises: {isLoading ? "..." : totalItems}
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/franchises/create")}
              className="inline-flex w-full sm:w-auto justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-semibold shadow-sm hover:bg-[#6c4830] transition-colors items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Create Franchise
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          <FranchiseSearch
            searchState={searchState}
            onSearch={executeSearch}
            onClearFilters={handleClearFilters}
          />

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Franchise
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Code
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Address
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))}

                  {!isLoading && error && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-red-500">
                            <Store size={40} />
                          </span>
                          <p className="text-red-600 font-medium">
                            Failed to load franchises
                          </p>
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !error &&
                    franchises.map((franchise) => renderTableRow(franchise))}

                  {!isLoading && !error && franchises.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-slate-300">
                            <Store size={48} />
                          </span>
                          <p className="text-slate-500 font-medium">
                            No franchises found
                          </p>
                          <p className="text-sm text-slate-400">
                            There are no franchise records to display.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isLoading && franchises.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pageSize}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>

      <FranchiseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        franchise={selectedFranchise}
        isLoading={isLoadingFranchiseDetail}
      />

      <FranchiseDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => deleteFranchise(deleteModal.franchiseId)}
        franchiseId={deleteModal.franchiseId}
        franchiseName={deleteModal.franchiseName}
      />

      <FranchiseRestore
        isOpen={restoreModal.isOpen}
        franchiseId={restoreModal.franchiseId}
        franchiseName={restoreModal.franchiseName}
        isRestoring={isLoading}
        onConfirm={() => {
          restoreFranchise(restoreModal.franchiseId);
          setRestoreModal({
            isOpen: false,
            franchiseId: "",
            franchiseName: "",
          });
        }}
        onClose={() =>
          setRestoreModal({
            isOpen: false,
            franchiseId: "",
            franchiseName: "",
          })
        }
      />

      <FranchiseEditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, franchiseId: null })}
        franchiseId={editModal.franchiseId}
        onSuccess={() => {
          void executeSearch();
        }}
      />
    </div>
  );
}
