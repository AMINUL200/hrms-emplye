import React, { useState, useEffect } from 'react';
import Navbar from '../component/common/Navbar';
import Sidebar from '../component/common/Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMediumScreen, setIsMediumScreen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMediumScreen(width >= 768 );
            setIsSmallScreen(width < 768);
            
            // Auto behavior based on screen size
            if (width < 768) {
                setSidebarOpen(false); // Closed by default on small screens
            } else if (width >= 768 && width < 1024) {
                setSidebarOpen(false); // Icons only on medium screens
            } else {
                setSidebarOpen(true); // Full sidebar on large screens
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        // Special behavior for medium screens: toggle between icons-only and full sidebar
        if (isMediumScreen) {
            setSidebarOpen(!sidebarOpen);
        } 
        // For small screens: toggle between closed and icons-only
        else if (isSmallScreen) {
            setSidebarOpen(!sidebarOpen);
        }
        // For large screens: normal toggle
        else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    return (
        <div className="app">
            <Navbar 
                toggleSidebar={toggleSidebar} 
                isOpen={sidebarOpen} 
                isMediumScreen={isMediumScreen}
                isSmallScreen={isSmallScreen}
            />
            <Sidebar 
                isOpen={sidebarOpen} 
                toggleSidebar={toggleSidebar} 
                isMediumScreen={isMediumScreen}
                isSmallScreen={isSmallScreen}
            />
            <div className={`main-content ${sidebarOpen && !isSmallScreen ? 'sidebar-open' : 'sidebar-collapsed'} ${isMediumScreen && !sidebarOpen ? 'sidebar-icons-only' : ''}`}>
                <Outlet />
            </div>
            {/* Overlay for mobile when sidebar is open */}
            {isSmallScreen && sidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}
        </div>
    );
};

export default MainLayout;