import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { useAuthStore } from '../store';
import { StatCard, Card, Badge, Skeleton, EmptyState } from '../components/ui';
import { formatCurrency, formatDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Plus, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [monthStats, setMonthStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, statsRes] = await Promise.all([
          transactionAPI.getDashboard(),
          transactionAPI.getStats(),
        ]);
        setStats(dashRes.data.data);
        setMonthStats(statsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{getGreeting()},</p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, marginTop: 4 }}>
            {user?.name} 👋
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={() => navigate('/income')} icon={<ArrowUpCircle size={16} />} variant="success" size="sm">
            Thêm thu nhập
          </Button>
          <Button onClick={() => navigate('/expenses')} icon={<ArrowDownCircle size={16} />} variant="danger" size="sm">
            Thêm chi tiêu
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[1,2,3].map(i => <Skeleton key={i} height={120} borderRadius={16} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard
            title="Thu nhập tháng này"
            value={formatCurrency(stats?.totalIncome || 0)}
            icon={<ArrowUpCircle size={20} />}
            color="green"
            subtitle={`Tháng ${stats?.month}/${stats?.year}`}
          />
          <StatCard
            title="Chi tiêu tháng này"
            value={formatCurrency(stats?.totalExpense || 0)}
            icon={<ArrowDownCircle size={20} />}
            color="red"
            subtitle={`Tháng ${stats?.month}/${stats?.year}`}
          />
          <StatCard
            title="Số dư"
            value={formatCurrency(stats?.balance || 0)}
            icon={<TrendingUp size={20} />}
            color={(stats?.balance || 0) >= 0 ? 'accent' : 'red'}
            subtitle="Tháng này"
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Chart */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
            Thu Chi 6 Tháng Gần Nhất
          </h3>
          {loading ? <Skeleton height={220} /> : monthStats?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthStats.monthlyTrend} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Thu nhập" fill="#00d48a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi tiêu" fill="#ff5b7d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" title="Chưa có dữ liệu" />}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
              Giao Dịch Gần Đây
            </h3>
            <Link to="/expenses" style={{ fontSize: '0.8rem', color: 'var(--accent-light)' }}>Xem tất cả →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3,4,5].map(i => <Skeleton key={i} height={52} />)}
            </div>
          ) : stats?.recentTransactions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentTransactions.map(tx => (
                <div key={tx._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>{tx.category?.icon || '💸'}</span>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>{tx.category?.name || 'Khác'}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="📝" title="Chưa có giao dịch nào" description="Bắt đầu thêm thu chi của bạn" />
          )}
        </Card>
      </div>

      {/* Expense by Category */}
      {!loading && monthStats?.expenseByCategory && Object.keys(monthStats.expenseByCategory).length > 0 && (
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
            Chi Tiêu Theo Danh Mục Tháng Này
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(monthStats.expenseByCategory)
              .sort((a, b) => b[1].amount - a[1].amount)
              .slice(0, 6)
              .map(([name, data]) => {
                const pct = monthStats.totalExpense > 0 ? (data.amount / monthStats.totalExpense * 100).toFixed(1) : 0;
                return (
                  <div key={name} style={{
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)', borderRadius: 12,
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{data.icon} {name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: data.color || 'var(--accent)', borderRadius: 4 }} />
                    </div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: 8, color: 'var(--red)' }}>
                      {formatCurrency(data.amount)}
                    </p>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
