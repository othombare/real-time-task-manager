import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api/auth";

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
