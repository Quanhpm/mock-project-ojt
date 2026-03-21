import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import { useGetCustomer } from "../components/hooks/useGetCustomer";

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, isLoading, error, fetchCustomer } = useGetCustomer();

  // Gọi API lấy data khi component mount hoặc khi id thay đổi
  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id, fetchCustomer]);

  // Trạng thái Loading
  if (isLoading) {
    return (
      <div
        style={{ padding: "48px 24px", textAlign: "center", color: "#6c757d" }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#8B5A2B",
          }}
        >
          Đang tải dữ liệu khách hàng...
        </div>
      </div>
    );
  }

  // Trạng thái Lỗi API
  if (error) {
    return (
      <div
        style={{ padding: "48px 24px", textAlign: "center", color: "#6c757d" }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#dc2626",
          }}
        >
          ❌ Đã xảy ra lỗi
        </div>
        <p style={{ fontSize: "14px", marginBottom: "16px" }}>{error}</p>
        <button
          onClick={() => navigate("/admin/customers")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Trạng thái Không tìm thấy (API trả về null nhưng không lỗi)
  if (!customer) {
    return (
      <div
        style={{ padding: "48px 24px", textAlign: "center", color: "#6c757d" }}
      >
        <div
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}
        >
          Customer not found
        </div>
        <p style={{ fontSize: "14px", marginBottom: "16px" }}>
          The customer you're trying to edit doesn't exist. Please go back and
          select a valid customer.
        </p>
        <button
          onClick={() => navigate("/admin/customers")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Trạng thái Thành công -> Render Form
  return (
    <div>
      <CustomerForm customer={customer} />
    </div>
  );
}
