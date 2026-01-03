import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="dashboard-main">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
