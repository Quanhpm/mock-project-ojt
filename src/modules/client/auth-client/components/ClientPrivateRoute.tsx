import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ROUTER_URL } from "@/routes/router.const";

interface ClientPrivateRouteProps {
  element: React.ReactNode;
}

/**
 * ClientPrivateRoute - Protects routes that require authentication
 * 
 * - Redirects to login if user is not authenticated
 * - Shows loading state while checking authentication
 * - Preserves the attempted route for redirect after login
 */
export const ClientPrivateRoute: React.FC<ClientPrivateRouteProps> = ({
  element,
}) => {
  const { isLoggedIn, isInitialized } = useAuth();
  const location = useLocation();

  // Show nothing while initializing (or you could show a loading spinner)
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!isLoggedIn) {
    return (
      <Navigate
        to={ROUTER_URL.CLIENT_ROUTER?.LOGIN || "/client/login"}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is authenticated, render the protected content
  return <>{element}</>;
};

export default ClientPrivateRoute;
