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
import {
  CLOUDINARY_IMAGE_REQUIREMENT_TEXT,
  validateCloudinaryImageFile,
} from "@/utils";

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
      .required("Email is required")
      .matches(/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
      .max(50, "Email must not exceed 50 characters")
      .min(8, "Email must be at least 8 characters"),

    phone: yup
      .string()
      .required("Phone number is required")
      .matches(
        /^(\+84|0)(3[2-9]|5[2689]|7[06-9]|8\d|9\d)\d{7}$/,
        "Invalid phone number",
      ),

    name: yup
      .string()
      .trim()
      .required("Name is required")
      .min(5, "Name must be at least 5 characters")
      .matches(/^[a-zA-Z0-9.]+$/, "Name can only contain letters, numbers, and dots")
      .test(
        "no-consecutive-dots",
        "Cannot contain consecutive dots",
        (value) => !value || !value.includes("..")
      )
      .test(
        "no-multiple-spaces",
        "Cannot contain multiple consecutive spaces",
        (value) => !value || !/ {2,}/.test(value)
      )
      .test(
        "no-edge-dot",
        "Cannot start or end with a dot",
        (value) => !value || (!value.startsWith(".") && !value.endsWith("."))
      )
      .default(""),

    avatarUrl: yup.string().default(""),

    password: isEditMode
      ? yup.string().default("")
      : yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),

    confirmPassword: isEditMode
      ? yup.string().default("")
      : yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password")], "Passwords do not match"),
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
      try {
        validateCloudinaryImageFile(file);
      } catch {
        error("Upload failed", CLOUDINARY_IMAGE_REQUIREMENT_TEXT);
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
        backgroundColor: "#f9f7f4",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isEditMode ? "24px" : "40px" }}>
        <h1
          style={{
            fontSize: isEditMode ? "32px" : "28px",
            fontWeight: "700",
            color: "#7F5539",
            margin: 0,
          }}
        >
          {isEditMode ? "Edit Customer" : "Create New Customer"}
        </h1>
        <p style={{ fontSize: "14px", color: "#9C6644", marginTop: "8px" }}>
          {isEditMode ? "Update customer information." : "Add a new customer with contact information."}
        </p>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <form id="customer-form" onSubmit={hookFormHandleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "24px",
              boxShadow: "0 4px 6px rgba(127, 85, 57, 0.08)",
              border: "1px solid #E6CCB2",
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
                    border: `1px solid ${errors.name ? "#dc3545" : "#d1d5db"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "white",
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
                    border: `1px solid ${errors.email ? "#dc3545" : "#d1d5db"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "white",
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
                    border: `1px solid ${errors.phone ? "#dc3545" : "#d1d5db"}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    backgroundColor: "white",
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
                      border: `1px solid ${errors.password ? "#dc3545" : "#d1d5db"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
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
                      border: `1px solid ${errors.confirmPassword ? "#dc3545" : "#d1d5db"}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      backgroundColor: "white",
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
                    border: "2px solid #E6CCB2",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#faf8f6",
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
                      border: "2px solid #E6CCB2",
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
                <>
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed #DDB892",
                      borderRadius: "8px",
                      padding: "32px 24px",
                      textAlign: "center",
                      backgroundColor: "#faf8f6",
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
                        e.currentTarget.style.borderColor = "#DDB892";
                        e.currentTarget.style.backgroundColor = "#faf8f6";
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
                        : "Supported: JPG, PNG, GIF"}
                    </p>
                  </div>
                  <p
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "12px",
                      color: "#6c757d",
                      textAlign: "center",
                    }}
                  >
                    {CLOUDINARY_IMAGE_REQUIREMENT_TEXT}
                  </p>
                </>
              )}
            </div>

            {/* Active Status - Create mode only, inline inside Basic Information card */}
            {!isEditMode && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "#faf8f6",
                  border: "1px solid #E6CCB2",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                    Active Status
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6c757d" }}>
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
            )}

            {/* Action Buttons - Edit mode only */}
            {isEditMode && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #E6CCB2",
                }}
              >
                <button
                  type="button"
                  onClick={() => onCancel ? onCancel() : navigate("/admin/customers")}
                  style={{
                    padding: "11px 24px",
                    border: "1px solid #DDB892",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "white",
                    color: "#7F5539",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                    e.currentTarget.style.borderColor = "#B08968";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#DDB892";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "11px 28px",
                    backgroundColor: isLoading ? "#B08968" : "#7F5539",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = "#9C6644";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = "#7F5539";
                  }}
                >
                  {isLoading ? "Saving..." : "Update Customer"}
                </button>
              </div>
            )}

            {/* Action Buttons - Create mode only */}
            {!isEditMode && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #E6CCB2",
                }}
              >
                <button
                  type="button"
                  onClick={() => onCancel ? onCancel() : navigate("/admin/customers")}
                  style={{
                    padding: "11px 24px",
                    border: "1px solid #DDB892",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "white",
                    color: "#7F5539",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#faf8f6";
                    e.currentTarget.style.borderColor = "#B08968";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#DDB892";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: "11px 28px",
                    backgroundColor: isLoading ? "#B08968" : "#7F5539",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = "#9C6644";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) e.currentTarget.style.backgroundColor = "#7F5539";
                  }}
                >
                  {isLoading ? "Creating..." : "Create Customer"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
