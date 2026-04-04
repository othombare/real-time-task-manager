import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { setLastProtectedRoute } from "../api/auth";
import { useCurrentUser } from "../hooks/useCurrentUser";

const ProtectedRoute = ({ children }) => {
  const { profile, loading } = useCurrentUser();
  const location = useLocation();

  useEffect(() => {
    if (!loading && profile) {
      setLastProtectedRoute(
        `${location.pathname}${location.search}${location.hash}`
      );
    }
  }, [loading, location.hash, location.pathname, location.search, profile]);

  // Show loading while validating authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If no profile after loading, redirect to login
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // If we have a profile, show the protected content
  return children;
};

export default ProtectedRoute;
