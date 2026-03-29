import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import { ListItemsAndTotalPriceProvider } from "./Context";
import { OrderProvider } from "./Context2";
import { AuthProvider } from "./admin/AuthContext";
import ProtectedRoute from "./admin/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

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

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListItemsAndTotalPriceProvider>
          <OrderProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Customer-facing routes */}
                <Route
                  path="/"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <NavBar />
                      <Home />
                    </div>
                  }
                />
                <Route
                  path="/menu"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <NavBar />
                      <MenuPage />
                    </div>
                  }
                />
                <Route
                  path="/order"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <OrderPage />
                    </div>
                  }
                />

                {/* Order tracking */}
                <Route
                  path="/track/:orderId"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <TrackOrder />
                    </div>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/login"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <AdminLogin />
                    </div>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <div className="antialiased bg-[#0a0a0a] text-white overflow-x-hidden">
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </OrderProvider>
        </ListItemsAndTotalPriceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
