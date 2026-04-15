import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import { ListItemsAndTotalPriceProvider } from "./Context";
import { OrderProvider } from "./Context2";
import { AuthProvider } from "./admin/AuthContext";
import ProtectedRoute from "./admin/ProtectedRoute";
import SuperAdminRoute from "./SuperAdminRoute";
import { RestaurantProvider, useRestaurant } from "./context/RestaurantContext";

const Home = lazy(() => import("./pages/Home"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Suspended = lazy(() => import("./pages/Suspended"));

const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-white/10 border-t-[#fa5631] rounded-full animate-spin" />
      <span className="text-white/30 text-xs tracking-widest uppercase">
        Loading
      </span>
    </div>
  </div>
);

// Redirects to /suspended if account is suspended
const SuspendedGuard = ({ children }) => {
  const { suspended, loading } = useRestaurant();
  if (loading) return <PageLoader />;
  if (suspended) return <Suspended />;
  return children;
};

const RestaurantRoutes = () => {
  const { restaurantId } = useParams();
  return (
    <RestaurantProvider restaurantId={restaurantId}>
      <ListItemsAndTotalPriceProvider>
        <OrderProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <SuspendedGuard>
                    <Home />
                  </SuspendedGuard>
                }
              />
              <Route
                path="/menu"
                element={
                  <SuspendedGuard>
                    <MenuPage />
                  </SuspendedGuard>
                }
              />
              <Route
                path="/order"
                element={
                  <SuspendedGuard>
                    <OrderPage />
                  </SuspendedGuard>
                }
              />
              <Route path="/track/:orderId" element={<TrackOrder />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </OrderProvider>
      </ListItemsAndTotalPriceProvider>
    </RestaurantProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/superadmin"
              element={
                <SuperAdminRoute>
                  <SuperAdminDashboard />
                </SuperAdminRoute>
              }
            />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/:restaurantId/*" element={<RestaurantRoutes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
