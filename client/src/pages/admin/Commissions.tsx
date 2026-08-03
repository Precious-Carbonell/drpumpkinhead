import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

const STATUS_PROGRESS: Record<string, number> = {
  'Waitlisted': 0, 'Queued': 0, 'Sketching': 25, 'Coloring': 60, 'Rendering': 85, 'Completed': 100,
};

const STATUS_OPTIONS = ['Waitlisted', 'Queued', 'Sketching', 'Coloring', 'Rendering', 'Completed'];
const PAYMENT_OPTIONS = ['Full', 'Half'];
const PROGRESS_BUCKETS = ['0%', '1–25%', '26–50%', '51–75%', '76–99%', '100%'];

function getDefaultDueDate() {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function getToday() { return new Date().toISOString().split('T')[0]; }

interface Commission {
  id: number; client_id: number; client_name: string; queue_number: number;
  commission_type: string; price: number; mode_of_payment: string; payment_type: string;
  commission_status: string; progress_percentage: number; date_created: string; due_date: string; remarks: string;
}

interface Client { id: number; full_name: string; }
interface PriceOption { id: number; category: string; commission_type: string; price_php: number; }

const PAGE_SIZE = 10;

const emptyForm = {
  client_id: 0, queue_number: 0, commission_type: '', customType: '', price: 0,
  mode_of_payment: '', payment_type: '',
  commission_status: 'Queued', progress_percentage: 0, due_date: getDefaultDueDate(),
  date_created: getToday(), remarks: '',
};

function matchesProgressBucket(progress: number, bucket: string): boolean {
  switch (bucket) {
    case '0%': return progress === 0;
    case '1–25%': return progress >= 1 && progress <= 25;
    case '26–50%': return progress >= 26 && progress <= 50;
    case '51–75%': return progress >= 51 && progress <= 75;
    case '76–99%': return progress >= 76 && progress <= 99;
    case '100%': return progress === 100;
    default: return true;
  }
}

export default function Commissions() {
  const [rows, setRows] = useState<Commission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [useCustomType, setUseCustomType] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPayment, setFilterPayment] = useState<string[]>([]);
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterProgress, setFilterProgress] = useState<string[]>([]);
  const [filterDueStart, setFilterDueStart] = useState('');
  const [filterDueEnd, setFilterDueEnd] = useState('');
  const [filterCreatedStart, setFilterCreatedStart] = useState('');
  const [filterCreatedEnd, setFilterCreatedEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/commissions`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
    fetch(`${API_URL}/api/clients`, { headers }).then(r => r.json()).then(setClients).catch(() => {});
    fetch(`${API_URL}/api/prices`, { headers }).then(r => r.json()).then(setPriceOptions).catch(() => {});
  };

  useEffect(load, []);

  // Distinct type values from data
  const distinctTypes = useMemo(() => [...new Set(rows.map(r => r.commission_type).filter(Boolean))].sort(), [rows]);

  // Filtered + searched data
  const filtered = useMemo(() => {
    let result = rows;

    // View mode filter
    if (viewMode === 'completed') {
      result = result.filter(c => c.commission_status === 'Completed');
    } else if (viewMode === 'ongoing') {
      result = result.filter(c => c.commission_status !== 'Completed');
    }

    // Global search (Client + Type)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.client_name?.toLowerCase().includes(q) ||
        c.commission_type?.toLowerCase().includes(q)
      );
    }

    // Column filters
    if (filterType.length > 0) {
      result = result.filter(c => filterType.includes(c.commission_type));
    }
    if (filterStatus.length > 0) {
      result = result.filter(c => filterStatus.includes(c.commission_status));
    }
    if (filterPayment.length > 0) {
      result = result.filter(c => filterPayment.includes(c.payment_type));
    }
    if (filterPriceMin) {
      result = result.filter(c => c.price >= Number(filterPriceMin));
    }
    if (filterPriceMax) {
      result = result.filter(c => c.price <= Number(filterPriceMax));
    }
    if (filterProgress.length > 0) {
      result = result.filter(c => filterProgress.some(b => matchesProgressBucket(c.progress_percentage, b)));
    }
    if (filterDueStart) {
      result = result.filter(c => c.due_date && c.due_date.slice(0, 10) >= filterDueStart);
    }
    if (filterDueEnd) {
      result = result.filter(c => c.due_date && c.due_date.slice(0, 10) <= filterDueEnd);
    }
    if (filterCreatedStart) {
      result = result.filter(c => c.date_created && c.date_created.slice(0, 10) >= filterCreatedStart);
    }
    if (filterCreatedEnd) {
      result = result.filter(c => c.date_created && c.date_created.slice(0, 10) <= filterCreatedEnd);
    }

    return result;
  }, [rows, search, viewMode, filterType, filterStatus, filterPayment, filterPriceMin, filterPriceMax, filterProgress, filterDueStart, filterDueEnd, filterCreatedStart, filterCreatedEnd]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Reset page when filters/search change
  useEffect(() => { setPage(0); }, [search, viewMode, filterType, filterStatus, filterPayment, filterPriceMin, filterPriceMax, filterProgress, filterDueStart, filterDueEnd, filterCreatedStart, filterCreatedEnd]);

  const openNew = () => { setEditId(null); setForm(emptyForm); setUseCustomType(false); setShowModal(true); };
  const openEdit = (c: Commission) => {
    setEditId(c.id);
    const isPreset = priceOptions.some(p => `${p.category} - ${p.commission_type}` === c.commission_type);
    setUseCustomType(!isPreset);
    setForm({
      client_id: c.client_id, queue_number: c.queue_number,
      commission_type: isPreset ? c.commission_type : '__custom__',
      customType: isPreset ? '' : c.commission_type,
      price: c.price, mode_of_payment: c.mode_of_payment, payment_type: c.payment_type,
      commission_status: c.commission_status, progress_percentage: c.progress_percentage,
      due_date: c.due_date || '', date_created: c.date_created || getToday(), remarks: c.remarks || '',
    });
    setShowModal(true);
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, commission_status: status, progress_percentage: STATUS_PROGRESS[status] ?? 0 });
  };

  const handleSave = async () => {
    const finalType = useCustomType ? form.customType : form.commission_type;
    const payload = { ...form, commission_type: finalType };
    const url = editId ? `${API_URL}/api/commissions/${editId}` : `${API_URL}/api/commissions`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify(payload) });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this commission?')) return;
    await fetch(`${API_URL}/api/commissions/${id}`, { method: 'DELETE', headers });
    load();
  };

  const getDisplayRevenue = (c: Commission) => {
    if (c.commission_status === 'Waitlisted') return 0;
    if (c.commission_status === 'Completed') return c.price;
    if (c.payment_type === 'Half') return c.price / 2;
    return c.price;
  };

  const toggleMulti = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const clearFilters = () => {
    setFilterType([]); setFilterStatus([]); setFilterPayment([]);
    setFilterPriceMin(''); setFilterPriceMax('');
    setFilterProgress([]);
    setFilterDueStart(''); setFilterDueEnd('');
    setFilterCreatedStart(''); setFilterCreatedEnd('');
  };

  const hasActiveFilters = filterType.length > 0 || filterStatus.length > 0 || filterPayment.length > 0 ||
    filterPriceMin || filterPriceMax || filterProgress.length > 0 ||
    filterDueStart || filterDueEnd || filterCreatedStart || filterCreatedEnd;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Commissions</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New</button>
      </div>

      {/* Search & Filter Toggle */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search client or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className={`filter-btn ${viewMode === 'ongoing' ? 'active' : ''}`} onClick={() => setViewMode(viewMode === 'ongoing' ? 'all' : 'ongoing')}>Ongoing</button>
          <button className={`filter-btn ${viewMode === 'completed' ? 'active' : ''}`} onClick={() => setViewMode(viewMode === 'completed' ? 'all' : 'completed')}>Completed</button>
          <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            Filters {hasActiveFilters && <span className="filter-count">{[filterType, filterStatus, filterPayment, filterProgress].filter(a => a.length > 0).length + (filterPriceMin || filterPriceMax ? 1 : 0) + (filterDueStart || filterDueEnd ? 1 : 0) + (filterCreatedStart || filterCreatedEnd ? 1 : 0)}</span>}
          </button>
          {hasActiveFilters && <button className="filter-btn" onClick={clearFilters}>Clear</button>}
        </div>
      </div>

      {/* Column Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Type</label>
            <div className="filter-chips">
              {distinctTypes.map(t => (
                <button key={t} className={`chip ${filterType.includes(t) ? 'active' : ''}`} onClick={() => setFilterType(toggleMulti(filterType, t))}>{t}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <div className="filter-chips">
              {STATUS_OPTIONS.map(s => (
                <button key={s} className={`chip ${filterStatus.includes(s) ? 'active' : ''}`} onClick={() => setFilterStatus(toggleMulti(filterStatus, s))}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Payment</label>
            <div className="filter-chips">
              {PAYMENT_OPTIONS.map(p => (
                <button key={p} className={`chip ${filterPayment.includes(p) ? 'active' : ''}`} onClick={() => setFilterPayment(toggleMulti(filterPayment, p))}>{p}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Price Range (₱)</label>
            <div className="filter-range">
              <input type="number" placeholder="Min" value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} />
              <span>–</span>
              <input type="number" placeholder="Max" value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <label>Progress</label>
            <div className="filter-chips">
              {PROGRESS_BUCKETS.map(b => (
                <button key={b} className={`chip ${filterProgress.includes(b) ? 'active' : ''}`} onClick={() => setFilterProgress(toggleMulti(filterProgress, b))}>{b}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Due Date</label>
            <div className="filter-range">
              <input type="date" value={filterDueStart} onChange={e => setFilterDueStart(e.target.value)} />
              <span>–</span>
              <input type="date" value={filterDueEnd} onChange={e => setFilterDueEnd(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <label>Created</label>
            <div className="filter-range">
              <input type="date" value={filterCreatedStart} onChange={e => setFilterCreatedStart(e.target.value)} />
              <span>–</span>
              <input type="date" value={filterCreatedEnd} onChange={e => setFilterCreatedEnd(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Q#</th><th>Client</th><th>Type</th><th>Price</th><th>Revenue</th><th>Status</th><th>Progress</th><th>Payment</th><th>Due</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={11} className="table-empty">No records match your filters</td></tr>
            ) : (
              paginated.map(c => (
                <tr key={c.id}>
                  <td>{c.queue_number}</td>
                  <td>{c.client_name}</td>
                  <td>{c.commission_type}</td>
                  <td>₱{c.price}</td>
                  <td>₱{getDisplayRevenue(c)}</td>
                  <td><span className="badge">{c.commission_status}</span></td>
                  <td>{c.progress_percentage}%</td>
                  <td>{c.payment_type || '—'}</td>
                  <td>{c.due_date || '—'}</td>
                  <td>{c.date_created || '—'}</td>
                  <td className="actions">
                    <button onClick={() => openEdit(c)}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
          <span className="pagination-info">Page {page + 1} of {totalPages} ({filtered.length} records)</span>
          <button className="pagination-btn" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Commission' : 'New Commission'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Client *</label>
                  <select value={form.client_id} onChange={e => setForm({ ...form, client_id: Number(e.target.value) })}>
                    <option value={0}>Select...</option>
                    {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.full_name}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Queue #</label>
                  <input type="number" value={form.queue_number} onChange={e => setForm({ ...form, queue_number: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Commission Type *</label>
                  {!useCustomType ? (
                    <select
                      value={form.commission_type}
                      onChange={e => {
                        if (e.target.value === '__custom__') { setUseCustomType(true); setForm({ ...form, commission_type: '__custom__' }); return; }
                        const selected = priceOptions.find(p => `${p.category} - ${p.commission_type}` === e.target.value);
                        setForm({ ...form, commission_type: e.target.value, price: selected ? selected.price_php : form.price });
                      }}
                    >
                      <option value="">Select type...</option>
                      {priceOptions.map(p => {
                        const label = `${p.category} - ${p.commission_type}`;
                        return <option key={p.id} value={label}>{label} (₱{p.price_php})</option>;
                      })}
                      <option value="__custom__">— Custom —</option>
                    </select>
                  ) : (
                    <div className="custom-type-row">
                      <input placeholder="Enter custom type" value={form.customType} onChange={e => setForm({ ...form, customType: e.target.value })} />
                      <button type="button" className="filter-btn" onClick={() => { setUseCustomType(false); setForm({ ...form, commission_type: '', customType: '' }); }}>Back</button>
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label>Price (₱) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Mode of Payment *</label>
                  <select value={form.mode_of_payment} onChange={e => setForm({ ...form, mode_of_payment: e.target.value })}>
                    <option value="">Select...</option>
                    <option>GCash</option>
                    <option>PayPal</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Type *</label>
                  <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Full</option>
                    <option>Half</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Commission Status *</label>
                  <select value={form.commission_status} onChange={e => handleStatusChange(e.target.value)}>
                    <option>Waitlisted</option>
                    <option>Queued</option>
                    <option>Sketching</option>
                    <option>Coloring</option>
                    <option>Rendering</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Progress %</label>
                  <input type="number" min={0} max={100} value={form.progress_percentage} readOnly className="readonly-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Date Created</label>
                  <input type="date" value={form.date_created} onChange={e => setForm({ ...form, date_created: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Remarks</label>
                <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={2} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
