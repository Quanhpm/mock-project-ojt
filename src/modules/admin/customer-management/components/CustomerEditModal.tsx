import { useState, useEffect, useRef } from "react";
import { X, User, Info, Save, Upload } from "lucide-react";
import { useGetCustomer } from "./hooks/useGetCustomer";
import { useUpdateCustomer } from "./hooks/useUpdateCustomer";
import { useToast } from "@/hooks/use-toast.hook";
import axios from "axios";
import { ENV } from "@/config/env.config";

interface CustomerEditModalProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+84|0)(3[2-9]|5[2689]|7[06-9]|8\d|9\d)\d{7}$/;

export default function CustomerEditModal({
  customerId,
  isOpen,
  onClose,
  onSuccess,
}: CustomerEditModalProps) {
  const { customer, isLoading, fetchCustomer } = useGetCustomer();
  const { updateCustomer, isUpdating } = useUpdateCustomer();
  const { success, error: showError } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (isOpen && customerId) {
      void fetchCustomer(customerId);
    }
  }, [isOpen, customerId, fetchCustomer]);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setAvatarUrl(customer.avatar_url || null);
      setPreviewUrl(customer.avatar_url || "");
      setNameError("");
      setEmailError("");
      setPhoneError("");
    }
  }, [customer]);

  const validate = (): boolean => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    } else if (name.trim().length < 5) {
      setNameError("Name must be at least 5 characters");
      valid = false;
    } else if (name.includes("..")) {
      setNameError("Cannot contain consecutive dots");
      valid = false;
    } else {
      setNameError("");
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!phone) {
      setPhoneError("Phone number is required");
      valid = false;
    } else if (!PHONE_REGEX.test(phone)) {
      setPhoneError("Invalid phone number");
      valid = false;
    } else {
      setPhoneError("");
    }

    return valid;
  };

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
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const { secure_url } = response.data as { secure_url: string };
      setAvatarUrl(secure_url);
      setPreviewUrl(secure_url);
      success("Upload successful", "Avatar has been uploaded.");
    } catch (err) {
      showError(
        "Upload failed",
        err instanceof Error ? err.message : "Unable to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Invalid file", "Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", "Maximum file size is 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    void handleUploadImage(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!customer || !validate()) return;

    await updateCustomer(
      customer.id,
      {
        email,
        phone,
        name,
        avatar_url: avatarUrl,
      },
      () => {
        success("Customer updated", `"${name}" has been updated successfully.`);
        onSuccess?.();
        onClose();
      },
    );
  };

  const isBusy = isUpdating || isUploading;

  if (!isOpen) return null;

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "white",
    fontFamily: "inherit",
  });

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "16px",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
    display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#fdf3eb",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={22} color="#8B4513" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#212529",
                }}
              >
                Edit Customer
              </h2>
              {customer && (
                <p style={{ margin: 0, fontSize: "13px", color: "#6c757d" }}>
                  {customer.name} — {customer.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#6c757d",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {isLoading ? (
            <div
              style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}
            >
              Loading...
            </div>
          ) : !customer ? (
            <div
              style={{ textAlign: "center", padding: "48px 0", color: "#ef4444" }}
            >
              Customer not found
            </div>
          ) : (
            <>
              {/* Customer Details */}
              <div>
                <div style={sectionHeaderStyle}>
                  <User size={16} color="#8B4513" />
                  <span style={sectionLabelStyle}>Customer Details</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Full Name */}
                  <div>
                    <label style={fieldLabelStyle}>
                      Full Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter customer name"
                      style={inputStyle(!!nameError)}
                    />
                    {nameError ? (
                      <span style={errorStyle}>{nameError}</span>
                    ) : null}
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label style={fieldLabelStyle}>Avatar Image</label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isBusy}
                      style={{ display: "none" }}
                    />

                    {previewUrl ? (
                      /* Preview + actions */
                      <div
                        style={{
                          position: "relative",
                          border: "2px solid #E6CCB2",
                          borderRadius: "8px",
                          padding: "12px",
                          backgroundColor: "#faf8f6",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt="Avatar preview"
                          style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "2px solid #E6CCB2",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: "#212529" }}>
                            {isUploading ? "Uploading..." : "Avatar uploaded"}
                          </p>
                          <p style={{ margin: 0, fontSize: "11px", color: "#6c757d", wordBreak: "break-all" }}>
                            {avatarUrl || "(will be removed on save)"}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => !isBusy && fileInputRef.current?.click()}
                            disabled={isBusy}
                            style={{
                              padding: "5px 10px",
                              border: "1px solid #8B4513",
                              borderRadius: "6px",
                              backgroundColor: "white",
                              color: "#8B4513",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: isBusy ? "not-allowed" : "pointer",
                              opacity: isBusy ? 0.5 : 1,
                            }}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            disabled={isBusy}
                            style={{
                              padding: "5px 10px",
                              border: "1px solid #ef4444",
                              borderRadius: "6px",
                              backgroundColor: "white",
                              color: "#ef4444",
                              fontSize: "12px",
                              fontWeight: "500",
                              cursor: isBusy ? "not-allowed" : "pointer",
                              opacity: isBusy ? 0.5 : 1,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Upload area */
                      <div
                        onClick={() => !isBusy && fileInputRef.current?.click()}
                        style={{
                          border: "2px dashed #DDB892",
                          borderRadius: "8px",
                          padding: "24px",
                          textAlign: "center",
                          backgroundColor: "#faf8f6",
                          cursor: isBusy ? "not-allowed" : "pointer",
                          opacity: isBusy ? 0.6 : 1,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isBusy) e.currentTarget.style.borderColor = "#8B4513";
                        }}
                        onMouseLeave={(e) => {
                          if (!isBusy) e.currentTarget.style.borderColor = "#DDB892";
                        }}
                      >
                        <Upload size={32} style={{ color: "#8B4513", margin: "0 auto 8px" }} />
                        <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: "600", color: "#212529" }}>
                          Click to upload avatar
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#6c757d" }}>
                          JPG, PNG, GIF — max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div style={sectionHeaderStyle}>
                  <Info size={16} color="#8B4513" />
                  <span style={sectionLabelStyle}>Contact Information</span>
                </div>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
                >
                  {/* Email */}
                  <div>
                    <label style={fieldLabelStyle}>
                      Email <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      style={inputStyle(!!emailError)}
                    />
                    {emailError ? (
                      <span style={errorStyle}>{emailError}</span>
                    ) : null}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={fieldLabelStyle}>
                      Phone <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 123 456 789"
                      style={inputStyle(!!phoneError)}
                    />
                    {phoneError ? (
                      <span style={errorStyle}>{phoneError}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "12px",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                <Info
                  size={16}
                  color="#3b82f6"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                    Edit restrictions
                  </p>
                  <p style={{ margin: 0, color: "#1d4ed8" }}>
                    Password and active status cannot be changed here. Account
                    status can be toggled from the customer list.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              style={{
                padding: "10px 20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isBusy ? "not-allowed" : "pointer",
                backgroundColor: "white",
                color: "#374151",
                marginRight: "auto",
                opacity: isBusy ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isBusy || !customer}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                backgroundColor: isBusy ? "#c4956a" : "#8B4513",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isBusy || !customer ? "not-allowed" : "pointer",
              }}
            >
              <Save size={16} />
              {isUploading ? "Uploading..." : isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
