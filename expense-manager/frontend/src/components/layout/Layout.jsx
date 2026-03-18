import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store';

const Layout = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 72,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 28px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
