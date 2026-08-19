import { useEffect, useState } from 'react';
import { FileText, Clock, AlertCircle, DollarSign, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Stats { total: number; active: number; completed: number; pending: number; revenue: number; }
interface Commission { id: number; commission_status: string; payment_type: string; price: number; commission_type: string; date_created: string; mode_of_payment: string; client_social: string; }
interface AuditEntry { id: number; action: string; entity: string; entity_id: number; details: string; created_at: string; }
interface ExpSummary { totalSpent: number; byCategory: Record<string, number>; count: number; }

const COLORS = ['#e8789a', '#7a9e6a', '#d4a574', '#b8c9a3', '#f4a4b8', '#f8c8d4'];
const SOURCE_COLORS: Record<string, string> = { TikTok: '#e8789a', VGen: '#7a9e6a', Facebook: '#4a90d9', Other: '#d4a574' };
const STATUS_PROGRESS: Record<string, number> = { Waitlisted: 0, Queued: 0, Sketching: 25, Coloring: 60, Rendering: 85, Completed: 100 };
type RangeFilter = 'today' | 'week' | 'month' | '3months' | 'year';

function getRevenue(c: Commission): number {
  if (c.commission_status === 'Waitlisted') return 0;
  if (c.commission_status === 'Completed') return c.price;
  if (c.payment_type === 'Half') return c.price / 2;
  return c.price;
}

function getDateRange(filter: RangeFilter): { start: string; end: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (filter) {
    case 'today': return { start: fmt(today), end: fmt(today) };
    case 'week': { const ws = new Date(today); ws.setDate(today.getDate() - 7); return { start: fmt(ws), end: fmt(today) }; }
    case 'month': { const ms = new Date(today); ms.setDate(today.getDate() - 30); return { start: fmt(ms), end: fmt(today) }; }
    case '3months': { const sm = new Date(today); sm.setMonth(today.getMonth() - 3); return { start: fmt(sm), end: fmt(today) }; }
    case 'year': { const ys = new Date(today.getFullYear(), 0, 1); return { start: fmt(ys), end: fmt(today) }; }
  }
}

function filterByRange(items: Commission[], start: string, end: string) {
  return items.filter(c => {
    if (!c.date_created) return false;
    const d = c.date_created.slice(0, 10);
    return d >= start && d <= end;
  });
}

function detectCommPlatform(social: string): string {
  if (!social) return 'Other';
  const s = social.toLowerCase();
  if (s.includes('tiktok') || s.includes('tik tok') || s.includes('tt')) return 'TikTok';
  if (s.includes('vgen')) return 'VGen';
  if (s.includes('facebook') || s.includes('fb')) return 'Facebook';
  return 'Other';
}

function groupByDayPerPlatform(items: Commission[], start: string, end: string) {
  const grouped: Record<string, Record<string, number>> = {};
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0];
    grouped[key] = { TikTok: 0, VGen: 0, Facebook: 0, Other: 0 };
    current.setDate(current.getDate() + 1);
  }
  items.forEach(c => {
    if (!c.date_created) return;
    const key = c.date_created.slice(0, 10);
    if (key in grouped) {
      const platform = detectCommPlatform(c.client_social || '');
      grouped[key][platform] += getRevenue(c);
    }
  });
  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => ({
    date: date.slice(5),
    ...vals,
  } as { date: string; TikTok: number; VGen: number; Facebook: number; Other: number }));
}

