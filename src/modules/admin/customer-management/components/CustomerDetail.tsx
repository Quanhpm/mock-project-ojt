import { CheckCircle2, Mail, Phone, MapPin, Shield } from "lucide-react";

// ============================================================================
// TYPESCRIPT INTERFACE
// ============================================================================
export interface CustomerDetailData {
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  address: string;
  is_verified: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================
interface CustomerDetailProps {
  customer: CustomerDetailData;
  className?: string;
}

// ============================================================================
// CUSTOMER DETAIL COMPONENT (READ-ONLY)
// ============================================================================
export default function CustomerDetail({
  customer,
  className = "",
}: CustomerDetailProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto ${className}`}
    >
      {/* Header Section with Avatar */}
      <div className="relative bg-linear-to-r from-amber-50 to-orange-50 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar - Circular */}
          <div className="relative">
            <img
              src={customer.avatar_url}
              alt={customer.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(customer.name) +
                  "&size=128&background=8B4513&color=fff";
              }}
            />

            {/* Verified Badge on Avatar */}
            {customer.is_verified && (
              <div
                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white shadow-sm"
                title="Tài khoản đã xác thực"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Customer Name & Verification Status */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customer.name}
              </h2>

              {/* Verified Badge (Desktop) */}
              {customer.is_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 w-fit mx-auto sm:mx-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã xác thực
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Contact Information Grid */}
      <div className="px-6 py-8 sm:px-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Thông tin liên hệ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="group">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200">
              <div className="shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Mail className="w-5 h-5 text-amber-700" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-900 break-all">
                  {customer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="group">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200">
              <div className="shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Phone className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Số điện thoại
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="md:col-span-2 group">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200">
              <div className="shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <MapPin className="w-5 h-5 text-green-700" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Địa chỉ
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {customer.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Status Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Thông tin được cập nhật từ hệ thống
          </div>

          {customer.is_verified ? (
            <div className="flex items-center gap-2 text-xs font-medium text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Tài khoản đã được xác minh
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
              <Shield className="w-4 h-4" />
              Chờ xác minh tài khoản
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
