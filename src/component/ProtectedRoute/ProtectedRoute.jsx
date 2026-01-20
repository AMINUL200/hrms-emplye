import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContex";

// ✅ Role-based access configuration
const ROLE_ROUTES = {
  guest: [
    "/organization/message-center",
    "/organization/employerprofile",
  ],

  employee: [
    "/organization", // full access
  ],

  admin: [
    "/organization",
  ],
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, data } = useContext(AuthContext);
  const location = useLocation();

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userType = data?.user_type || "employee"; // default employee

  const allowedRoutes = ROLE_ROUTES[userType];

  // ✅ If role is defined, check access
  if (allowedRoutes) {
    const isAllowed = allowedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (!isAllowed) {
      // redirect to first allowed route
      return <Navigate to={allowedRoutes[0]} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
