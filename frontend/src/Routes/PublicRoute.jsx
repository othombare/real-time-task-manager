import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";

const PublicRoute = ({ children }) => {
  const { profile, loading } = useCurrentUser();

  // Show loading while checking authentication
  if (loading) {
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
  if (profile) {
    return <Navigate to="/dashboard" replace />;
  }

  // If no profile, show the public content (login/register)
  return children;
};

export default PublicRoute;
