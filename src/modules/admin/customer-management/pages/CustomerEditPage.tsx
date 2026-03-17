import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CustomerForm from "../components/CustomerForm";
import { useGetCustomer } from "../components/hooks/useGetCustomer";

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, isLoading, error, fetchCustomer } = useGetCustomer();

  useEffect(() => {
    if (id) fetchCustomer(id);
  }, [id, fetchCustomer]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700" />
        <p className="text-sm font-semibold text-amber-700">
          Đang tải dữ liệu khách hàng...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="text-lg font-semibold text-red-500">❌ Có lỗi xảy ra</p>
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => navigate("/admin/customers")}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="text-lg font-semibold text-gray-700">Không tìm thấy khách hàng</p>
        <p className="text-sm text-gray-500">
          Khách hàng bạn muốn chỉnh sửa không tồn tại. Vui lòng quay lại và chọn khách hàng hợp lệ.
        </p>
        <button
          onClick={() => navigate("/admin/customers")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return <CustomerForm customer={customer} />;
}
