import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../../store';
import {
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Tag,
  PieChart, Wallet, Bell, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/income', icon: ArrowUpCircle, label: 'Thu nhập' },
  { to: '/expenses', icon: ArrowDownCircle, label: 'Chi tiêu' },
  { to: '/categories', icon: Tag, label: 'Danh mục' },
  { to: '/budgets', icon: Wallet, label: 'Ngân sách' },
  { to: '/statistics', icon: PieChart, label: 'Thống kê' },
  { to: '/reports', icon: FileText, label: 'Báo cáo' },
  { to: '/reminders', icon: Bell, label: 'Nhắc nhở' },
  { to: '/debts', icon: ArrowDownCircle, label: 'Nợ nần' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: sidebarOpen ? 240 : 72,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarOpen ? '24px 20px' : '24px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        gap: 12,
      }}>
        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>
              <TrendingUp size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              FinanceFlow
            </span>
          </div>
        )}
        {!sidebarOpen && (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}>
            <TrendingUp size={18} color="#fff" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 4,
              color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(108,99,255,0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
              textDecoration: 'none',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.background.includes('108')) {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.style.background.includes('108')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'inherit' }} />
                {sidebarOpen && (
                  <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', border: '1px solid transparent',
            color: 'var(--text-secondary)', cursor: 'pointer',
            transition: 'all 0.2s', overflow: 'hidden', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-glow)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(255,91,125,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontSize: '0.875rem' }}>Đăng xuất</span>}
        </button>

        {sidebarOpen && user && (
          <div style={{
            marginTop: 8, padding: '10px 12px',
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', color: '#fff',
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
