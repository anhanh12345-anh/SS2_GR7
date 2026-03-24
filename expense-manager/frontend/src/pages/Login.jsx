import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Input } from '../components/ui';
import Button from '../components/ui/Button';
import { TrendingUp, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(0,212,138,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'none',
        flexDirection: 'column', justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,198,255,0.05) 100%)',
        borderRight: '1px solid var(--border)',
        '@media (min-width: 768px)': { display: 'flex' },
      }} className="login-panel">
        <div style={{ maxWidth: 480 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px var(--accent-glow)',
            }}>
              <TrendingUp size={24} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>
              FinanceFlow
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.8rem',
            fontWeight: 800, lineHeight: 1.2, marginBottom: 20,
          }}>
            Stay in control of your finances.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 40 }}>
            Track finances, plan budgets, and reach your financial goals.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📊', text: 'Biểu đồ thống kê trực quan' },
              { icon: '🎯', text: 'Quản lý ngân sách theo mục tiêu' },
              { icon: '🔔', text: 'Nhắc nhở chi tiêu thông minh' },
              { icon: '📤', text: 'Xuất báo cáo PDF & Excel' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 48px',
      }}>
        <div className="fade-in">
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
              Welcome back!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Sign in to manage your finances
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              icon={<Mail size={15} />}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={15} />}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--accent-light)' }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isLoading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don’t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
              Sign up now
            </Link>
          </div>

          {/* Demo hint */}
          <div style={{
            marginTop: 24, padding: 14,
            background: 'rgba(108,99,255,0.08)', borderRadius: 10,
            border: '1px solid rgba(108,99,255,0.2)',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Create a new account to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
