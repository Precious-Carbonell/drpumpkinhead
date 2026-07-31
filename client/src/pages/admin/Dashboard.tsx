import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, DollarSign, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Stats { total: number; active: number; completed: number; pending: number; revenue: number; }
interface Commission { id: number; commission_status: string; payment_type: string; price: number; commission_type: string; date_created: string; }
interface AuditEntry { id: number; action: string; entity: string; entity_id: number; details: string; created_at: string; }

const COLORS = ['#e8789a', '#7a9e6a', '#d4a574', '#b8c9a3', '#f4a4b8', '#f8c8d4'];
type TimeFilter = 'daily' | 'weekly' | 'monthly';

// Revenue logic: half payment = price/2, full on completed
function getRevenue(c: Commission): number {
  if (c.commission_status === 'Completed') return c.price;
  if (c.payment_type === 'Half') return c.price / 2;
  return c.price;
}

function groupByPeriod(items: Commission[], period: TimeFilter, field: 'count' | 'revenue') {
  const grouped: Record<string, number> = {};
  items.forEach(c => {
    if (!c.date_created) return;
    let key = c.date_created;
    if (period === 'weekly') {
      const d = new Date(c.date_created);
      const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
      key = ws.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = c.date_created.slice(0, 7);
    }
    grouped[key] = (grouped[key] || 0) + (field === 'count' ? 1 : getRevenue(c));
  });
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0, pending: 0, revenue: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [revenueFilter, setRevenueFilter] = useState<TimeFilter>('daily');
  const [requestsFilter, setRequestsFilter] = useState<TimeFilter>('daily');

  // Currency converter
  const [rate, setRate] = useState<number>(56.5); // fallback rate
  const [converterInput, setConverterInput] = useState('');
  const [converterDir, setConverterDir] = useState<'php-to-usd' | 'usd-to-php'>('php-to-usd');
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/audit-log`).then(r => r.json()).then(setAuditLog).catch(() => {});
    const token = localStorage.getItem('token') || '';
    fetch(`${API_URL}/api/commissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCommissions).catch(() => {});
    fetchRate();
  }, []);

  const fetchRate = () => {
    setRateLoading(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (data.rates?.PHP) setRate(data.rates.PHP);
        setRateLoading(false);
      })
      .catch(() => setRateLoading(false));
  };

  const converted = (() => {
    const val = parseFloat(converterInput) || 0;
    if (converterDir === 'php-to-usd') return (val / rate).toFixed(2);
    return (val * rate).toFixed(2);
  })();

  const statCards = [
    { label: 'Total', value: stats.total, icon: <FileText size={18} />, color: '#e8789a' },
    { label: 'Active', value: stats.active, icon: <Clock size={18} />, color: '#7a9e6a' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle size={18} />, color: '#b8c9a3' },
    { label: 'Pending', value: stats.pending, icon: <AlertCircle size={18} />, color: '#d4a574' },
    { label: 'Revenue', value: `₱${stats.revenue.toLocaleString()}`, icon: <DollarSign size={18} />, color: '#f4a4b8' },
  ];

  const statusCounts: Record<string, number> = {};
  commissions.forEach(c => { statusCounts[c.commission_status] = (statusCounts[c.commission_status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Revenue: all commissions contribute (half=price/2, completed=full)
  const revenueData = groupByPeriod(commissions, revenueFilter, 'revenue');
  const requestsData = groupByPeriod(commissions, requestsFilter, 'count');

  function getAuditIcon(action: string) {
    switch (action) { case 'CREATE': return <Plus size={12} />; case 'UPDATE': return <Pencil size={12} />; case 'DELETE': return <Trash2 size={12} />; default: return <FileText size={12} />; }
  }
  function getAuditColor(action: string) {
    switch (action) { case 'CREATE': return 'audit-create'; case 'UPDATE': return 'audit-update'; case 'DELETE': return 'audit-delete'; default: return ''; }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="stats-grid compact">
        {statCards.map(card => (
          <div key={card.label} className="stat-card" style={{ '--accent': card.color } as React.CSSProperties}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-body">
        <div className="dashboard-left">
          <div className="charts-row">
            {/* Pie */}
            <div className="chart-card compact">
              <h3>Status Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data</p>}
            </div>

            {/* Revenue */}
            <div className="chart-card compact">
              <div className="chart-header">
                <h3>Revenue</h3>
                <div className="chart-filters">
                  {(['daily', 'weekly', 'monthly'] as TimeFilter[]).map(f => (
                    <button key={f} className={`filter-btn ${revenueFilter === f ? 'active' : ''}`} onClick={() => setRevenueFilter(f)}>{f[0].toUpperCase()}</button>
                  ))}
                </div>
              </div>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.2)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="value" stroke="#e8789a" strokeWidth={2} dot={{ fill: '#e8789a', r: 3 }} name="₱" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data</p>}
            </div>
          </div>

          {/* Requests */}
          <div className="chart-card compact">
            <div className="chart-header">
              <h3>Commission Requests</h3>
              <div className="chart-filters">
                {(['daily', 'weekly', 'monthly'] as TimeFilter[]).map(f => (
                  <button key={f} className={`filter-btn ${requestsFilter === f ? 'active' : ''}`} onClick={() => setRequestsFilter(f)}>{f[0].toUpperCase()}</button>
                ))}
              </div>
            </div>
            {requestsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={requestsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7a9e6a" radius={[4, 4, 0, 0]} name="Commissions" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="chart-empty">No data</p>}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="audit-card">
            <h3>Activity Log</h3>
            <div className="audit-list">
              {auditLog.length === 0 ? (
                <p className="chart-empty">No activity yet</p>
              ) : (
                auditLog.slice(0, 10).map(entry => (
                  <div key={entry.id} className={`audit-item ${getAuditColor(entry.action)}`}>
                    <div className="audit-icon-wrapper">{getAuditIcon(entry.action)}</div>
                    <div className="audit-content">
                      <span className="audit-action">{entry.action} <strong>{entry.entity}</strong> #{entry.entity_id}</span>
                      {entry.details && <span className="audit-details">{entry.details}</span>}
                      <span className="audit-time">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Currency Converter */}
          <div className="converter-card">
            <div className="converter-header">
              <h3>₱ ↔ $ Converter</h3>
              <button className="converter-refresh" onClick={fetchRate} title="Refresh rate">
                <RefreshCw size={12} className={rateLoading ? 'spin' : ''} />
              </button>
            </div>
            <p className="converter-rate">1 USD = ₱{rate.toFixed(2)}</p>
            <div className="converter-row">
              <input
                type="number"
                placeholder="Amount"
                value={converterInput}
                onChange={e => setConverterInput(e.target.value)}
                className="converter-input"
              />
              <select value={converterDir} onChange={e => setConverterDir(e.target.value as 'php-to-usd' | 'usd-to-php')} className="converter-select">
                <option value="php-to-usd">₱ → $</option>
                <option value="usd-to-php">$ → ₱</option>
              </select>
            </div>
            <div className="converter-result">
              {converterInput && (
                <span>{converterDir === 'php-to-usd' ? `$${converted} USD` : `₱${converted} PHP`}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
