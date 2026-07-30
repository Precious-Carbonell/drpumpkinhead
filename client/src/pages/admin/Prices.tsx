import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

interface Price {
  id: number;
  category: string;
  commission_type: string;
  description: string;
  price_php: number;
  price_usd: number;
  turnaround_days: number;
}

const emptyForm = { category: '', commission_type: '', description: '', price_php: 0, price_usd: 0, turnaround_days: 7 };

export default function Prices() {
  const [rows, setRows] = useState<Price[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/prices`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
  };

  useEffect(load, []);

  const openNew = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Price) => {
    setEditId(p.id);
    setForm({ category: p.category, commission_type: p.commission_type, description: p.description, price_php: p.price_php, price_usd: p.price_usd, turnaround_days: p.turnaround_days });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editId ? `${API_URL}/api/prices/${editId}` : `${API_URL}/api/prices`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this price?')) return;
    await fetch(`${API_URL}/api/prices/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Price List</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th><th>Type</th><th>Description</th><th>₱ PHP</th><th>$ USD</th><th>TAT (days)</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id}>
                <td>{p.category}</td>
                <td>{p.commission_type}</td>
                <td>{p.description}</td>
                <td>₱{p.price_php}</td>
                <td>${p.price_usd}</td>
                <td>{p.turnaround_days}</td>
                <td className="actions">
                  <button onClick={() => openEdit(p)}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
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
              <h3>{editId ? 'Edit Price' : 'New Price'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Solo</option>
                    <option>Couple / Duo</option>
                    <option>Chibi</option>
                    <option>Tweening</option>
                    <option>Frame by Frame</option>
                    <option>Tweening + FbF</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Commission Type</label>
                  <input value={form.commission_type} onChange={e => setForm({ ...form, commission_type: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Price (₱ PHP)</label>
                  <input type="number" value={form.price_php} onChange={e => setForm({ ...form, price_php: Number(e.target.value) })} />
                </div>
                <div className="form-field">
                  <label>Price ($ USD)</label>
                  <input type="number" value={form.price_usd} onChange={e => setForm({ ...form, price_usd: Number(e.target.value) })} />
                </div>
                <div className="form-field">
                  <label>TAT (days)</label>
                  <input type="number" value={form.turnaround_days} onChange={e => setForm({ ...form, turnaround_days: Number(e.target.value) })} />
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
