import React from "react";
import { Outlet } from "react-router-dom";

const FranchiseSelectionLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#7f5539] text-4xl">
              local_cafe
            </span>
            <h1 className="text-[#7f5539] text-2xl font-bold tracking-tight">
              Brew Admin
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default FranchiseSelectionLayout;
