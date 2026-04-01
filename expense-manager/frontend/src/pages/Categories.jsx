import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../services/api';
import { Card, Modal, Input, Select, Badge, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ICONS = ['💰','💼','🎁','💡','📈','🍔','🛍️','🚗','📄','🎮','🏥','📚','✈️','🏠','💸','☕','🎵','🏋️','🐾','💊','🎯','🎪','🧴','📱','💻'];
const COLORS = ['#6c63ff','#00d48a','#ff5b7d','#ffb347','#00c6ff','#f97316','#14b8a6','#ec4899','#84cc16','#8b5cf6','#f59e0b','#06b6d4','#10b981','#ef4444','#a855f7'];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'expense', icon: '💰', color: '#6c63ff' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data);
    } catch {
      toast.error('Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, type: item.type, icon: item.icon, color: item.color });
    } else {
      setEditItem(null);
      setForm({ name: '', type: activeTab, icon: '💰', color: '#6c63ff' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Vui lòng nhập tên'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem._id, form);
        toast.success('Cập nhật thành công');
      } else {
        await categoryAPI.create(form);
        toast.success('Thêm danh mục thành công');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoryAPI.delete(deleteId);
      toast.success('Xóa thành công');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const filtered = categories.filter(c => c.type === activeTab);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>🏷️ Danh Mục</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Quản lý danh mục thu và chi</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>Thêm danh mục</Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[{ key: 'expense', label: '💸 Chi tiêu' }, { key: 'income', label: '💰 Thu nhập' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
            background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
            color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === tab.key ? '0 4px 12px var(--accent-glow)' : 'none',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 80, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏷️" title="Chưa có danh mục" description="Thêm danh mục để phân loại giao dịch" action={<Button onClick={() => openModal()} icon={<Plus size={14} />}>Thêm ngay</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map(cat => (
            <div key={cat._id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${cat.color}22`,
                  border: `2px solid ${cat.color}44`,
                }}>
                  {cat.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat.name}</p>
                  {cat.isDefault && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mặc định</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button variant="ghost" size="sm" onClick={() => openModal(cat)} icon={<Pencil size={13} />} />
                {!cat.isDefault && <Button variant="danger" size="sm" onClick={() => setDeleteId(cat._id)} icon={<Trash2 size={13} />} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input label="Tên danh mục *" placeholder="Ví dụ: Ăn uống" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Select label="Loại" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="expense">Chi tiêu</option>
            <option value="income">Thu nhập</option>
          </Select>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Biểu tượng</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: '1.1rem',
                  background: form.icon === icon ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `2px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Màu sắc</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })} style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  border: `3px solid ${form.color === color ? '#fff' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: form.color === color ? `0 0 0 2px ${color}` : 'none',
                }} />
              ))}
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${form.color}22`, border: `2px solid ${form.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              {form.icon}
            </div>
            <span style={{ fontWeight: 600, color: form.color }}>{form.name || 'Tên danh mục'}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Xóa danh mục này? Chỉ xóa được danh mục chưa có giao dịch.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
