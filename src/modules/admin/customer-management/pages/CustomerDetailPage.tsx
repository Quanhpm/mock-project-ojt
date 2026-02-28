import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCustomer } from "../components/hooks/useGetCustomer";
import { customerFranchise, mockFranchises } from "@/mockdata"; // Tạm giữ để render UI Franchise

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
          Đang tải dữ liệu chi tiết...
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

  // Trạng thái Không tìm thấy
  if (!customer) {
    return (
      <div
        style={{ padding: "48px 24px", textAlign: "center", color: "#6c757d" }}
      >
        Customer not found
        <br />
        <br />
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

  // Xử lý mock data Franchises (Sẽ thay thế bằng API thật sau)
  const customerFranchises = customerFranchise
    .filter(
      (cf) => String(cf.customer_id) === String(customer.id) && cf.is_active,
    )
    .map((cf) => mockFranchises.find((f) => f.id === cf.franchise_id))
    .filter(Boolean);

  // Trạng thái Thành công -> Render UI
  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        <span
          style={{ cursor: "pointer", transition: "color 0.2s" }}
          onClick={() => navigate("/admin/customers")}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#212529")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6c757d")}
        >
          Customers
        </span>{" "}
        › <span style={{ color: "#212529" }}>Customer Detail</span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <img
          src={customer.avatar_url || "https://via.placeholder.com/80"}
          alt={customer.name}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "8px",
            objectFit: "cover",
            border: "1px solid #dee2e6",
          }}
          onError={(e) => {
            // Hiển thị ảnh mặc định nếu URL ảnh bị lỗi
            e.currentTarget.src =
              "https://via.placeholder.com/80?text=No+Image";
          }}
        />
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {customer.name}
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontFamily: "monospace" }}>
            ID: {customer.id}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Email */}
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>
            Email
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#212529",
              margin: 0,
            }}
          >
            {customer.email || "—"}
          </p>
        </div>

        {/* Phone */}
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>
            Phone
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#212529",
              margin: 0,
            }}
          >
            {customer.phone || "—"}
          </p>
        </div>

        {/* Status */}
        <div
          style={{
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>
            Status
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "500",
              margin: 0,
              color: customer.is_active ? "#155724" : "#721c24",
            }}
          >
            {customer.is_active ? "🟢 Active" : "🔴 Inactive"}
          </p>
        </div>
      </div>

      {/* Franchises */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#212529",
            margin: "0 0 16px",
          }}
        >
          Assigned Franchises
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {customerFranchises.length > 0 ? (
            customerFranchises.map((franchise) => (
              <div
                key={franchise?.id}
                style={{
                  padding: "12px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#212529",
                    margin: "0 0 4px",
                  }}
                >
                  {franchise?.name}
                </p>
                <p style={{ fontSize: "12px", color: "#6c757d", margin: 0 }}>
                  {franchise?.code}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: "#6c757d", fontSize: "14px" }}>
              No franchises assigned
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
