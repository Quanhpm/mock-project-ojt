import { useParams } from "react-router-dom";
import { customers, customerFranchise, mockFranchises } from "@/mockdata";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const customer = customers.find(c => c.id === parseInt(id || ""));

  if (!customer) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6c757d" }}>
        Customer not found
      </div>
    );
  }

  const customerFranchises = customerFranchise
    .filter(cf => cf.customer_id === customer.id && cf.is_active)
    .map(cf => mockFranchises.find(f => f.id === cf.franchise_id))
    .filter(Boolean);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Customers › <span style={{ color: "#212529" }}>Customer Detail</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <img
          src={customer.avatar_url}
          alt={customer.name}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "8px",
            objectFit: "cover"
          }}
        />
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            {customer.name}
          </h1>
          <p style={{ color: "#6c757d", margin: 0 }}>ID: {customer.id}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* Email */}
        <div style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>Email</p>
          <p style={{ fontSize: "16px", fontWeight: "500", color: "#212529", margin: 0 }}>
            {customer.email || "—"}
          </p>
        </div>

        {/* Phone */}
        <div style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>Phone</p>
          <p style={{ fontSize: "16px", fontWeight: "500", color: "#212529", margin: 0 }}>
            {customer.phone}
          </p>
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <p style={{ fontSize: "12px", color: "#6c757d", margin: "0 0 8px" }}>Status</p>
          <p style={{
            fontSize: "16px",
            fontWeight: "500",
            margin: 0,
            color: customer.is_active ? "#155724" : "#721c24"
          }}>
            {customer.is_active ? "🟢 Active" : "🔴 Inactive"}
          </p>
        </div>
      </div>

      {/* Franchises */}
      <div style={{
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#212529", margin: "0 0 16px" }}>
          Assigned Franchises
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {customerFranchises.length > 0 ? (
            customerFranchises.map(franchise => (
              <div
                key={franchise?.id}
                style={{
                  padding: "12px",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <p style={{ fontSize: "14px", fontWeight: "500", color: "#212529", margin: "0 0 4px" }}>
                  {franchise?.name}
                </p>
                <p style={{ fontSize: "12px", color: "#6c757d", margin: 0 }}>
                  {franchise?.code}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: "#6c757d", fontSize: "14px" }}>No franchises assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
