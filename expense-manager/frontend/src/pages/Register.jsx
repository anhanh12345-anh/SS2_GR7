import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Input } from '../components/ui';
import Button from '../components/ui/Button';
import { User, Mail, Lock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Vui lòng nhập tên';
    if (!form.email) errs.email = 'Vui lòng nhập email';
    if (!form.password || form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register({ name: form.name, email: form.email, password: form.password });
    if (result.success) {
      toast.success('Đăng ký thành công! Chào mừng bạn 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{
        width: '100%', maxWidth: 460,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 40px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--accent-glow)',
            margin: '0 auto 16px',
          }}>
            <TrendingUp size={26} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
            Tạo tài khoản
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Bắt đầu hành trình quản lý tài chính
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Họ và tên"
            type="text"
            placeholder="Nguyễn Văn A"
            icon={<User size={15} />}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            icon={<Mail size={15} />}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            icon={<Lock size={15} />}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            icon={<Lock size={15} />}
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }}>
            Tạo tài khoản
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
