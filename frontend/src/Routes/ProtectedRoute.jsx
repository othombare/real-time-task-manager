import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

const ProtectedRoute = ({ children }) => {
  const { profile, loading } = useCurrentUser();

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
