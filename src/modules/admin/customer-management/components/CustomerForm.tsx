import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, User } from "lucide-react";
import { mockFranchises, customers, customerFranchise } from "@/mockdata";

interface CustomerFormProps {
  customer?: any;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!customer;
  
  const [formData, setFormData] = useState({
    customerId: customer?.id ? `CUST-${String(customer.id).padStart(3, '0')}` : "CUST-001",
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    avatarUrl: customer?.avatar_url || "",
    password: customer?.password || "",
    confirmPassword: customer?.password || "",
    isActive: customer?.is_active ?? true,
  });

  const [selectedFranchises, setSelectedFranchises] = useState<number[]>(
    customer 
      ? customerFranchise
          .filter(cf => cf.customer_id === customer.id && cf.is_active)
          .map(cf => cf.franchise_id)
      : []
  );

  useEffect(() => {
    if (customer) {
      setFormData({
        customerId: `CUST-${String(customer.id).padStart(3, '0')}`,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        avatarUrl: customer.avatar_url || "",
        password: customer.password || "",
        confirmPassword: customer.password || "",
        isActive: customer.is_active ?? true,
      });
      
      const franchiseIds = customerFranchise
        .filter(cf => cf.customer_id === customer.id && cf.is_active)
        .map(cf => cf.franchise_id);
      setSelectedFranchises(franchiseIds);
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone) {
      alert("Please fill in all required fields!");
      return;
    }
    
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    // Prepare customer data
    const customerData = {
      id: customer?.id || Math.max(...customers.map(c => c.id), 0) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar_url: formData.avatarUrl,
      password: formData.password,
      is_active: formData.isActive,
      is_deleted: false,
      created_at: customer?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Log the data (in a real app, you would send this to an API)
    console.log("Customer data:", customerData);
    console.log("Selected franchises:", selectedFranchises);
    
    const actionText = isEditMode ? "updated" : "created";
    alert(`Customer "${formData.name}" has been ${actionText} successfully!`);
    navigate("/admin/customers");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSwitch = (field: string) => {
    setFormData({
      ...formData,
      [field]: !formData[field as keyof typeof formData],
    });
  };

  const toggleFranchise = (franchiseId: number) => {
    setSelectedFranchises(prev =>
      prev.includes(franchiseId)
        ? prev.filter(id => id !== franchiseId)
        : [...prev, franchiseId]
    );
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "16px", fontSize: "14px", color: "#6c757d" }}>
        Customers › <span style={{ color: "#212529" }}>
          {isEditMode ? `Edit Customer - ${formData.name}` : "Create Customer"}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: 0, marginBottom: "8px" }}>
            {isEditMode ? "Edit Customer" : "Create New Customer"}
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            {isEditMode 
              ? "Update customer information and franchise assignments."
              : "Add a new customer with contact information and franchise assignments."
            }
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            style={{
              padding: "10px 20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              backgroundColor: "#8B4513",
              color: "white",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6d3610"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#8B4513"}
          >
            {isEditMode ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: "1200px" }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <User size={20} style={{ color: "#8B4513" }} />
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529" }}>
                Basic Information
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Customer ID */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Customer ID (Auto-generated)
                </label>
                <input
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d"
                  }}
                />
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Full Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Phone <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+84 123 456 789"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Password <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "6px" }}>
                  Confirm Password <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#495057", marginBottom: "12px" }}>
                Avatar
              </label>
              <div style={{
                border: "2px dashed #dee2e6",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                <Upload size={32} style={{ color: "#6c757d", margin: "0 auto 8px" }} />
                <p style={{ margin: "8px 0", fontSize: "14px", color: "#495057" }}>
                  Drag and drop your image here, or click to select
                </p>
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginTop: "12px"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Franchise Assignment */}
          <div style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#212529", marginBottom: "16px" }}>
              Franchise Assignment
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {mockFranchises.map(franchise => (
                <div
                  key={franchise.id}
                  style={{
                    padding: "12px",
                    border: selectedFranchises.includes(franchise.id) ? "2px solid #8B4513" : "1px solid #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: selectedFranchises.includes(franchise.id) ? "#fff8f5" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => toggleFranchise(franchise.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={selectedFranchises.includes(franchise.id)}
                      onChange={() => toggleFranchise(franchise.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                      {franchise.name}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6c757d", margin: "4px 8px 0", marginLeft: "28px" }}>
                    {franchise.code}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#212529", marginBottom: "4px" }}>
                  Active Status
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  Mark this customer as active or inactive
                </p>
              </div>
              <label style={{
                position: "relative",
                display: "inline-block",
                width: "50px",
                height: "24px"
              }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={() => toggleSwitch('isActive')}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: formData.isActive ? "#28a745" : "#ccc",
                  transition: ".3s",
                  borderRadius: "24px"
                }}/>
                <span style={{
                  position: "absolute",
                  content: '""',
                  height: "18px",
                  width: "18px",
                  left: formData.isActive ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: ".3s",
                  borderRadius: "50%"
                }}/>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
