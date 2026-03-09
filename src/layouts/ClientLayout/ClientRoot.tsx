import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/modules/client/auth-client";

function ClientRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default ClientRoot;
