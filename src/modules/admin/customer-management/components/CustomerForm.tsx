import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Upload, User } from "lucide-react";
import { mockFranchises, customerFranchise } from "@/mockdata";
import { useCreateCustomer } from "./hooks/useCreateCustomer";
import { useUpdateCustomer } from "./hooks/useUpdateCustomer";
import type { Customer } from "./customer.types";

interface CustomerFormProps {
  customer?: Customer;
}

// ============================================================================
// YUP VALIDATION SCHEMA
// ============================================================================
const createValidationSchema = (isEditMode: boolean) =>
  yup.object().shape({
    email: yup
      .string()
      .required("Email là bắt buộc")
      .email("Email không đúng định dạng"),
    phone: yup.string().required("Số điện thoại là bắt buộc"),
    name: yup.string().default(""),
    avatarUrl: yup
      .string()
      .default("")
      .test("is-url", "Avatar URL phải đúng định dạng URL", (value) => {
        if (!value || value === "") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }),
    password: isEditMode
      ? yup.string().default("")
      : yup
          .string()
          .required("Mật khẩu là bắt buộc")
          .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: isEditMode
      ? yup.string().default("")
      : yup
          .string()
          .required("Xác nhận mật khẩu là bắt buộc")
          .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
    isActive: yup.boolean().default(true),
  });

interface FormValues {
  email: string;
  phone: string;
  name: string;
  avatarUrl: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!customer;

  const [selectedFranchises, setSelectedFranchises] = useState<number[]>(
    customer
      ? customerFranchise
          .filter(
            (cf) =>
              String(cf.customer_id) === String(customer.id) && cf.is_active,
          )
          .map((cf) => cf.franchise_id)
      : [],
  );

  // ============================================================================
  // REACT HOOK FORM SETUP
  // ============================================================================
  const {
    register,
    handleSubmit: hookFormHandleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(createValidationSchema(isEditMode)),
    defaultValues: {
      email: "",
      phone: "",
      name: "",
      avatarUrl: "",
      password: "",
      confirmPassword: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  // ============================================================================
  // CUSTOM HOOKS (API)
  // ============================================================================
  const { createCustomer, isCreating } = useCreateCustomer();
  const { updateCustomer, isUpdating } = useUpdateCustomer();

  const isLoading = isCreating || isUpdating;

  // ============================================================================
  // USE EFFECT - FILL FORM WITH EXISTING DATA (EDIT MODE)
  // ============================================================================
  useEffect(() => {
    if (customer) {
      reset({
        email: customer.email || "",
        phone: customer.phone || "",
        name: customer.name || "",
        avatarUrl: customer.avatar_url || "",
        password: "",
        confirmPassword: "",
        isActive: customer.is_active ?? true,
      });

      const franchiseIds = customerFranchise
        .filter(
          (cf) =>
            String(cf.customer_id) === String(customer.id) && cf.is_active,
        )
        .map((cf) => cf.franchise_id);
      setSelectedFranchises(franchiseIds);
    }
  }, [customer, reset]);

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================
  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode) {
        // UPDATE MODE: Không gửi password
        const updatePayload = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          avatar_url: data.avatarUrl,
          is_active: data.isActive,
        };

        await updateCustomer(customer.id, updatePayload, () => {
          alert(
            `✅ Cập nhật khách hàng "${data.name || data.email}" thành công!`,
          );
          navigate("/admin/customers");
        });
      } else {
        // CREATE MODE: Gửi cả password
        const createPayload = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          avatar_url: data.avatarUrl,
          password: data.password!,
          is_active: data.isActive,
        };

