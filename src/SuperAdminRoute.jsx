import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./admin/AuthContext";

const SUPER_ADMIN_UID = import.meta.env.VITE_SUPER_ADMIN_UID;

const SuperAdminRoute = ({ children }) => {
  const { admin, authLoading } = useAuth();

  if (authLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
    </div>
  );

  if (!admin) return <Navigate to="/login" replace />;
  if (admin.uid !== SUPER_ADMIN_UID) return <Navigate to="/" replace />;

  return children;
};

export default SuperAdminRoute;
