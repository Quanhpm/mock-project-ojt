import { X, MapPin, Clock, Calendar, AlertCircle } from "lucide-react";
import type { Franchise } from "../../../../types/common.type";

interface FranchiseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function FranchiseDetailModal({
  isOpen,
  onClose,
  franchise,
  isLoading = false,
  error = null,
}: FranchiseDetailModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fdm-backdrop" onClick={onClose}>
        <div className="fdm-modal" onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="fdm-header">
            <div className="fdm-header-left">
              {franchise?.logo_url && (
                <img
                  src={franchise.logo_url}
                  alt={franchise.name}
                  className="fdm-logo"
                />
              )}

              <div>
                <h2>{franchise?.name || "Franchise Detail"}</h2>
                {franchise && <p>Code: {franchise.code}</p>}
              </div>
            </div>

            <button className="fdm-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="fdm-body">
            {isLoading && (
              <div className="fdm-loading">
                <div className="fdm-spinner"></div>
                <p>Loading data...</p>
              </div>
            )}

            {error && (
              <div className="fdm-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {franchise && !isLoading && !error && (
              <>
                {/* STATUS */}
                <div className="fdm-status-wrapper">
                  <span
                    className={
                      franchise.is_active
                        ? "fdm-status active"
                        : "fdm-status inactive"
                    }
                  >
                    {franchise.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* INFO GRID */}
                <div className="fdm-grid">
                  <div className="fdm-card">
                    <MapPin size={18} />
                    <div>
                      <label>Address</label>
                      <p>{franchise.address || "Not updated"}</p>
                    </div>
                  </div>

                  <div className="fdm-card">
                    <Clock size={18} />
                    <div>
                      <label>Open Time</label>
                      <p>
                        {franchise.opened_at || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="fdm-card">
                    <Clock size={18} />
                    <div>
                      <label>Close Time</label>
                      <p>
                        {franchise.closed_at || "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="fdm-card">
                    <Calendar size={18} />
                    <div>
                      <label>Created At</label>
                      <p>
                        {new Date(franchise.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="fdm-card">
                    <Calendar size={18} />
                    <div>
                      <label>Updated At</label>
                      <p>
                        {new Date(franchise.updated_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div className="fdm-footer">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      <style>{`

      .fdm-backdrop{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.55);
        backdrop-filter:blur(4px);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:999;
      }

      .fdm-modal{
        width:680px;
        max-height:85vh;
        background:white;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 30px 80px rgba(0,0,0,0.25);
        animation:fdmFade .25s ease;
      }

      @keyframes fdmFade{
        from{
          transform:translateY(10px);
          opacity:0;
        }
        to{
          transform:translateY(0);
          opacity:1;
        }
      }

      .fdm-header{
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:22px 26px;
        border-bottom:1px solid #eee;
        background:#fafafa;
      }

      .fdm-header-left{
        display:flex;
        gap:14px;
        align-items:center;
      }

      .fdm-logo{
        width:52px;
        height:52px;
        border-radius:12px;
        object-fit:cover;
        background:#f3f4f6;
      }

      .fdm-header h2{
        margin:0;
        font-size:18px;
      }

      .fdm-header p{
        margin:2px 0 0;
        font-size:13px;
        color:#777;
      }

      .fdm-close{
        background:none;
        border:none;
        cursor:pointer;
        color:#777;
      }

      .fdm-body{
        padding:26px;
      }

      .fdm-status-wrapper{
        margin-bottom:22px;
      }

      .fdm-status{
        padding:6px 14px;
        border-radius:30px;
        font-size:12px;
        font-weight:600;
      }

      .fdm-status.active{
        background:#dcfce7;
        color:#166534;
      }

      .fdm-status.inactive{
        background:#fee2e2;
        color:#991b1b;
      }

      .fdm-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:16px;
      }

      .fdm-card{
        display:flex;
        gap:10px;
        padding:14px 16px;
        border-radius:12px;
        border:1px solid #eee;
        background:#fafafa;
        transition:.15s;
      }

      .fdm-card:hover{
        transform:translateY(-2px);
        box-shadow:0 8px 20px rgba(0,0,0,0.08);
      }

      .fdm-card label{
        font-size:12px;
        color:#888;
        display:block;
      }

      .fdm-card p{
        margin:2px 0 0;
        font-size:14px;
      }

      .fdm-footer{
        border-top:1px solid #eee;
        padding:18px 26px;
        display:flex;
        justify-content:flex-start;
      }

      .fdm-footer button{
        padding:9px 22px;
        border-radius:8px;
        border:1px solid #ddd;
        background:#f5f5f5;
        cursor:pointer;
      }

      .fdm-loading{
        text-align:center;
      }

      .fdm-spinner{
        width:36px;
        height:36px;
        border:4px solid #eee;
        border-top:4px solid #8B4513;
        border-radius:50%;
        margin:auto;
        animation:spin 1s linear infinite;
      }

      .fdm-error{
        display:flex;
        gap:8px;
        background:#fee2e2;
        padding:12px;
        border-radius:8px;
        color:#991b1b;
      }

      @keyframes spin{
        to{transform:rotate(360deg)}
      }

      `}</style>
    </>
  );
}