import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store';

const Layout = () => {
  const { sidebarOpen } = useUIStore();

  // Theme state
  const [theme, setTheme] = useState("dark");

  // Load theme từ localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  //Apply theme vào HTML
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
  const root = document.documentElement;

  root.classList.add("theme-transition");

  setTheme(theme === "dark" ? "light" : "dark");

  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 400);
};

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 72,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        {/* Nút toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 28px 0' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 28px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;