import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import OrdersTab from "./OrdersTab";
import MenuTab from "./MenuTab";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Nav */}
      <header className="bg-[#111111] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-0.5">
              <span className="font-display text-xl font-black text-white">FOOD</span>
              <span className="font-display text-xl font-black text-[#fa5631] italic">co.</span>
              <span className="ml-2 text-[10px] text-white/20 font-semibold tracking-widest uppercase border border-white/10 px-1.5 py-0.5">
                Admin
              </span>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {[
                {
                  key: "orders", label: "Orders",
                  icon: (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                    </svg>
                  )
                },
                {
                  key: "menu", label: "Menu",
                  icon: (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )
                },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all cursor-pointer border-none ${
                    activeTab === tab.key
                      ? "text-[#fa5631] bg-[#fa5631]/10"
                      : "text-white/40 bg-transparent hover:text-white"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs hidden sm:block">{admin?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs font-semibold transition-colors cursor-pointer bg-transparent border border-white/10 hover:border-white/30 px-3 py-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-[#fa5631] text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="w-6 h-px bg-[#fa5631]" />
            {activeTab === "orders" ? "Live Order Feed" : "Menu Management"}
          </div>
          <h1 className="font-display text-4xl font-black text-white">
            {activeTab === "orders" ? "Orders" : "Menu"}
          </h1>
        </div>

        {/* Tab content */}
        {activeTab === "orders" ? <OrdersTab /> : <MenuTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
