import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Upload, User, X } from "lucide-react";
import { useCreateCustomer } from "./hooks/useCreateCustomer";
import { useUpdateCustomer } from "./hooks/useUpdateCustomer";
import type { Customer } from "../../../../types/customer.types";
import { useToast } from "@/hooks/use-toast.hook";
import axios from "axios";
import { ENV } from "@/config/env.config";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ============================================================================
// YUP VALIDATION SCHEMA
// ============================================================================
const createValidationSchema = (isEditMode: boolean) =>
  yup.object().shape({

    email: yup
      .string()
      .trim()
      .required("Email là bắt buộc")
      .matches(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, "Email không đúng định dạng")
      .max(50, "Email không được vượt quá 50 ký tự")
      .min(8, "Email phải có ít nhất 8 ký tự"),

    phone: yup
      .string()
      .required("Số điện thoại là bắt buộc")
      .matches(
        /^(\+84|0)(3[2-9]|5[2689]|7[06-9]|8\d|9\d)\d{7}$/,
        "Số điện thoại không hợp lệ ",
      ),

    name: yup
      .string()
      .trim()
      .required("Tên là bắt buộc")
      .min(5, "Tên phải có ít nhất 5 ký tự")
      .matches(/^[a-zA-Z0-9. ]+$/, "Tên chỉ được chứa chữ thường, chữ hoa, số, dấu chấm và khoảng trắng")
      .test(
        "no-consecutive-dots",
        "Không được chứa hai dấu chấm liên tiếp",
        (value) => !value || !value.includes("..")
      )
      .test(
        "no-multiple-spaces",
        "Không được chứa nhiều khoảng trắng liên tiếp",
        (value) => !value || !/ {2,}/.test(value)
      )
      .test(
        "no-edge-dot",
        "Không được bắt đầu hoặc kết thúc bằng dấu chấm",
        (value) => !value || (!value.startsWith(".") && !value.endsWith("."))
      )
      .default(""),

    avatarUrl: yup.string().default(""),

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

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isEditMode = !!customer;

  // ============================================================================
  // FILE UPLOAD STATE
  // ============================================================================
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    mode: 'onChange',
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
  const avatarUrl = watch("avatarUrl");

  // ============================================================================
  // CUSTOM HOOKS (API)
  // ============================================================================
  const { createCustomer, isCreating } = useCreateCustomer();
  const { updateCustomer, isUpdating } = useUpdateCustomer();

  const isLoading = isCreating || isUpdating || isUploading;

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
      // Set preview if avatar exists
      if (customer.avatar_url) {
        setPreviewUrl(customer.avatar_url);
      }
    }
  }, [customer, reset]);

  // ============================================================================
  // CLOUDINARY UPLOAD HANDLER
  // ============================================================================
  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", ENV.CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "customers/avatars");

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const { secure_url } = response.data;
      setValue("avatarUrl", secure_url);
      setPreviewUrl(secure_url);
      success("Upload successful", "Avatar has been uploaded.");
    } catch (err) {
      console.error("Upload error:", err);
      error(
        "Upload failed",
        err instanceof Error
          ? err.message
          : "Unable to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================================
  // FILE INPUT CHANGE HANDLER
  // ============================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        error("Invalid file", "Please select an image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error("File too large", "Maximum file size is 5MB.");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      handleUploadImage(file);
    }
  };

  // ============================================================================
  // REMOVE IMAGE HANDLER
  // ============================================================================
  const handleRemoveImage = () => {
    setPreviewUrl("");
    setValue("avatarUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================
  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode) {
        // UPDATE MODE: skip password and is_active (not required by API)
        const updatePayload = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          avatar_url: data.avatarUrl,
        };

        await updateCustomer(customer.id, updatePayload, () => {
          success(
            "Customer updated",
            `Customer "${data.name || data.email}" has been updated.`,
          );
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/admin/customers");
          }
        });
      } else {
        // CREATE MODE: send password too
        const createPayload = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          avatar_url: data.avatarUrl,
          password: data.password!,
          is_active: data.isActive,
        };

        await createCustomer(createPayload, () => {
          success(
            "Customer created",
            `Customer "${data.name || data.email}" has been created.`,
          );
          navigate("/admin/customers");
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      error(
        "An error occurred",
        err instanceof Error ? err.message : "Please try again later.",
      );
    }
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
              ? "Update customer information."
              : "Add a new customer with contact information."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => onCancel ? onCancel() : navigate("/admin/customers")}
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
              ? "Saving..."
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
                Avatar Image
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: "none" }}
              />

              {/* Upload Area / Preview */}
              {previewUrl ? (
                // Preview Mode
                <div
                  style={{
                    position: "relative",
                    border: "2px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #dee2e6",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#212529",
                      }}
                    >
                      Avatar uploaded
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#6c757d",
                        wordBreak: "break-all",
                      }}
                    >
                      {avatarUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      padding: "6px",
                      border: "none",
                      borderRadius: "50%",
                      backgroundColor: "#dc3545",
                      color: "white",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: isUploading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isUploading)
                        e.currentTarget.style.backgroundColor = "#c82333";
                    }}
                    onMouseLeave={(e) => {
                      if (!isUploading)
                        e.currentTarget.style.backgroundColor = "#dc3545";
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed #dee2e6",
                    borderRadius: "8px",
                    padding: "32px 24px",
                    textAlign: "center",
                    backgroundColor: "#f8f9fa",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: isUploading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.borderColor = "#8B4513";
                      e.currentTarget.style.backgroundColor = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.borderColor = "#dee2e6";
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                >
                  <Upload
                    size={40}
                    style={{
                      color: isUploading ? "#6c757d" : "#8B4513",
                      margin: "0 auto 12px",
                    }}
                  />
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: isUploading ? "#6c757d" : "#212529",
                    }}
                  >
                    {isUploading
                      ? "Uploading..."
                      : "Click to select an avatar"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#6c757d",
                    }}
                  >
                    {isUploading
                      ? "Please wait..."
                      : "Supported: JPG, PNG, GIF (max 5MB)"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status - CHỈ HIỂN THỊ KHI TẠO MỚI */}
          {!isEditMode && (
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
                      position: "absolute",
                    }}
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
          )}
        </form>
      </div>
    </div>
  );
}