        await createCustomer(createPayload, () => {
          alert(
            `✅ Tạo mới khách hàng "${data.name || data.email}" thành công!`,
          );
          navigate("/admin/customers");
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const toggleFranchise = (franchiseId: number) => {
    setSelectedFranchises((prev) =>
      prev.includes(franchiseId)
        ? prev.filter((id) => id !== franchiseId)
        : [...prev, franchiseId],
    );
  };

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
        Customers ›{" "}
        <span style={{ color: "#212529" }}>
          {isEditMode ? `Edit Customer - ${customer.name}` : "Create Customer"}
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {isEditMode ? "Edit Customer" : "Create New Customer"}
          </h1>
          <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
            {isEditMode
              ? "Update customer information and franchise assignments."
              : "Add a new customer with contact information and franchise assignments."}
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
              color: "#374151",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              backgroundColor: isLoading ? "#9ca3af" : "#8B4513",
              color: "white",
              transition: "background-color 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#6d3610";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#8B4513";
            }}
          >
            {isLoading
              ? "Đang lưu..."
              : isEditMode
                ? "Update Customer"
                : "Create Customer"}
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: "1200px" }}>
        <form id="customer-form" onSubmit={hookFormHandleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <User size={20} style={{ color: "#8B4513" }} />
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#212529",
                }}
              >
                Basic Information
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Customer ID */}
              {isEditMode && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#495057",
                      marginBottom: "6px",
                    }}
                  >
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={customer.id}
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      backgroundColor: "#f8f9fa",
                      color: "#6c757d",
                    }}
                  />
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                    marginBottom: "6px",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Enter customer name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.name ? "#dc3545" : "#dee2e6"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
                {errors.name && (
                  <p
                    style={{
                      color: "#dc3545",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginBottom: 0,
                    }}
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                    marginBottom: "6px",
                  }}
                >
                  Email <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="customer@example.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.email ? "#dc3545" : "#dee2e6"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
                {errors.email && (
                  <p
                    style={{
                      color: "#dc3545",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginBottom: 0,
                    }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                    marginBottom: "6px",
                  }}
                >
                  Phone <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="+84 123 456 789"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.phone ? "#dc3545" : "#dee2e6"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
                {errors.phone && (
                  <p
                    style={{
                      color: "#dc3545",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginBottom: 0,
                    }}
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password - Only show in CREATE mode */}
              {!isEditMode && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#495057",
                      marginBottom: "6px",
                    }}
                  >
                    Password <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Enter password (min 8 characters)"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${errors.password ? "#dc3545" : "#dee2e6"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                    }}
                  />
                  {errors.password && (
                    <p
                      style={{
                        color: "#dc3545",
                        fontSize: "12px",
                        marginTop: "4px",
                        marginBottom: 0,
                      }}
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password - Only show in CREATE mode */}
              {!isEditMode && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#495057",
                      marginBottom: "6px",
                    }}
                  >
                    Confirm Password <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Confirm password"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${errors.confirmPassword ? "#dc3545" : "#dee2e6"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                    }}
                  />
                  {errors.confirmPassword && (
                    <p
                      style={{
                        color: "#dc3545",
                        fontSize: "12px",
                        marginTop: "4px",
                        marginBottom: 0,
                      }}
                    >
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Avatar Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "12px",
                }}
              >
                Avatar URL
              </label>
              <div
                style={{
                  border: "2px dashed #dee2e6",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Upload
                  size={32}
                  style={{ color: "#6c757d", margin: "0 auto 8px" }}
                />
                <p
                  style={{
                    margin: "8px 0",
                    fontSize: "14px",
                    color: "#495057",
                  }}
                >
                  Enter avatar image URL below
                </p>
                <input
                  type="text"
                  {...register("avatarUrl")}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: `1px solid ${errors.avatarUrl ? "#dc3545" : "#dee2e6"}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginTop: "12px",
                  }}
                />
                {errors.avatarUrl && (
                  <p
                    style={{
                      color: "#dc3545",
                      fontSize: "12px",
                      marginTop: "4px",
                      marginBottom: 0,
                    }}
                  >
                    {errors.avatarUrl.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Franchise Assignment */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#212529",
                marginBottom: "16px",
              }}
            >
              Franchise Assignment
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              {mockFranchises.map((franchise) => (
                <div
                  key={franchise.id}
                  style={{
                    padding: "12px",
                    border: selectedFranchises.includes(franchise.id)
                      ? "2px solid #8B4513"
                      : "1px solid #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: selectedFranchises.includes(franchise.id)
                      ? "#fff8f5"
                      : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => toggleFranchise(franchise.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFranchises.includes(franchise.id)}
                      onChange={() => toggleFranchise(franchise.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#212529",
                      }}
                    >
                      {franchise.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6c757d",
                      margin: "4px 8px 0",
                      marginLeft: "28px",
                    }}
                  >
                    {franchise.code}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#212529",
                    marginBottom: "4px",
                  }}
                >
                  Active Status
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  Mark this customer as active or inactive
                </p>
              </div>
              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "50px",
                  height: "24px",
                }}
              >
                <input
                  type="checkbox"
                  {...register("isActive")}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0,
                  }}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isActive ? "#28a745" : "#ccc",
                    transition: ".3s",
                    borderRadius: "24px",
                  }}
                  onClick={() => setValue("isActive", !isActive)}
                />
                <span
                  style={{
                    position: "absolute",
                    content: '""',
                    height: "18px",
                    width: "18px",
                    left: isActive ? "26px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: ".3s",
                    borderRadius: "50%",
                  }}
                />
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
