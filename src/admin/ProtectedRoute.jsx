import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
