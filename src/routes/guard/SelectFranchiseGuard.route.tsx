import { Navigate, Outlet } from "react-router-dom";
import { ROUTER_URL } from "../router.const";
import {
  useAdminAuthStore,
  getRoleCode,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";

/**
 * Guard bắt buộc FRANCHISE user phải chọn franchise trước khi vào dashboard.
 * - Nếu user không có active_context VÀ không phải GLOBAL → redirect select-franchise
 * - GLOBAL scope không cần chọn franchise → pass through
 */
const SelectFranchiseGuard = () => {
  const store = useAdminAuthStore();
  const roleCode = getRoleCode(store);

  // Chưa đăng nhập → AdminGuard đã xử lý, không cần check lại
  if (!store.admin || !roleCode) return <Outlet />;

  // Đã chọn context rồi → pass through
  if (store.activeContext) return <Outlet />;

  // Kiểm tra có franchise role không
  const hasFranchiseRole = store.roles.some((r) => r.scope === "FRANCHISE");

  // Nếu KHÔNG có franchise role (chỉ có GLOBAL) → pass through
  if (!hasFranchiseRole) return <Outlet />;

  // Có franchise role NHƯNG chưa chọn → redirect sang trang chọn
  return (
    <Navigate
      to={`${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SELECT_FRANCHISE}`}
      replace
    />
  );
};

export default SelectFranchiseGuard;
