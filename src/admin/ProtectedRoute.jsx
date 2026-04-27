import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { admin, restaurantId, authLoading } = useAuth();
  const { restaurantId: urlRestaurantId } = useParams();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!admin) return <Navigate to="/login" replace />;

  // Logged in but trying to access a different restaurant's dashboard
  if (restaurantId && urlRestaurantId && restaurantId !== urlRestaurantId) {
    return <Navigate to={`/${restaurantId}/admin`} replace />;
  }

  return children;
};

export default ProtectedRoute;
