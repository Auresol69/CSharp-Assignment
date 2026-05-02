import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";


const MainLayout: React.FC = ({}) => {
  return (
    <div className="flex min-h-screen w-full bg-gray-200 dark:bg-gray-900"> 
        <Sidebar />
        
        <div className="flex flex-col w-full h-full ml-36 p-4 relative">
            <Outlet /> 
        </div>
    </div>
  );
};

export default MainLayout;
