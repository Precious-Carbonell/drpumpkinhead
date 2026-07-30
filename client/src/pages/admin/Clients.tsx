import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

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

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/clients`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
  };

  useEffect(load, []);

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

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Clients</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Contact</th><th>Email</th><th>Social</th><th>Status</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
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
            ))}
          </tbody>
        </table>
      </div>

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
