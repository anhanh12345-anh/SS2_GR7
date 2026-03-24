import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Input } from '../components/ui';
import Button from '../components/ui/Button';
import { Mail, TrendingUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20 }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px var(--accent-glow)' }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Quên mật khẩu</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Nhập email để nhận link đặt lại mật khẩu</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 8 }}>Email đã được gửi!</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Kiểm tra hộp thư của bạn</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Email" type="email" placeholder="email@example.com" icon={<Mail size={15} />} value={email} onChange={e => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} fullWidth>Gửi link đặt lại</Button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--accent-light)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
