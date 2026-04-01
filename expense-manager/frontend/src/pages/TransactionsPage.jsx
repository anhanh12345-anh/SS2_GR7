import React, { useState, useEffect, useCallback } from 'react';
import { transactionAPI, categoryAPI } from '../services/api';
import { Card, Modal, Input, Select, Textarea, Badge, EmptyState, Skeleton } from '../components/ui';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils';
import { Plus, Pencil, Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionsPage = ({ type }) => {
  const isIncome = type === 'income';
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type, amount: '', category: '', date: new Date().toISOString().split('T')[0], note: ''
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { type, page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [type, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    categoryAPI.getAll({ type }).then(res => setCategories(res.data.data)).catch(() => {});
  }, [type]);

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        type, amount: item.amount, category: item.category?._id || '',
        date: new Date(item.date).toISOString().split('T')[0], note: item.note || ''
      });
    } else {
      setEditItem(null);
      setForm({ type, amount: '', category: '', date: new Date().toISOString().split('T')[0], note: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await transactionAPI.update(editItem._id, form);
        toast.success('Cập nhật thành công');
      } else {
        await transactionAPI.create(form);
        toast.success('Thêm thành công');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await transactionAPI.delete(deleteId);
      toast.success('Xóa thành công');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const totalAmount = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
            {isIncome ? '💰 Thu Nhập' : '💸 Chi Tiêu'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Quản lý {isIncome ? 'thu nhập' : 'chi tiêu'} của bạn
          </p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>
          Thêm {isIncome ? 'thu nhập' : 'chi tiêu'}
        </Button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Tìm kiếm ghi chú..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '9px 14px 9px 36px', color: 'var(--text-primary)',
              fontSize: '0.88rem', outline: 'none',
            }}
          />
        </div>
        <Button variant="secondary" icon={<Filter size={14} />} onClick={() => setFiltersOpen(!filtersOpen)}>
          Lọc {filtersOpen && '▲'}
        </Button>
        {Object.values(filters).some(Boolean) && (
          <Button variant="ghost" icon={<X size={14} />} onClick={() => setFilters({ search: '', category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' })}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Select label="Danh mục" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </Select>
            <Input label="Từ ngày" type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
            <Input label="Đến ngày" type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
            <Input label="Số tiền tối thiểu" type="number" placeholder="0" value={filters.minAmount} onChange={e => setFilters({ ...filters, minAmount: e.target.value })} />
            <Input label="Số tiền tối đa" type="number" placeholder="0" value={filters.maxAmount} onChange={e => setFilters({ ...filters, maxAmount: e.target.value })} />
          </div>
        </Card>
      )}

      {/* Summary */}
      <div style={{
        padding: '14px 20px', marginBottom: 20,
        background: isIncome ? 'rgba(0,212,138,0.08)' : 'rgba(255,91,125,0.08)',
        border: `1px solid ${isIncome ? 'rgba(0,212,138,0.2)' : 'rgba(255,91,125,0.2)'}`,
        borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10,
      }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {pagination.total} giao dịch
        </span>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: isIncome ? 'var(--green)' : 'var(--red)' }}>
          {isIncome ? '+' : '-'}{formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <Skeleton key={i} height={64} />)}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={isIncome ? '💰' : '💸'}
            title={`Chưa có ${isIncome ? 'thu nhập' : 'chi tiêu'} nào`}
            description="Nhấn nút thêm để bắt đầu ghi chép"
            action={<Button onClick={() => openModal()} icon={<Plus size={14} />}>Thêm ngay</Button>}
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {['Danh mục', 'Số tiền', 'Ngày', 'Ghi chú', 'Thao tác'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5,
                        borderBottom: '1px solid var(--border)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={tx._id} style={{
                      borderBottom: idx < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            width: 34, height: 34, borderRadius: 10, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                          }}>{tx.category?.icon || '💰'}</span>
                          <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{tx.category?.name || 'Khác'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: isIncome ? 'var(--green)' : 'var(--red)' }}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.note || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button variant="ghost" size="sm" onClick={() => openModal(tx)} icon={<Pencil size={14} />} />
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(tx._id)} icon={<Trash2 size={14} />} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: 8, borderTop: '1px solid var(--border)' }}>
                <Button variant="secondary" size="sm" onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1} icon={<ChevronLeft size={14} />} />
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 12px' }}>
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.pages} icon={<ChevronRight size={14} />} />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? `Sửa ${isIncome ? 'thu nhập' : 'chi tiêu'}` : `Thêm ${isIncome ? 'thu nhập' : 'chi tiêu'}`}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Số tiền (VND) *"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            required
            min="0"
          />
          <Select
            label="Danh mục *"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input
            label="Ngày *"
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
          <Textarea
            label="Ghi chú"
            placeholder="Thêm ghi chú..."
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Cập nhật' : 'Thêm mới'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xác nhận xóa" size="sm">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="danger" onClick={handleDelete}>Xóa</Button>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
