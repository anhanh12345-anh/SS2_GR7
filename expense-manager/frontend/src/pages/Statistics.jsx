import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { Card, Skeleton } from '../components/ui';
import { formatCurrency, getMonthName } from '../utils';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

const COLORS = ['#6c63ff','#00d48a','#ff5b7d','#ffb347','#00c6ff','#f97316','#14b8a6','#ec4899','#84cc16','#8b5cf6'];

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await transactionAPI.getStats({ month, year });
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [month, year]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>{payload[0].name}</p>
        <p style={{ color: payload[0].color, fontWeight: 600 }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  };

  const pieData = stats ? Object.entries(stats.expenseByCategory || {}).map(([name, data], i) => ({
    name, value: data.amount, color: COLORS[i % COLORS.length], icon: data.icon
  })) : [];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>Thống Kê</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>Phân tích tài chính chi tiết</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '8px 14px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
          }}>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '8px 14px', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none',
          }}>
            {[2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tổng thu nhập', value: stats?.totalIncome, color: 'var(--green)' },
          { label: 'Tổng chi tiêu', value: stats?.totalExpense, color: 'var(--red)' },
          { label: 'Số dư', value: stats?.balance, color: (stats?.balance || 0) >= 0 ? 'var(--accent-light)' : 'var(--red)' },
          { label: 'Số giao dịch', value: stats?.transactionCount, color: 'var(--amber)', isCount: true },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 24px',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{item.label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 8, color: item.color }}>
              {loading ? '...' : item.isCount ? (item.value || 0) : formatCurrency(item.value || 0)}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Pie chart */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
            Chi Tiêu Theo Danh Mục
          </h3>
          {loading ? <Skeleton height={280} /> : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Không có dữ liệu chi tiêu
            </div>
          )}
        </Card>

        {/* Monthly trend */}
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
            Xu Hướng Thu Chi
          </h3>
          {loading ? <Skeleton height={280} /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#00d48a" strokeWidth={2.5} dot={{ fill: '#00d48a', r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#ff5b7d" strokeWidth={2.5} dot={{ fill: '#ff5b7d', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>
          So Sánh Thu Chi Theo Tháng (Biểu đồ cột)
        </h3>
        {loading ? <Skeleton height={240} /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.monthlyTrend || []} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1e6).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Thu nhập" fill="#00d48a" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#ff5b7d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Category breakdown table */}
      {!loading && pieData.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            Chi Tiết Theo Danh Mục
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pieData.sort((a, b) => b.value - a.value).map((item, i) => {
              const pct = stats.totalExpense > 0 ? (item.value / stats.totalExpense * 100) : 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', minWidth: 120, color: 'var(--text-secondary)' }}>{item.name}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: 100, textAlign: 'right', color: 'var(--red)' }}>
                    {formatCurrency(item.value)}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 44, textAlign: 'right' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Statistics;
