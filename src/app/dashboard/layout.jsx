"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";
import "../globals.css";
import "../../../public/styles/globals.css";
import "../../../public/styles/landing.css";
import "../../../public/styles/quiz.css";
import { Toolbar } from "@mui/material";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
   
        <Providers>
          <div className="flex min-h-screen bg-gray-50">
            {/* ✅ pasar props */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
              <Navbar onToggleSidebar={toggleSidebar} />
              <Toolbar />
              <main className="pt-16 p-4 md:p-8 flex-1">{children}</main>
            </div>
          </div>
        </Providers>
     
  );
}
