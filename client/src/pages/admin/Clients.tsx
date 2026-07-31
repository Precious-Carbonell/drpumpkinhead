import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

const STATUS_OPTIONS = ['active', 'inactive'];
const PAGE_SIZE = 10;

interface Client {
  id: number;
  full_name: string;
  contact_number: string;
  email: string;
  social_media: string;
  status: string;
  date_created: string;
}

const emptyForm = { full_name: '', contact_number: '', email: '', social_media: '', status: 'active' };

export default function Clients() {
  const [rows, setRows] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterSocial, setFilterSocial] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCreatedStart, setFilterCreatedStart] = useState('');
  const [filterCreatedEnd, setFilterCreatedEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/clients`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
  };

  useEffect(load, []);

  // Distinct social media values from data
  const distinctSocials = useMemo(() => [...new Set(rows.map(r => r.social_media).filter(Boolean))].sort(), [rows]);

  // Filtered + searched data
  const filtered = useMemo(() => {
    let result = rows;

    // Global search (Name, Email, Contact)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.contact_number?.toLowerCase().includes(q)
      );
    }

    // Column filters
    if (filterSocial.length > 0) {
      result = result.filter(c => filterSocial.includes(c.social_media));
    }
    if (filterStatus.length > 0) {
      result = result.filter(c => filterStatus.includes(c.status));
    }
    if (filterCreatedStart) {
      result = result.filter(c => c.date_created && c.date_created.slice(0, 10) >= filterCreatedStart);
    }
    if (filterCreatedEnd) {
      result = result.filter(c => c.date_created && c.date_created.slice(0, 10) <= filterCreatedEnd);
    }

    return result;
  }, [rows, search, filterSocial, filterStatus, filterCreatedStart, filterCreatedEnd]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Reset page when filters/search change
  useEffect(() => { setPage(0); }, [search, filterSocial, filterStatus, filterCreatedStart, filterCreatedEnd]);

  const openNew = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Client) => {
    setEditId(c.id);
    setForm({ full_name: c.full_name, contact_number: c.contact_number, email: c.email, social_media: c.social_media, status: c.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editId ? `${API_URL}/api/clients/${editId}` : `${API_URL}/api/clients`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this client?')) return;
    await fetch(`${API_URL}/api/clients/${id}`, { method: 'DELETE', headers });
    load();
  };

  const toggleMulti = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const clearFilters = () => {
    setFilterSocial([]); setFilterStatus([]);
    setFilterCreatedStart(''); setFilterCreatedEnd('');
  };

  const hasActiveFilters = filterSocial.length > 0 || filterStatus.length > 0 ||
    filterCreatedStart || filterCreatedEnd;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Clients</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New</button>
      </div>

      {/* Search & Filter Toggle */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search name, email, or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button className={`filter-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            Filters {hasActiveFilters && <span className="filter-count">{[filterSocial, filterStatus].filter(a => a.length > 0).length + (filterCreatedStart || filterCreatedEnd ? 1 : 0)}</span>}
          </button>
          {hasActiveFilters && <button className="filter-btn" onClick={clearFilters}>Clear</button>}
        </div>
      </div>

      {/* Column Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Social</label>
            <div className="filter-chips">
              {distinctSocials.map(s => (
                <button key={s} className={`chip ${filterSocial.includes(s) ? 'active' : ''}`} onClick={() => setFilterSocial(toggleMulti(filterSocial, s))}>{s}</button>
              ))}
              {distinctSocials.length === 0 && <span className="filter-empty">No values</span>}
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
              <th>ID</th><th>Name</th><th>Contact</th><th>Email</th><th>Social</th><th>Status</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="table-empty">No records match your filters</td></tr>
            ) : (
              paginated.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.full_name}</td>
                  <td>{c.contact_number}</td>
                  <td>{c.email}</td>
                  <td>{c.social_media}</td>
                  <td><span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-muted'}`}>{c.status}</span></td>
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
              <h3>{editId ? 'Edit Client' : 'New Client'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Contact Number</label>
                  <input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Social Media</label>
                  <input value={form.social_media} onChange={e => setForm({ ...form, social_media: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
