"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Providers from "@/components/Providers"; 

import { Toolbar } from '@mui/material';
import "../globals.css";
import "../../../public/styles/globals.css";
import "../../../public/styles/landing.css";
import "../../../public/styles/quiz.css";
export default function DashboardPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  return (
    <>      
            
              <Providers><div className="flex min-h-screen bg-gray-50">
          
           <div className="flex-1 flex flex-col">
             <Navbar onToggleSidebar={toggleSidebar} />
             <Toolbar></Toolbar>
             <div className="pt-16 p-4 md:p-8 flex-1">
              <div>
                <h1 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h1>
                
              </div>
             </div>
           </div>
            {/* Overlay para cerrar el menú en móvil */}
            {isSidebarOpen && (
             <div 
               className="md:hidden fixed inset-0 bg-black opacity-50 z-20"
               onClick={toggleSidebar}
             ></div>
           )}
         </div></Providers>
           
          </>
    
  );
}