function formatRangeLabel(filter: RangeFilter): string {
  const { start, end } = getDateRange(filter);
  const fmt = (s: string) => new Date(s + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (start === end) return fmt(start);
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0, pending: 0, revenue: 0 });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [expSummary, setExpSummary] = useState<ExpSummary>({ totalSpent: 0, byCategory: {}, count: 0 });
  const [clients, setClients] = useState<{ social_media: string }[]>([]);
  const [revenueRange, setRevenueRange] = useState<RangeFilter>('3months');
  const [commPage, setCommPage] = useState(0);
  const [recentCommPage, setRecentCommPage] = useState(0);
  const [heatmapOffset, setHeatmapOffset] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [statModal, setStatModal] = useState<string | null>(null);
  const [statModalPage, setStatModalPage] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/stats`).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/audit-log`).then(r => r.json()).then(setAuditLog).catch(() => {});
    const token = localStorage.getItem('token') || '';
    fetch(`${API_URL}/api/commissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCommissions).catch(() => {});
    fetch(`${API_URL}/api/expenditures/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d && typeof d.totalSpent === 'number') setExpSummary(d); }).catch(() => {});
    fetch(`${API_URL}/api/clients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setClients(d); }).catch(() => {});
  }, []);

  // Client source
  function detectPlatform(social: string): string {
    if (!social) return 'Other';
    const s = social.toLowerCase();
    if (s.includes('tiktok') || s.includes('tik tok') || s.includes('tt')) return 'TikTok';
    if (s.includes('vgen')) return 'VGen';
    if (s.includes('facebook') || s.includes('fb')) return 'Facebook';
    return 'Other';
  }

  const clientSourceCounts: Record<string, number> = {};
  clients.forEach(c => {
    const platform = detectPlatform(c.social_media);
    clientSourceCounts[platform] = (clientSourceCounts[platform] || 0) + 1;
  });
  const clientSourceData = Object.entries(clientSourceCounts).map(([name, value]) => ({ name, value }));
  const totalClients = clients.length;

  // Revenue chart
  const revRange = getDateRange(revenueRange);
  const revenueFiltered = filterByRange(commissions, revRange.start, revRange.end);
  const revenueByPlatform = groupByDayPerPlatform(revenueFiltered, revRange.start, revRange.end);
  const rangeRevenue = revenueFiltered.reduce((sum, c) => sum + getRevenue(c), 0);

  // Net
  const netRevenue = (stats.revenue || 0) - (expSummary.totalSpent || 0);

  // Stat cards
  const statCards = [
    { label: 'Total Commissions', value: stats.total, icon: <FileText size={18} />, bg: '#f8c8d4', filter: 'all', tooltip: 'Total number of commissions across all statuses' },
    { label: 'Active', value: stats.active, icon: <Clock size={18} />, bg: '#f4a4b8', filter: 'active', tooltip: 'Commissions currently in progress (Sketching, Coloring, or Rendering)' },
    { label: 'Waitlisted', value: stats.pending, icon: <AlertCircle size={18} />, bg: '#b8c9a3', filter: 'waitlisted', tooltip: 'Commissions waiting to be started' },
    { label: 'Net Revenue', value: `₱${netRevenue.toLocaleString()}`, icon: <DollarSign size={18} />, bg: '#d4e6c3', filter: 'net', tooltip: 'Total revenue minus all recorded expenditures' },
  ];

  // Audit helpers
  function getAuditIcon(action: string) {
    switch (action) { case 'CREATE': return <Plus size={12} />; case 'UPDATE': return <Pencil size={12} />; case 'DELETE': return <Trash2 size={12} />; default: return <FileText size={12} />; }
  }
  function getAuditColor(action: string) {
    switch (action) { case 'CREATE': return 'audit-create'; case 'UPDATE': return 'audit-update'; case 'DELETE': return 'audit-delete'; default: return ''; }
  }

  // Ongoing projects (active commissions only) - 1 per page
  const ongoingComms = commissions
    .filter(c => ['Sketching', 'Coloring', 'Rendering', 'Queued'].includes(c.commission_status))
    .sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''));
  const ongoingPages = Math.max(1, ongoingComms.length);
  const currentOngoing = ongoingComms[commPage] || null;

  // Recent commissions - 2 per page
  const recentComms = [...commissions].sort((a, b) => (b.date_created || '').localeCompare(a.date_created || ''));
  const recentCommPages = Math.max(1, Math.ceil(recentComms.length / 2));
  const paginatedRecent = recentComms.slice(recentCommPage * 2, recentCommPage * 2 + 2);

  // Monthly heat map data
  const heatmapData = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + heatmapOffset;
    const targetDate = new Date(year, month, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const firstDay = new Date(targetYear, targetMonth, 1);
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    // Count commissions per day
    const counts: Record<number, number> = {};
    commissions.forEach(c => {
      if (!c.date_created) return;
      const d = new Date(c.date_created);
      if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
        const day = d.getDate();
        counts[day] = (counts[day] || 0) + 1;
      }
    });

    const maxCount = Math.max(1, ...Object.values(counts));
    const cells: { date: string; count: number; intensity: number; empty: boolean }[] = [];

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: '', count: 0, intensity: 0, empty: true });
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const count = counts[day] || 0;
      let intensity = 0;
      if (count > 0) {
        const ratio = count / maxCount;
        if (ratio <= 0.25) intensity = 1;
        else if (ratio <= 0.5) intensity = 2;
        else if (ratio <= 0.75) intensity = 3;
        else intensity = 4;
      }
      const dateStr = `${firstDay.toLocaleString('en-US', { month: 'short' })} ${day}`;
      cells.push({ date: dateStr, count, intensity, empty: false });
    }

    return cells;
  })();

  const heatmapMonthLabel = (() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + heatmapOffset, 1);
    return target.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  })();

  const rangeButtons: RangeFilter[] = ['today', 'week', 'month', '3months', 'year'];
  const rangeLabels: Record<RangeFilter, string> = { today: 'Day', week: 'Week', month: 'Month', '3months': '3 Months', year: '1 Year' };

  return (
    <div className="admin-page dash-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="dash-stat-cards">
        {statCards.map(card => (
          <button key={card.label} type="button" className="dash-stat-card" style={{ backgroundColor: card.bg }} onClick={() => { setStatModal(card.filter); setStatModalPage(0); }}>
            <div className="dash-stat-card-top">
              <span className="dash-stat-card-label">{card.label}</span>
              <div className="dash-stat-card-icon">{card.icon}</div>
            </div>
            <span className="dash-stat-card-value">{card.value}</span>
            <div className="dash-stat-card-wave"></div>
            <span className="dash-stat-card-tooltip">{card.tooltip}</span>
          </button>
        ))}
      </div>

      {/* Hero Row: Revenue Summary + Chart | Client Source */}
      <div className="dash-hero-row">
        <div className="dash-hero">
          <div className="dash-hero-left">
            <p className="dash-hero-label">Current Revenue</p>
            <h2 className="dash-hero-value">&#8369;{rangeRevenue.toLocaleString()}</h2>
            <p className="dash-hero-sub">{formatRangeLabel(revenueRange)}</p>
            <div className="dash-hero-meta">
              <span><strong>{stats.total}</strong> Total Commissions</span>
              <span><strong>{stats.active}</strong> Active Now</span>
            </div>
          </div>

          <div className="dash-hero-chart">
            <div className="dash-range-tabs">
              {rangeButtons.map(r => (
                <button key={r} className={`dash-tab ${revenueRange === r ? 'active' : ''}`} onClick={() => setRevenueRange(r)}>
                  {rangeLabels[r]}
                </button>
              ))}
            </div>
            {revenueByPlatform.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueByPlatform}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a89494' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a89494' }} axisLine={false} tickLine={false} domain={[0, 3000]} ticks={[500, 1000, 2000, 3000]} />
                  <Tooltip formatter={(value, name) => [`₱${Number(value).toLocaleString()}`, name]} />
                  <Line type="monotone" dataKey="TikTok" stroke={SOURCE_COLORS.TikTok} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="VGen" stroke={SOURCE_COLORS.VGen} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Facebook" stroke={SOURCE_COLORS.Facebook} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Other" stroke={SOURCE_COLORS.Other} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="chart-empty">No revenue data for this range</p>}
            <div className="dash-chart-legend">
              <span><span className="dash-legend-dot" style={{ background: SOURCE_COLORS.TikTok }} /> TikTok</span>
              <span><span className="dash-legend-dot" style={{ background: SOURCE_COLORS.VGen }} /> VGen</span>
              <span><span className="dash-legend-dot" style={{ background: SOURCE_COLORS.Facebook }} /> Facebook</span>
              <span><span className="dash-legend-dot" style={{ background: SOURCE_COLORS.Other }} /> Other</span>
            </div>
          </div>
        </div>

        <div className="dash-source-card">
          <h3>Client Source</h3>
          {clientSourceData.length > 0 ? (
            <div className="dash-source-content">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={clientSourceData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" labelLine={false}>
                    {clientSourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} client${Number(value) !== 1 ? 's' : ''}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-source-legend">
                {clientSourceData.map((item, i) => (
                  <span key={item.name} className="dash-legend-item">
                    <span className="dash-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <strong>{totalClients > 0 ? Math.round((item.value / totalClients) * 100) : 0}%</strong> {item.name}
                  </span>
                ))}
              </div>
            </div>
          ) : <p className="chart-empty">No client data</p>}
        </div>
      </div>

      {/* Bottom Section: Activity Log + Commission Table */}
      <div className="dash-bottom">
        <div className="dash-bottom-left">
          <div className="audit-card">
            <div className="audit-card-header">
              <h3>Recent Activities</h3>
              <div className="audit-pagination">
                <button disabled={auditPage === 0} onClick={() => setAuditPage(p => p - 1)}>‹</button>
                <span>{auditPage + 1} / {Math.min(5, Math.max(1, Math.ceil(auditLog.length / 4)))}</span>
                <button disabled={auditPage + 1 >= Math.min(5, Math.ceil(auditLog.length / 4))} onClick={() => setAuditPage(p => p + 1)}>›</button>
              </div>
            </div>
            <div className="audit-list">
              {auditLog.length === 0 ? (
                <p className="chart-empty">No activity yet</p>
              ) : (
                auditLog.slice(auditPage * 4, auditPage * 4 + 4).map(entry => (
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
        </div>

        <div className="dash-bottom-right">
          {/* Ongoing Projects - 1 at a time with side arrows */}
          <div className="dash-table-card">
            <div className="dash-table-header">
              <h3>Ongoing Projects</h3>
              <span className="dash-table-sub">{ongoingComms.length} active</span>
            </div>
            <div className="ongoing-carousel">
              {ongoingComms.length > 1 && (
                <button className="ongoing-nav-btn" disabled={commPage === 0} onClick={() => setCommPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <div className="ongoing-projects-list">
                {!currentOngoing ? (
                  <p className="chart-empty">No ongoing projects</p>
                ) : (() => {
                  const c = currentOngoing;
                  const progress = STATUS_PROGRESS[c.commission_status] || 0;
                  const created = c.date_created ? new Date(c.date_created) : null;
                  const monthLabel = created ? created.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
                  const dayLabel = created ? created.getDate() : '';
                  return (
                    <div className="ongoing-project-card">
                      <div className="ongoing-project-top">
                        <div className="ongoing-project-info">
                          <h4 className="ongoing-project-title">{c.commission_type}</h4>
                          <p className="ongoing-project-desc">
                            {c.mode_of_payment} &middot; &#8369;{c.price.toLocaleString()}
                          </p>
                        </div>
                        {created && (
                          <div className="ongoing-project-date">
                            <span className="ongoing-date-month">{monthLabel}</span>
                            <span className="ongoing-date-day">{dayLabel}</span>
                          </div>
                        )}
                      </div>
                      <div className="ongoing-project-bottom">
                        <span className={`ongoing-status-badge ${c.commission_status === 'Sketching' ? 'status-sketching' : c.commission_status === 'Coloring' ? 'status-coloring' : c.commission_status === 'Rendering' ? 'status-rendering' : 'status-queued'}`}>
                          {c.commission_status}
                        </span>
                        <span className="ongoing-progress-pct">{progress}%</span>
                      </div>
                      <div className="ongoing-progress-bar">
                        <div className="ongoing-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              {ongoingComms.length > 1 && (
                <button className="ongoing-nav-btn" disabled={commPage + 1 >= ongoingPages} onClick={() => setCommPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
            {ongoingComms.length > 1 && (
              <div className="ongoing-dots">
                {ongoingComms.map((_, i) => (
                  <span key={i} className={`ongoing-dot ${i === commPage ? 'active' : ''}`} onClick={() => setCommPage(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Commissions - 2 per page */}
          <div className="dash-table-card">
            <div className="dash-table-header">
              <h3>Recent Commissions</h3>
              <span className="dash-table-sub">{commissions.length} total</span>
            </div>
            <div className="admin-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecent.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>No commissions</td></tr>
                  ) : (
                    paginatedRecent.map(c => (
                      <tr key={c.id}>
                        <td>{c.commission_type}</td>
                        <td>&#8369;{c.price.toLocaleString()}</td>
                        <td><span className={`badge ${c.commission_status === 'Completed' ? 'badge-green' : c.commission_status === 'Waitlisted' ? 'badge-muted' : ''}`}>{c.commission_status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {recentCommPages > 1 && (
              <div className="dash-table-pagination">
                <button disabled={recentCommPage === 0} onClick={() => setRecentCommPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <span>{recentCommPage + 1} / {recentCommPages}</span>
                <button disabled={recentCommPage + 1 >= recentCommPages} onClick={() => setRecentCommPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Heat Map */}
        <div className="dash-bottom-heatmap">
          <div className="dash-table-card heatmap-card">
            <div className="dash-table-header">
              <h3>Commission Heat Map</h3>
              <div className="heatmap-nav">
                <button className="ongoing-nav-btn" onClick={() => setHeatmapOffset(o => o - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <span className="dash-table-sub">{heatmapMonthLabel}</span>
                <button className="ongoing-nav-btn" disabled={heatmapOffset >= 0} onClick={() => setHeatmapOffset(o => o + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="heatmap-grid">
              <div className="heatmap-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <span key={d} className="heatmap-day-label">{d}</span>
                ))}
              </div>
              <div className="heatmap-cells">
                {heatmapData.map((cell, i) => (
                  <div
                    key={i}
                    className={`heatmap-cell ${cell.empty ? 'empty' : ''} intensity-${cell.intensity}`}
                    title={cell.empty ? '' : `${cell.date}: ${cell.count} commission${cell.count !== 1 ? 's' : ''}`}
                  >
                    {!cell.empty && cell.count > 0 && <span className="heatmap-cell-count">{cell.count}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="heatmap-legend">
              <span className="heatmap-legend-label">Less</span>
              <span className="heatmap-legend-cell intensity-0" />
              <span className="heatmap-legend-cell intensity-1" />
              <span className="heatmap-legend-cell intensity-2" />
              <span className="heatmap-legend-cell intensity-3" />
              <span className="heatmap-legend-cell intensity-4" />
              <span className="heatmap-legend-label">More</span>
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
        else if (statModal === 'waitlisted') { filtered = commissions.filter(c => c.commission_status === 'Waitlisted'); title = 'Waitlisted Commissions'; }
        else if (statModal === 'revenue') { filtered = commissions.filter(c => c.commission_status !== 'Waitlisted'); title = 'Revenue Records'; }
        else if (statModal === 'net') { filtered = []; title = `Net Revenue: ₱${netRevenue.toLocaleString()}`; }

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
                    <tr><th>ID</th><th>Type</th><th>Payment</th><th>Price</th><th>Status</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {paginated.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.commission_type}</td>
                        <td>{c.mode_of_payment}</td>
                        <td>&#8369;{c.price}</td>
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
