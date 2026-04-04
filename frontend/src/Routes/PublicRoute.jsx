import { Navigate } from "react-router-dom";
import { getLastProtectedRoute } from "../api/auth";
import { useCurrentUser } from "../hooks/useCurrentUser";

const PublicRoute = ({ children, redirectAuthenticated = true }) => {
  const { profile, loading } = useCurrentUser();

  // Show loading while checking authentication
  if (loading && redirectAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we have a valid profile, redirect to dashboard
  if (profile && redirectAuthenticated) {
    return <Navigate to={getLastProtectedRoute()} replace />;
  }

  // If no redirect is needed, always show the public content.
  return children;
};

export default PublicRoute;
