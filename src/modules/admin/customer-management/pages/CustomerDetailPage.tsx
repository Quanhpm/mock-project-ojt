import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import CustomerDetail from "../components/CustomerDetail";
import { useGetCustomer } from "../components/hooks/useGetCustomer";
import { ROUTER_URL } from "@/routes/router.const";

const CUSTOMER_LIST_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.CUSTOMER}`;

export default function CustomerDetailPage() {
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
          Đang tải thông tin khách hàng...
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
          onClick={() => navigate(CUSTOMER_LIST_PATH)}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <span
          className="hover:text-amber-700 cursor-pointer transition-colors"
          onClick={() => navigate(CUSTOMER_LIST_PATH)}
        >
          Khách hàng
        </span>
        <span>›</span>
        <span className="text-gray-700 font-medium">
          {customer.name || customer.email}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết khách hàng</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(CUSTOMER_LIST_PATH)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            onClick={() => navigate(`${CUSTOMER_LIST_PATH}/edit/${customer.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </button>
        </div>
      </div>

      <CustomerDetail customer={customer} />
    </div>
  );
}
