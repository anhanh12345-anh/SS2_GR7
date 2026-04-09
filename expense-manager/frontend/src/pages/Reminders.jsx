import React, { useState, useEffect } from 'react';
import { reminderAPI } from '../services/api';
import { Card, Modal, Input, Select, Textarea, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';
import { formatDate, formatCurrency } from '../utils';
import { Plus, Pencil, Trash2, Bell, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'custom', dueDate: '', amount: '', isRecurring: false, recurringDay: 1 });

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await reminderAPI.getAll();
      setReminders(res.data.data);
    } catch { toast.error('Lỗi tải nhắc nhở'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReminders(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ title: item.title, description: item.description || '', type: item.type, dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '', amount: item.amount || '', isRecurring: item.isRecurring, recurringDay: item.recurringDay || 1 });
    } else {
      setEditItem(null);
      setForm({ title: '', description: '', type: 'custom', dueDate: '', amount: '', isRecurring: false, recurringDay: 1 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await reminderAPI.update(editItem._id, form);
        toast.success('Cập nhật thành công');
      } else {
        await reminderAPI.create(form);
        toast.success('Thêm nhắc nhở thành công');
      }
      setModalOpen(false);
      fetchReminders();
    } catch (err) { toast.error('Lỗi'); }
    finally { setSaving(false); }
  };

  const toggleComplete = async (reminder) => {
    try {
      await reminderAPI.update(reminder._id, { isCompleted: !reminder.isCompleted });
      fetchReminders();
    } catch { toast.error('Lỗi'); }
  };

  const handleDelete = async () => {
    try {
      await reminderAPI.delete(deleteId);
      toast.success('Xóa thành công');
      setDeleteId(null);
      fetchReminders();
    } catch { toast.error('Xóa thất bại'); }
  };

  const typeLabels = { daily: '📅 Hàng ngày', bill: '📄 Hóa đơn', custom: '🔔 Tùy chỉnh' };
  const typeColors = { daily: 'var(--accent)', bill: 'var(--amber)', custom: 'var(--cyan)' };

  const upcoming = reminders.filter(r => !r.isCompleted);
  const completed = reminders.filter(r => r.isCompleted);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>🔔 Nhắc Nhở</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Quản lý nhắc nhở và lịch thanh toán</p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>Thêm nhắc nhở</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Chưa hoàn thành ({upcoming.length})
          </h3>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }} />)}
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState title="Không có nhắc nhở nào" description="Thêm nhắc nhở để không bỏ lỡ thanh toán" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(r => {
                const isOverdue = r.dueDate && new Date(r.dueDate) < new Date();
                return (
                  <div key={r._id} style={{
                    background: 'var(--bg-card)', border: `1px solid ${isOverdue ? 'rgba(255,91,125,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '16px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <button onClick={() => toggleComplete(r)} style={{ background: 'none', border: `2px solid var(--border)`, borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', background: `${typeColors[r.type]}22`, color: typeColors[r.type] }}>
                          {typeLabels[r.type]}
                        </span>
                        {isOverdue && <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', background: 'var(--red-glow)', color: 'var(--red)' }}>Quá hạn</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {r.dueDate && <span>📅 {formatDate(r.dueDate)}</span>}
                        {r.amount > 0 && <span>💰 {formatCurrency(r.amount)}</span>}
                        {r.isRecurring && <span>🔄 Ngày {r.recurringDay} hàng tháng</span>}
                        {r.description && <span>📝 {r.description}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => openModal(r)} icon={<Pencil size={13} />} />
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(r._id)} icon={<Trash2 size={13} />} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Đã hoàn thành ({completed.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {completed.map(r => (
                  <div key={r._id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
                    <CheckCircle size={18} color="var(--green)" />
                    <span style={{ fontSize: '0.88rem', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{r.title}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      <Button variant="ghost" size="sm" onClick={() => toggleComplete(r)}>Khôi phục</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(r._id)} icon={<Trash2 size={12} />} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div>
          <Card>
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.9rem' }}>💡 Gợi ý</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔔', text: 'Đặt nhắc nhở cho hóa đơn điện nước hàng tháng' },
                { icon: '📅', text: 'Nhắc bản thân ghi chép chi tiêu hàng ngày' },
                { icon: '💳', text: 'Nhắc nhở ngày đáo hạn thẻ tín dụng' },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <span>{tip.icon}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Sửa nhắc nhở' : 'Thêm nhắc nhở'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Tiêu đề *" placeholder="Tên nhắc nhở" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <Select label="Loại" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="custom">🔔 Tùy chỉnh</option>
            <option value="daily">📅 Nhắc hàng ngày</option>
            <option value="bill">📄 Hóa đơn</option>
          </Select>
          <Input label="Ngày đến hạn" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Số tiền (nếu có)" type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <Textarea label="Ghi chú" placeholder="Chi tiết..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={e => setForm({ ...form, isRecurring: e.target.checked })} />
            <label htmlFor="recurring" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Lặp lại hàng tháng</label>
          </div>
          {form.isRecurring && (
            <Input label="Ngày lặp lại (1-31)" type="number" min="1" max="31" value={form.recurringDay} onChange={e => setForm({ ...form, recurringDay: Number(e.target.value) })} />
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Cập nhật' : 'Thêm'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Xóa nhắc nhở này?</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Reminders;
