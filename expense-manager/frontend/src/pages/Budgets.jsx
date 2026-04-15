import React, { useState, useEffect } from 'react';
import { budgetAPI, categoryAPI } from '../services/api';
import { Card, Modal, Input, Select, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';
import { formatCurrency, getMonthName } from '../utils';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Budgets = () => {
  const now = new Date();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', category: '', month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 80 });

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetAPI.getAll({ month, year });
      setBudgets(res.data.data);
    } catch { toast.error('Lỗi tải ngân sách'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);
  useEffect(() => {
    categoryAPI.getAll({ type: 'expense' }).then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, amount: item.amount, category: item.category?._id || '', month: item.month, year: item.year, alertThreshold: item.alertThreshold });
    } else {
      setEditItem(null);
      setForm({ name: '', amount: '', category: '', month, year, alertThreshold: 80 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) { toast.error('Vui lòng điền đầy đủ'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await budgetAPI.update(editItem._id, form);
        toast.success('Cập nhật thành công');
      } else {
        await budgetAPI.create(form);
        toast.success('Tạo ngân sách thành công');
      }
      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await budgetAPI.delete(deleteId);
      toast.success('Xóa thành công');
      setDeleteId(null);
      fetchBudgets();
    } catch { toast.error('Xóa thất bại'); }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>Ngân Sách</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Kiểm soát chi tiêu theo kế hoạch</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}>
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}>
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => openModal()} icon={<Plus size={16} />}>Thêm ngân sách</Button>
        </div>
      </div>

      {/* Overall progress */}
      {budgets.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 600 }}>Tổng quan tháng {month}/{year}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0, 100)}%`,
              background: totalSpent > totalBudget ? 'var(--red)' : 'var(--accent)',
              borderRadius: 5, transition: 'width 0.5s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Còn lại: {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
            </span>
            <span style={{ fontSize: '0.78rem', color: totalSpent > totalBudget ? 'var(--red)' : 'var(--text-muted)' }}>
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </Card>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 160, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }} />)}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState title="Chưa có ngân sách nào" description="Tạo ngân sách để kiểm soát chi tiêu" action={<Button onClick={() => openModal()} icon={<Plus size={14} />}>Tạo ngân sách</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {budgets.map(budget => {
            const pct = budget.percentage || 0;
            const barColor = budget.isOverBudget ? 'var(--red)' : budget.isNearLimit ? 'var(--amber)' : 'var(--green)';

            return (
              <div key={budget._id} style={{
                background: 'var(--bg-card)', border: `1px solid ${budget.isOverBudget ? 'rgba(255,91,125,0.3)' : budget.isNearLimit ? 'rgba(255,179,71,0.3)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{budget.category?.icon || '📦'}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{budget.name}</span>
                    </div>
                    {budget.category && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{budget.category.name}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {budget.isOverBudget && <AlertTriangle size={14} color="var(--red)" />}
                    {budget.isNearLimit && !budget.isOverBudget && <AlertTriangle size={14} color="var(--amber)" />}
                    {!budget.isOverBudget && !budget.isNearLimit && <CheckCircle size={14} color="var(--green)" />}
                    <Button variant="ghost" size="sm" onClick={() => openModal(budget)} icon={<Pencil size={12} />} />
                    <Button variant="danger" size="sm" onClick={() => setDeleteId(budget._id)} icon={<Trash2 size={12} />} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Đã dùng: <strong style={{ color: barColor }}>{formatCurrency(budget.spent || 0)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                </div>

                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Ngân sách: {formatCurrency(budget.amount)}</span>
                  <span style={{ color: budget.isOverBudget ? 'var(--red)' : 'var(--text-muted)' }}>
                    {budget.isOverBudget ? `Vượt ${formatCurrency((budget.spent || 0) - budget.amount)}` : `Còn ${formatCurrency(budget.amount - (budget.spent || 0))}`}
                  </span>
                </div>

                {(budget.isOverBudget || budget.isNearLimit) && (
                  <div style={{
                    marginTop: 10, padding: '6px 10px', borderRadius: 8,
                    background: budget.isOverBudget ? 'var(--red-glow)' : 'var(--amber-glow)',
                    fontSize: '0.75rem',
                    color: budget.isOverBudget ? 'var(--red)' : 'var(--amber)',
                  }}>
                    {budget.isOverBudget ? '⚠️ Đã vượt ngân sách!' : `⚠️ Sắp đạt giới hạn (${budget.alertThreshold}%)`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Sửa ngân sách' : 'Tạo ngân sách'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Tên ngân sách *" placeholder="VD: Chi tiêu ăn uống tháng 1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Số tiền tối đa (VND) *" type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" />
          <Select label="Danh mục (tùy chọn)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Tất cả chi tiêu</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Tháng" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>)}
            </Select>
            <Input label="Năm" type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Cảnh báo khi đạt {form.alertThreshold}%
            </label>
            <input type="range" min="50" max="100" value={form.alertThreshold} onChange={e => setForm({ ...form, alertThreshold: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Cập nhật' : 'Tạo ngân sách'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Bạn có chắc muốn xóa ngân sách này?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;
