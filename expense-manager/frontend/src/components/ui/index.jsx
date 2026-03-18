import React, { useEffect } from 'react';

// ── Card ──────────────────────────────────────────
export const Card = ({ children, className = '', onClick, hoverable }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      transition: 'all 0.2s',
      cursor: onClick ? 'pointer' : undefined,
      ...(hoverable && { cursor: 'pointer' }),
    }}
    onMouseEnter={e => { if (hoverable || onClick) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
    onMouseLeave={e => { if (hoverable || onClick) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}}
    className={className}
  >
    {children}
  </div>
);

// ── Input ──────────────────────────────────────────
export const Input = ({ label, error, icon, type = 'text', className = '', ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none'
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: icon ? '10px 14px 10px 38px' : '10px 14px',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; }}
        className={className}
        {...props}
      />
    </div>
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Select ──────────────────────────────────────────
export const Select = ({ label, error, children, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </label>
    )}
    <select
      style={{
        width: '100%',
        background: 'var(--bg-elevated)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </select>
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Textarea ──────────────────────────────────────────
export const Textarea = ({ label, error, rows = 3, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </label>
    )}
    <textarea
      rows={rows}
      style={{
        width: '100%',
        background: 'var(--bg-elevated)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'var(--font-body)',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'; }}
      {...props}
    />
    {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ── Badge ──────────────────────────────────────────
export const Badge = ({ children, color = 'accent' }) => {
  const colors = {
    accent: { bg: 'rgba(108,99,255,0.15)', color: 'var(--accent-light)' },
    green: { bg: 'var(--green-glow)', color: 'var(--green)' },
    red: { bg: 'var(--red-glow)', color: 'var(--red)' },
    amber: { bg: 'var(--amber-glow)', color: 'var(--amber)' },
    gray: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 600,
      background: c.bg, color: c.color,
    }}>
      {children}
    </span>
  );
};

// ── Modal ──────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 420, md: 560, lg: 740, xl: 900 };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: sizes[size],
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────
export const StatCard = ({ title, value, subtitle, icon, color = 'accent', trend }) => {
  const colors = {
    accent: { glow: 'var(--accent-glow)', bg: 'rgba(108,99,255,0.1)', text: 'var(--accent-light)' },
    green: { glow: 'var(--green-glow)', bg: 'rgba(0,212,138,0.1)', text: 'var(--green)' },
    red: { glow: 'var(--red-glow)', bg: 'rgba(255,91,125,0.1)', text: 'var(--red)' },
    amber: { glow: 'var(--amber-glow)', bg: 'rgba(255,179,71,0.1)', text: 'var(--amber)' },
  };
  const c = colors[color];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: `radial-gradient(circle at center, ${c.glow}, transparent)`,
        borderRadius: '50%', transform: 'translate(30%, -30%)',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {title}
          </p>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 6, color: 'var(--text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: c.text,
          }}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
          <span style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span style={{ color: 'var(--text-muted)' }}>so với tháng trước</span>
        </div>
      )}
    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────
export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, style = {} }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);

// ── Empty State ──────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '3rem', marginBottom: 16 }}>{icon}</div>
    <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>{title}</h3>
    {description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>{description}</p>}
    {action}
  </div>
);
