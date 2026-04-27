import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
    <div className="text-center">
      <p className="text-[#fa5631] font-black text-6xl font-display mb-4">404</p>
      <h1 className="text-white font-bold text-xl mb-2">Restaurant not found</h1>
      <p className="text-white/30 text-sm mb-8">The restaurant you're looking for doesn't exist or the link is incorrect.</p>
      <Link to="/" className="bg-[#fa5631] hover:bg-[#e04420] text-white font-semibold px-6 py-3 rounded-full transition-all no-underline text-sm">
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;
