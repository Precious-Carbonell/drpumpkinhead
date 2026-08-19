import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, TrendingDown, Wallet, PieChart as PieChartIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

interface Expenditure {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

interface Summary {
  totalSpent: number;
  byCategory: Record<string, number>;
  count: number;
}

const CATEGORIES = ['Food', 'Personal', 'Family', 'Cats'];
const COLORS = ['#e8789a', '#f4a4b8', '#b8c9a3', '#d4a574'];

const emptyForm = { category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] };

export default function RevenueAllocation() {
  const [rows, setRows] = useState<Expenditure[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalSpent: 0, byCategory: {}, count: 0 });
  const [revenue, setRevenue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(0);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/expenditures`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
    fetch(`${API_URL}/api/expenditures/summary`, { headers }).then(r => r.json()).then(setSummary).catch(() => {});
    fetch(`${API_URL}/api/dashboard/stats`).then(r => r.json()).then(d => setRevenue(d.revenue || 0)).catch(() => {});
  };

  useEffect(load, []);

  const netRevenue = revenue - summary.totalSpent;

  const openNew = () => {
    setEditId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (e: Expenditure) => {
    setEditId(e.id);
    setForm({ category: e.category, description: e.description, amount: String(e.amount), date: e.date });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.category || !form.amount) return;
    const url = editId ? `${API_URL}/api/expenditures/${editId}` : `${API_URL}/api/expenditures`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expenditure?')) return;
    await fetch(`${API_URL}/api/expenditures/${id}`, { method: 'DELETE', headers });
    load();
  };

  // Pie chart data
  const pieData = Object.entries(summary.byCategory).map(([name, value]) => ({ name, value }));

  // Spending trend (group by week)
  const spendingTrend = (() => {
    const weeks: Record<string, number> = {};
    rows.forEach(r => {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + Number(r.amount);
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([_date, value], i) => ({ week: `Week ${i + 1}`, value }));
  })();

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / 5));
  const paginatedRows = rows.slice(page * 5, page * 5 + 5);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Revenue Expenditure</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> Add Expenditure</button>
      </div>

      {/* Stat Cards */}
      <div className="dash-stat-cards exp-stat-cards">
        <div className="dash-stat-card" style={{ backgroundColor: '#f8c8d4' }}>
          <div className="dash-stat-card-top">
            <span className="dash-stat-card-label">Total Revenue</span>
            <div className="dash-stat-card-icon"><Wallet size={18} /></div>
          </div>
          <span className="dash-stat-card-value">&#8369;{revenue.toLocaleString()}</span>
          <div className="dash-stat-card-wave"></div>
        </div>
        <div className="dash-stat-card" style={{ backgroundColor: '#f4a4b8' }}>
          <div className="dash-stat-card-top">
            <span className="dash-stat-card-label">Total Expenses</span>
            <div className="dash-stat-card-icon"><TrendingDown size={18} /></div>
          </div>
          <span className="dash-stat-card-value">&#8369;{summary.totalSpent.toLocaleString()}</span>
          <div className="dash-stat-card-wave"></div>
        </div>
        <div className="dash-stat-card" style={{ backgroundColor: '#b8c9a3' }}>
          <div className="dash-stat-card-top">
            <span className="dash-stat-card-label">Total Balance</span>
            <div className="dash-stat-card-icon"><PieChartIcon size={18} /></div>
          </div>
          <span className="dash-stat-card-value">&#8369;{netRevenue.toLocaleString()}</span>
          <div className="dash-stat-card-wave"></div>
        </div>
      </div>

      {/* Middle Row: Pie Chart + Spending Trend */}
      <div className="exp-charts-row">
        <div className="exp-chart-card">
          <h3>Budget Overview</h3>
          {pieData.length > 0 ? (
            <div className="exp-pie-layout">
              <div className="exp-pie-container">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="exp-pie-center">
                  <span className="exp-pie-total">&#8369;{summary.totalSpent.toLocaleString()}</span>
                  <span className="exp-pie-label">Total Expenses</span>
                </div>
              </div>
              <div className="exp-pie-legend">
                {pieData.map((item, i) => (
                  <div key={item.name} className="exp-legend-row">
                    <span className="exp-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="exp-legend-name">{item.name}</span>
                    <span className="exp-legend-pct">{summary.totalSpent > 0 ? Math.round((item.value / summary.totalSpent) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="chart-empty">No spending data yet</p>}
        </div>

        <div className="exp-chart-card">
          <h3>Spending Trend</h3>
          {spendingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,200,212,0.2)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a89494' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a89494' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `₱${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="value" stroke="#e8789a" strokeWidth={2.5} dot={{ fill: '#e8789a', r: 4 }} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="chart-empty">No trend data yet</p>}
        </div>
      </div>

      {/* Expenditures Table */}
      <div className="exp-table-card">
        <div className="dash-table-header">
          <h3>Expenditure Records</h3>
          <span className="dash-table-sub">{rows.length} total entries</span>
        </div>
        <div className="admin-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Notes</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>No expenditures recorded yet.</td></tr>
              ) : (
                paginatedRows.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span className="expenditure-category-badge">{e.category}</span></td>
                    <td>{e.description || '—'}</td>
                    <td className="cell-amount">&#8369;{Number(e.amount).toLocaleString()}</td>
                    <td className="actions">
                      <button onClick={() => openEdit(e)}><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(e.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="dash-table-pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            <span>{page + 1} / {totalPages}</span>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Expenditure' : 'Add Expenditure'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label>Notes</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What was this for?"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Amount (&#8369;)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn primary" onClick={handleSave}>
                {editId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
