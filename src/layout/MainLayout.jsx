import React, { useState } from 'react';
import Navbar from '../component/common/Navbar';
import Sidebar from '../component/common/Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="app">
            <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;