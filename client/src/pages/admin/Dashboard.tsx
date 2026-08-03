import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, DollarSign, Plus, Pencil, Trash2, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Stats { total: number; active: number; completed: number; pending: number; revenue: number; }
interface Commission { id: number; commission_status: string; payment_type: string; price: number; commission_type: string; date_created: string; mode_of_payment: string; }
interface AuditEntry { id: number; action: string; entity: string; entity_id: number; details: string; created_at: string; }

const COLORS = ['#e8789a', '#7a9e6a', '#d4a574', '#b8c9a3', '#f4a4b8', '#f8c8d4'];
type RangeFilter = 'today' | 'week' | 'month' | 'year' | 'custom';

function getRevenue(c: Commission): number {
  if (c.commission_status === 'Waitlisted') return 0;
  if (c.commission_status === 'Completed') return c.price;
  if (c.payment_type === 'Half') return c.price / 2;
  return c.price;
}

function getDateRange(filter: RangeFilter, customStart: string, customEnd: string): { start: string; end: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (filter) {
    case 'today': return { start: fmt(today), end: fmt(today) };
    case 'week': { const ws = new Date(today); ws.setDate(today.getDate() - today.getDay()); return { start: fmt(ws), end: fmt(today) }; }
    case 'month': { const ms = new Date(today.getFullYear(), today.getMonth(), 1); return { start: fmt(ms), end: fmt(today) }; }
    case 'year': { const ys = new Date(today.getFullYear(), 0, 1); return { start: fmt(ys), end: fmt(today) }; }
    case 'custom': return { start: customStart || fmt(today), end: customEnd || fmt(today) };
  }
}

function filterByRange(items: Commission[], start: string, end: string) {
  return items.filter(c => {
    if (!c.date_created) return false;
    const d = c.date_created.slice(0, 10); // normalize to YYYY-MM-DD
    return d >= start && d <= end;
  });
}

