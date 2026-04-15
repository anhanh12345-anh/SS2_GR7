import React, { useState } from 'react';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';
import { Card, Input } from '../components/ui';
import Button from '../components/ui/Button';
import { User, Lock, Bell, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', currency: user?.currency || 'VND' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sai mật khẩu hiện tại');
    } finally { setSavingPw(false); }
  };

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: <User size={15} /> },
    { key: 'password', label: 'Bảo mật', icon: <Lock size={15} /> },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading', fontSize: '2rem', fontWeight: 800 }}>Cài Đặt</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Quản lý tài khoản và tùy chọn</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div>
          <Card style={{ padding: '8px' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: '0 auto 10px',
                boxShadow: '0 8px 24px var(--accent-glow)',
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p style={{ fontWeight: 700 }}>{user?.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>

            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: activeTab === tab.key ? 'rgba(108,99,255,0.12)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent-light)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: activeTab === tab.key ? 600 : 400,
                fontSize: '0.875rem', marginBottom: 2, transition: 'all 0.2s',
              }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <Card>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>Thông tin cá nhân</h2>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 440 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</label>
                  <div style={{ marginTop: 6, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {user?.email}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Email không thể thay đổi</p>
                </div>
                <Input label="Họ và tên" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Nhập tên của bạn" />
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Đơn vị tiền tệ</label>
                  <select value={profileForm.currency} onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })} style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}>
                    <option value="VND">🇻🇳 VND - Việt Nam Đồng</option>
                    <option value="USD">🇺🇸 USD - US Dollar</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                  </select>
                </div>
                <Button type="submit" loading={savingProfile} style={{ alignSelf: 'flex-start' }}>
                  Lưu thay đổi
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 24 }}>Đổi mật khẩu</h2>
              <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 440 }}>
                <Input label="Mật khẩu hiện tại" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" required />
                <Input label="Mật khẩu mới" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Tối thiểu 6 ký tự" required />
                <Input label="Xác nhận mật khẩu mới" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu mới" required />
                <Button type="submit" loading={savingPw} style={{ alignSelf: 'flex-start' }}>
                  Đổi mật khẩu
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
