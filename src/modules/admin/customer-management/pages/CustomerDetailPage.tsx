import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import CustomerDetail from "../components/CustomerDetail";
import { useGetCustomer } from "../components/hooks/useGetCustomer";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, isLoading, error, fetchCustomer } = useGetCustomer();

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id, fetchCustomer]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#f9f7f4",
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#8B5A2B" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #E6CCB2",
              borderTopColor: "#7F5539",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ fontSize: "15px", fontWeight: "600" }}>Loading customer data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#f9f7f4",
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "#dc2626", marginBottom: "8px" }}>
            Failed to load customer
          </p>
          <p style={{ fontSize: "14px", color: "#6c757d", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => navigate("/admin/customers")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #E6CCB2",
              backgroundColor: "white",
              color: "#7F5539",
              cursor: "pointer",
            }}
          >
            Back to customers
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div
        style={{
          backgroundColor: "#f9f7f4",
          minHeight: "100vh",
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Customer not found
          </p>
          <button
            onClick={() => navigate("/admin/customers")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #E6CCB2",
              backgroundColor: "white",
              color: "#7F5539",
              cursor: "pointer",
            }}
          >
            Back to customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f9f7f4", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => navigate("/admin/customers")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              border: "1px solid #E6CCB2",
              borderRadius: "8px",
              backgroundColor: "white",
              color: "#7F5539",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#faf8f6";
              e.currentTarget.style.borderColor = "#B08968";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#E6CCB2";
            }}
          >
            <ArrowLeft size={16} />
            Customers
          </button>

          <button
            onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#7F5539",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#9C6644";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#7F5539";
            }}
          >
            <Edit2 size={15} />
            Edit Customer
          </button>
        </div>

        <CustomerDetail customer={customer} />
      </div>
    </div>
  );
}
