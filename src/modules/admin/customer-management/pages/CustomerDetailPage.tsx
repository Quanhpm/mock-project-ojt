import { X, MapPin, Clock, Calendar, Store } from "lucide-react";
import type { Franchise } from "../../../../types/common.type";

interface FranchiseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function FranchiseDetailModal({
  isOpen,
  onClose,
  franchise,
  isLoading = false,
  error = null,
}: FranchiseDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_.25s_ease]">

        {/* HEADER */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 p-8 text-white">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-6">

            <img
              src={
                franchise?.logo_url ||
                `https://ui-avatars.com/api/?name=${franchise?.name}&background=f59e0b&color=fff`
              }
              alt={franchise?.name}
              className="w-20 h-20 rounded-2xl border-4 border-white/30 object-cover shadow-md"
            />

            <div>
              <h2 className="text-2xl font-bold">{franchise?.name}</h2>
              <p className="text-sm opacity-90 mt-1">
                Franchise Code: {franchise?.code}
              </p>

              {franchise && (
                <span
                  className={`inline-block mt-3 px-4 py-1.5 text-sm font-semibold rounded-full ${
                    franchise.is_active
                      ? "bg-green-400/20 text-green-100"
                      : "bg-red-400/20 text-red-100"
                  }`}
                >
                  {franchise.is_active
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* BODY */}
        <div className="p-8">

          {isLoading && (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-gray-600 font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          )}

          {franchise && !isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Address */}
              <InfoCard
                icon={<MapPin size={20} />}
                title="Địa chỉ"
                value={franchise.address || "Chưa cập nhật"}
              />

              {/* Open Time */}
              <InfoCard
                icon={<Clock size={20} />}
                title="Giờ mở cửa"
                value={new Date(franchise.opened_at).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" }
                )}
              />

              {/* Close Time */}
              <InfoCard
                icon={<Clock size={20} />}
                title="Giờ đóng cửa"
                value={
                  franchise.closed_at
                    ? new Date(franchise.closed_at).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "Chưa cập nhật"
                }
              />

              {/* Created */}
              <InfoCard
                icon={<Calendar size={20} />}
                title="Ngày tạo"
                value={new Date(
                  franchise.created_at
                ).toLocaleDateString("vi-VN")}
              />

              {/* Updated */}
              <InfoCard
                icon={<Calendar size={20} />}
                title="Cập nhật"
                value={new Date(
                  franchise.updated_at
                ).toLocaleDateString("vi-VN")}
              />

              {/* Code */}
              <InfoCard
                icon={<Store size={20} />}
                title="Mã Franchise"
                value={franchise.code}
              />

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-8 py-5 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
          >
            Đóng
          </button>
        </div>

      </div>

      <style>
        {`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }
        `}
      </style>
    </div>
  );
}

/* INFO CARD COMPONENT */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition">

      <div className="text-amber-600 mt-0.5">{icon}</div>

      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>

    </div>
  );
}