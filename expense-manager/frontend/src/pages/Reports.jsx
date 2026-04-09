import React, { useState } from 'react';
import { reportAPI } from '../services/api';
import { Card } from '../components/ui';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate, downloadBlob } from '../utils';
import { Download, FileText, Table } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const now = new Date();
  const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getReport({ startDate, endDate });
      setReport(res.data.data);
      toast.success('Tạo báo cáo thành công');
    } catch {
      toast.error('Lỗi tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await reportAPI.exportExcel({ startDate, endDate });
      downloadBlob(res.data, `bao-cao-${startDate}-${endDate}.xlsx`);
      toast.success('Xuất Excel thành công');
    } catch { toast.error('Xuất thất bại'); }
    finally { setExporting(false); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await reportAPI.exportPDF({ startDate, endDate });
      downloadBlob(res.data, `bao-cao-${startDate}-${endDate}.pdf`);
      toast.success('Xuất PDF thành công');
    } catch { toast.error('Xuất thất bại'); }
    finally { setExporting(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>📑 Báo Cáo</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Xuất và xem báo cáo tài chính</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Tạo Báo Cáo</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Từ ngày</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Đến ngày</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <Button onClick={handleGenerate} loading={loading} icon={<FileText size={15} />}>
            Tạo báo cáo
          </Button>
          {report && (
            <>
              <Button onClick={handleExportExcel} loading={exporting} variant="secondary" icon={<Table size={15} />}>
                Xuất Excel
              </Button>
              <Button onClick={handleExportPDF} loading={exporting} variant="secondary" icon={<Download size={15} />}>
                Xuất PDF
              </Button>
            </>
          )}
        </div>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Tổng thu nhập', value: report.summary.totalIncome, color: 'var(--green)' },
              { label: 'Tổng chi tiêu', value: report.summary.totalExpense, color: 'var(--red)' },
              { label: 'Số dư', value: report.summary.balance, color: report.summary.balance >= 0 ? 'var(--accent-light)' : 'var(--red)' },
              { label: 'Số giao dịch', value: `${report.summary.count} GD`, color: 'var(--amber)', isString: true },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 6, color: item.color }}>
                  {item.isString ? item.value : formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Transaction list */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Chi Tiết Giao Dịch</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(startDate)} → {formatDate(endDate)}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)' }}>
                    {['Loại', 'Danh mục', 'Số tiền', 'Ngày', 'Ghi chú'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.map((tx, i) => (
                    <tr key={tx._id} style={{ borderBottom: i < report.transactions.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, background: tx.type === 'income' ? 'var(--green-glow)' : 'var(--red-glow)', color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                          {tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                        {tx.category?.icon} {tx.category?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(tx.date)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {tx.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
