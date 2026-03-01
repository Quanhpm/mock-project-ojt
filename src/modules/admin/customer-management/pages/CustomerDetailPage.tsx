import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGetCustomer } from "../components/hooks/useGetCustomer";
import CustomerDetail from "../components/CustomerDetail";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, isLoading, error, fetchCustomer } = useGetCustomer();

  // Gọi API lấy data
  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id, fetchCustomer]);

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
          <p className="text-lg font-semibold text-amber-700">
            Đang tải dữ liệu chi tiết...
          </p>
        </div>
      </div>
    );
  }

  // Trạng thái Lỗi API
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Trạng thái Không tìm thấy
  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy khách hàng
          </h2>
          <p className="text-gray-600 mb-6">
            Khách hàng này không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Trạng thái Thành công -> Render UI với CustomerDetail component
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb & Back Button */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate("/admin/customers")}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khách hàng</span>
        </button>

        <nav className="text-sm text-gray-500">
          <span
            className="cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => navigate("/admin/customers")}
          >
            Customers
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Customer Detail</span>
        </nav>
      </div>

      {/* Customer Detail Component */}
      <CustomerDetail
        customer={{
          email: customer.email || "",
          name: customer.name,
          phone: customer.phone,
          avatar_url: customer.avatar_url || "",
          address: customer.address || "Chưa cập nhật địa chỉ",
          is_verified: customer.is_active || false,
        }}
      />

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mt-6 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
          className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium shadow-md"
        >
          Chỉnh sửa thông tin
        </button>
        <button
          onClick={() => navigate("/admin/customers")}
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