function groupByDay(items: Commission[], field: 'count' | 'revenue', start: string, end: string) {
  const grouped: Record<string, number> = {};

  // Fill all dates in range with 0
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    grouped[current.toISOString().split('T')[0]] = 0;
    current.setDate(current.getDate() + 1);
  }

  // Sum values per day
  items.forEach(c => {
    if (!c.date_created) return;
    const key = c.date_created.slice(0, 10);
    if (key in grouped) {
      grouped[key] += field === 'count' ? 1 : getRevenue(c);
    }
  });

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0, pending: 0, revenue: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [statModal, setStatModal] = useState<string | null>(null);
  const [statModalPage, setStatModalPage] = useState(0);

  // Filters
  const [revenueRange, setRevenueRange] = useState<RangeFilter>('month');
  const [revenueCustomStart, setRevenueCustomStart] = useState('');
  const [revenueCustomEnd, setRevenueCustomEnd] = useState('');
  const [requestsRange, setRequestsRange] = useState<RangeFilter>('month');
  const [requestsCustomStart, setRequestsCustomStart] = useState('');
  const [requestsCustomEnd, setRequestsCustomEnd] = useState('');
  const [paymentRange, setPaymentRange] = useState<RangeFilter>('month');
  const [paymentCustomStart, setPaymentCustomStart] = useState('');
  const [paymentCustomEnd, setPaymentCustomEnd] = useState('');

  // Converter
  const [rate, setRate] = useState<number>(56.5);
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
      .then(data => { if (data.rates?.PHP) setRate(data.rates.PHP); setRateLoading(false); })
      .catch(() => setRateLoading(false));
  };

  const converted = (() => {
    const val = parseFloat(converterInput) || 0;
    if (converterDir === 'php-to-usd') return (val / rate).toFixed(2);
    return (val * rate).toFixed(2);
  })();

  const statCards = [
    { label: 'Total', value: stats.total, icon: <FileText size={18} />, color: '#e8789a', filter: 'all' },
    { label: 'Active', value: stats.active, icon: <Clock size={18} />, color: '#7a9e6a', filter: 'active' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle size={18} />, color: '#b8c9a3', filter: 'completed' },
    { label: 'Waitlisted', value: stats.pending, icon: <AlertCircle size={18} />, color: '#d4a574', filter: 'waitlisted' },
    { label: 'Revenue', value: `₱${stats.revenue.toLocaleString()}`, icon: <DollarSign size={18} />, color: '#f4a4b8', filter: 'revenue' },
  ];

  // Status pie (no filter)
  const statusCounts: Record<string, number> = {};
  commissions.forEach(c => { statusCounts[c.commission_status] = (statusCounts[c.commission_status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Revenue chart
  const revRange = getDateRange(revenueRange, revenueCustomStart, revenueCustomEnd);
  const revenueFiltered = filterByRange(commissions, revRange.start, revRange.end);
  const revenueData = groupByDay(revenueFiltered, 'revenue', revRange.start, revRange.end);

  // Requests chart
  const reqRange = getDateRange(requestsRange, requestsCustomStart, requestsCustomEnd);
  const requestsFiltered = filterByRange(commissions, reqRange.start, reqRange.end);
  const requestsData = groupByDay(requestsFiltered, 'count', reqRange.start, reqRange.end);

  // Payment method pie
  const payRange = getDateRange(paymentRange, paymentCustomStart, paymentCustomEnd);
  const paymentFiltered = filterByRange(commissions, payRange.start, payRange.end);
  const paymentByMethod: Record<string, number> = {};
  paymentFiltered.forEach(c => {
    const method = c.mode_of_payment || 'Unknown';
    paymentByMethod[method] = (paymentByMethod[method] || 0) + getRevenue(c);
  });
  const paymentPieData = Object.entries(paymentByMethod).map(([name, value]) => ({ name, value }));

  function getAuditIcon(action: string) {
    switch (action) { case 'CREATE': return <Plus size={12} />; case 'UPDATE': return <Pencil size={12} />; case 'DELETE': return <Trash2 size={12} />; default: return <FileText size={12} />; }
  }
  function getAuditColor(action: string) {
    switch (action) { case 'CREATE': return 'audit-create'; case 'UPDATE': return 'audit-update'; case 'DELETE': return 'audit-delete'; default: return ''; }
  }

  const filterButtons: RangeFilter[] = ['today', 'week', 'month', 'year', 'custom'];
  const filterLabels: Record<RangeFilter, string> = { today: 'D', week: 'W', month: 'M', year: 'Y', custom: '⚙' };

  function RangeFilterBar({ value, onChange, customStart, customEnd, onStartChange, onEndChange }: {
    value: RangeFilter; onChange: (v: RangeFilter) => void;
    customStart: string; customEnd: string; onStartChange: (v: string) => void; onEndChange: (v: string) => void;
  }) {
    return (
      <div className="range-filter-bar">
        <div className="chart-filters">
          {filterButtons.map(f => (
            <button key={f} className={`filter-btn ${value === f ? 'active' : ''}`} onClick={() => onChange(f)} title={f}>{filterLabels[f]}</button>
          ))}
        </div>
        {value === 'custom' && (
          <div className="custom-range">
            <input type="date" value={customStart} onChange={e => onStartChange(e.target.value)} />
            <span>–</span>
            <input type="date" value={customEnd} onChange={e => onEndChange(e.target.value)} />
          </div>
        )}
      </div>
    );
  }

  function formatRange(start: string, end: string) {
    if (start === end) return start;
    return `${start} — ${end}`;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="stats-grid compact">
        {statCards.map(card => (
          <div key={card.label} className="stat-card clickable" style={{ '--accent': card.color } as React.CSSProperties} onClick={() => { setStatModal(card.filter); setStatModalPage(0); }}>
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
            <div className="chart-card compact">
              <h3>Status Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data</p>}
            </div>

            <div className="chart-card compact">
              <div className="chart-header">
                <h3>Revenue (₱)</h3>
                <RangeFilterBar value={revenueRange} onChange={setRevenueRange} customStart={revenueCustomStart} customEnd={revenueCustomEnd} onStartChange={setRevenueCustomStart} onEndChange={setRevenueCustomEnd} />
              </div>
              <p className="chart-range-label">{formatRange(revRange.start, revRange.end)}</p>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.2)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                    <Line type="monotone" dataKey="value" stroke="#e8789a" strokeWidth={2} dot={{ fill: '#e8789a', r: 4 }} name="₱" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data for this range</p>}
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card compact">
              <div className="chart-header">
                <h3>Commission Requests</h3>
                <RangeFilterBar value={requestsRange} onChange={setRequestsRange} customStart={requestsCustomStart} customEnd={requestsCustomEnd} onStartChange={setRequestsCustomStart} onEndChange={setRequestsCustomEnd} />
              </div>
              <p className="chart-range-label">{formatRange(reqRange.start, reqRange.end)}</p>
              {requestsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={requestsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.2)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7a9e6a" radius={[4, 4, 0, 0]} name="Commissions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data for this range</p>}
            </div>

            <div className="chart-card compact">
              <div className="chart-header">
                <h3>Revenue by Payment (₱)</h3>
                <RangeFilterBar value={paymentRange} onChange={setPaymentRange} customStart={paymentCustomStart} customEnd={paymentCustomEnd} onStartChange={setPaymentCustomStart} onEndChange={setPaymentCustomEnd} />
              </div>
              <p className="chart-range-label">{formatRange(payRange.start, payRange.end)}</p>
              {paymentPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {paymentPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="chart-empty">No data for this range</p>}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="audit-card">
            <div className="audit-card-header">
              <h3>Activity Log</h3>
              <div className="audit-pagination">
                <button disabled={auditPage === 0} onClick={() => setAuditPage(p => p - 1)}>‹</button>
                <span>{auditPage + 1}/{Math.max(1, Math.ceil(Math.min(auditLog.length, 9) / 3))}</span>
                <button disabled={(auditPage + 1) * 3 >= Math.min(auditLog.length, 9)} onClick={() => setAuditPage(p => p + 1)}>›</button>
              </div>
            </div>
            <div className="audit-list">
              {auditLog.length === 0 ? (
                <p className="chart-empty">No activity yet</p>
              ) : (
                auditLog.slice(auditPage * 3, auditPage * 3 + 3).map(entry => (
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

          <div className="converter-card">
            <div className="converter-header">
              <h3>Dollar and Peso Converter</h3>
              <button className="converter-refresh" onClick={fetchRate} title="Refresh rate">
                <RefreshCw size={12} className={rateLoading ? 'spin' : ''} />
              </button>
            </div>
            <p className="converter-rate">1 USD = ₱{rate.toFixed(2)}</p>
            <div className="converter-row">
              <input type="number" placeholder="Amount" value={converterInput} onChange={e => setConverterInput(e.target.value)} className="converter-input" />
              <select value={converterDir} onChange={e => setConverterDir(e.target.value as 'php-to-usd' | 'usd-to-php')} className="converter-select">
                <option value="php-to-usd">₱→$</option>
                <option value="usd-to-php">$→₱</option>
              </select>
            </div>
            <div className="converter-result">
              {converterInput && <span>{converterDir === 'php-to-usd' ? `$${converted} USD` : `₱${converted} PHP`}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Card Modal */}
      {statModal && (() => {
        let filtered: Commission[] = [];
        let title = '';
        if (statModal === 'all') { filtered = commissions; title = 'All Commissions'; }
        else if (statModal === 'active') { filtered = commissions.filter(c => ['Sketching', 'Coloring', 'Rendering'].includes(c.commission_status)); title = 'Active Commissions'; }
        else if (statModal === 'completed') { filtered = commissions.filter(c => c.commission_status === 'Completed'); title = 'Completed Commissions'; }
        else if (statModal === 'waitlisted') { filtered = commissions.filter(c => c.commission_status === 'Waitlisted'); title = 'Waitlisted Commissions'; }
        else if (statModal === 'revenue') { filtered = commissions.filter(c => c.commission_status !== 'Waitlisted'); title = 'Revenue Records'; }

        const totalPages = Math.max(1, Math.ceil(filtered.length / 5));
        const paginated = filtered.slice(statModalPage * 5, statModalPage * 5 + 5);

        return (
          <div className="modal-overlay" onClick={() => setStatModal(null)}>
            <div className="modal-card wide" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{title} ({filtered.length})</h3>
                <button onClick={() => setStatModal(null)}><X size={18} /></button>
              </div>
              <div className="modal-body" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Q#</th><th>Client</th><th>Type</th><th>Price</th><th>Status</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {paginated.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.commission_type}</td>
                        <td>{c.mode_of_payment}</td>
                        <td>₱{c.price}</td>
                        <td><span className="badge">{c.commission_status}</span></td>
                        <td>{c.date_created || '—'}</td>
                      </tr>
                    ))}
                    {paginated.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>No records</td></tr>}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                  <button className="pagination-btn" disabled={statModalPage === 0} onClick={() => setStatModalPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                  <span className="pagination-info">Page {statModalPage + 1} of {totalPages}</span>
                  <button className="pagination-btn" disabled={statModalPage + 1 >= totalPages} onClick={() => setStatModalPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
