import { useState, useEffect } from "react";
import { X, MapPin, Calendar, AlertCircle, Loader, Phone } from "lucide-react";
import { useGetFranchiseById } from "./hooks/useGetFranchiseById";
import { franchiseApi } from "../../../../apis/endpoints/franchise.api";
import type { UpdateFranchiseRequest } from "../../../../apis/endpoints/franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

interface FormData {
  id: number;
  code: string;
  name: string;
  hotline: string;
  logo_url: string;
  address: string;
  opened_at: string;
  closed_at: string | null;
  google_map_script: string;
  is_active: boolean;
}

interface FranchiseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchiseId: string | number | null;
  onSuccess?: () => void;
}

export default function FranchiseEditModal({
  isOpen,
  onClose,
  franchiseId,
  onSuccess,
}: FranchiseEditModalProps) {
  const { franchise, isLoading: isFetching, fetchFranchise } = useGetFranchiseById();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState<FormData>({
    id: 0,
    code: "",
    name: "",
    hotline: "",
    logo_url: "",
    address: "",
    opened_at: "",
    closed_at: null,
    google_map_script: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && franchiseId) {
      fetchFranchise(String(franchiseId));
      setFormErrors({});
      setApiError(null);
    }
  }, [isOpen, franchiseId, fetchFranchise]);

  // Format time properly if it comes as full ISO string or something else
  const extractTime = (timeStr: string | null | undefined): string => {
    if (!timeStr) return "";
    // If it's already HH:mm or HH:mm:ss, just return HH:mm
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }
    // If it's a date string, parse it
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return timeStr;
  };

  useEffect(() => {
    if (franchise && isOpen) {
      const f = franchise as any;
      setFormData({
        id: f.id ?? 0,
        code: f.code || "",
        name: f.name || "",
        hotline: f.hotline || "",
        logo_url: f.logo_url || "",
        address: f.address || "",
        opened_at: extractTime(f.opened_at) || "",
        closed_at: extractTime(f.closed_at) || null,
        google_map_script: f.google_map_script || "",
        is_active: f.is_active ?? true,
      });
    }
  }, [franchise, isOpen]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.code.trim()) errors.code = "Franchise Code is required";
    if (!formData.name.trim()) errors.name = "Franchise Name is required";
    if (!formData.hotline.trim()) errors.hotline = "Hotline is required";
    if (!formData.opened_at) errors.opened_at = "Open Time is required";
    if (!formData.closed_at) errors.closed_at = "Close Time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);
    setApiError(null);

    try {
      const payload: UpdateFranchiseRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        hotline: formData.hotline.trim(),
        opened_at: formData.opened_at,
        closed_at: formData.closed_at || "",
        logo_url: formData.logo_url.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      if (!franchiseId) throw new Error("Missing franchise ID");
      const result = await franchiseApi.updateFranchise(String(franchiseId), payload);
      if (result) {
        showSuccess?.("Franchise updated successfully!");
        onSuccess?.();
        onClose();
      } else {
        throw new Error("Update failed – server returned no data.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "An error occurred while updating.";
      setApiError(msg);
      showError?.(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    let newValue: any = value;
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const inputStyle = (errorKey?: string): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    border: errorKey && formErrors[errorKey] ? "1px solid #ef4444" : "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fem-backdrop" onClick={onClose}>
        <div className="fem-modal" onClick={(e) => e.stopPropagation()}>
          {/* HEADER */}
          <div className="fem-header">
            <div>
              <h2>Edit Franchise</h2>
              <p>ID: {franchiseId || formData.id}</p>
            </div>
            <button type="button" className="fem-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="fem-body">
            {isFetching ? (
              <div className="fem-loading">
                <Loader size={32} className="fem-spinner" />
                <p>Loading franchise data...</p>
              </div>
            ) : (
              <form id="edit-franchise-form" onSubmit={handleSubmit} className="fem-form">
                <div className="fem-grid">
                  {/* Left Column */}
                  <div className="fem-section">
                    <div className="fem-section-header">
                      <MapPin size={18} color="#8B4513" />
                      <h3>Basic Information</h3>
                    </div>

                    <div className="fem-row-2">
                      <div className="fem-field">
                        <label>Franchise Code <span className="fem-required">*</span></label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="FR_001" style={inputStyle("code")} />
                        {formErrors.code && <span className="fem-error-text">{formErrors.code}</span>}
                      </div>
                      <div className="fem-field">
                        <label>Franchise Name <span className="fem-required">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Hanoi Franchise" style={inputStyle("name")} />
                        {formErrors.name && <span className="fem-error-text">{formErrors.name}</span>}
                      </div>
                    </div>

                    <div className="fem-field">
                      <label><Phone size={13} style={{ display: "inline", marginRight: 4, transform: "translateY(2px)" }} /> Hotline <span className="fem-required">*</span></label>
                      <input type="text" name="hotline" value={formData.hotline} onChange={handleChange} placeholder="0123456789" style={inputStyle("hotline")} />
                      {formErrors.hotline && <span className="fem-error-text">{formErrors.hotline}</span>}
                    </div>

                    <div className="fem-field">
                      <label>Logo URL</label>
                      <input type="text" name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://example.com/logo.jpg" style={inputStyle()} />
                    </div>

                    <div className="fem-field">
                      <label>Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter franchise address"
                        style={{ ...inputStyle(), minHeight: "80px", fontFamily: "inherit", resize: "vertical" }}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="fem-section">
                    <div className="fem-section-header">
                      <Calendar size={18} color="#8B4513" />
                      <h3>Operating Period</h3>
                    </div>

                    <div className="fem-row-2">
                      <div className="fem-field">
                        <label>Open Time <span className="fem-required">*</span></label>
                        <input type="time" name="opened_at" value={formData.opened_at} onChange={handleChange} style={inputStyle("opened_at")} />
                        {formErrors.opened_at && <span className="fem-error-text">{formErrors.opened_at}</span>}
                      </div>
                      <div className="fem-field">
                        <label>Close Time <span className="fem-required">*</span></label>
                        <input type="time" name="closed_at" value={formData.closed_at || ""} onChange={handleChange} style={inputStyle("closed_at")} />
                        {formErrors.closed_at && <span className="fem-error-text">{formErrors.closed_at}</span>}
                      </div>
                    </div>

                    <div className="fem-field">
                      <label>Google Map Script</label>
                      <textarea
                        name="google_map_script"
                        value={formData.google_map_script || ""}
                        onChange={handleChange}
                        placeholder="Enter Google Map embed script"
                        style={{ ...inputStyle(), minHeight: "135px", fontFamily: "monospace", resize: "vertical" }}
                      />
                    </div>

                    <div className="fem-active-toggle">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        id="is_active_modal"
                      />
                      <label htmlFor="is_active_modal">Active Franchise</label>
                    </div>

                    {apiError && (
                      <div className="fem-api-error">
                        <AlertCircle size={18} />
                        <div>
                          <strong>Error</strong>
                          <p>{apiError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* FOOTER */}
          <div className="fem-footer">
            <button type="button" className="fem-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              form="edit-franchise-form" 
              className="fem-btn-submit" 
              disabled={isUpdating || isFetching}
            >
              {isUpdating ? "Saving..." : "Update Franchise"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .fem-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .fem-modal {
          width: 850px;
          max-height: 90vh;
          background: white;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
          animation: femFade 0.25s ease-out;
        }

        @keyframes femFade {
          from {
            transform: translateY(15px) scale(0.98);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .fem-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          border-radius: 16px 16px 0 0;
        }

        .fem-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #111827;
        }

        .fem-header p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #6b7280;
        }

        .fem-close {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .fem-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .fem-body {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }

        .fem-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          color: #6b7280;
        }

        .fem-spinner {
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
          color: #8B5A2B;
        }

        .fem-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .fem-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .fem-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .fem-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .fem-section-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .fem-field {
          display: flex;
          flex-direction: column;
        }

        .fem-field label {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #374151;
        }

        .fem-required {
          color: #ef4444;
        }

        .fem-error-text {
          font-size: 11px;
          color: #ef4444;
          margin-top: 6px;
        }

        .fem-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .fem-field input:focus, .fem-field textarea:focus {
          border-color: #8B5A2B !important;
          box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
        }

        .fem-active-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
        }

        .fem-active-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #8B5A2B;
          cursor: pointer;
        }

        .fem-active-toggle label {
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin: 0;
        }

        .fem-api-error {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          gap: 12px;
          color: #991b1b;
        }

        .fem-api-error strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .fem-api-error p {
          margin: 0;
          font-size: 13px;
          color: #b91c1c;
        }

        .fem-footer {
          padding: 20px 32px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }

        .fem-btn-cancel {
          padding: 10px 20px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fem-btn-cancel:hover {
          background: #f3f4f6;
        }

        .fem-btn-submit {
          padding: 10px 24px;
          background: #8B5A2B;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(139, 90, 43, 0.2);
        }

        .fem-btn-submit:hover:not(:disabled) {
          background: #7a4a1d;
          box-shadow: 0 4px 6px rgba(139, 90, 43, 0.3);
        }

        .fem-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
