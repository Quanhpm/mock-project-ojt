import { useEffect } from "react";
import { useClientAuthStore } from "@/modules/client/auth-client/stores/client-auth.store";
import AuthClientLayout from "../AuthClientLayout/AuthClientLayout";
import ClientLayout from "../ClientLayout/ClientLayout";

const DynamicClientLayout = () => {
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
  const hydrate = useClientAuthStore((state) => state.hydrate);

  // Khôi phục trạng thái đăng nhập từ localStorage khi component mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  

  // Nếu đã đăng nhập → ClientLayout (có icon user)
  // Nếu chưa đăng nhập → AuthClientLayout (có nút đăng nhập/đăng ký)
  return isLoggedIn ? <ClientLayout /> : <AuthClientLayout />;
};

export default DynamicClientLayout;

// if (isLoggedIn) { API.GETUSERINFO.DATA } ? CLIENTLAYOUT : AUTHCLIENTLAYOUT