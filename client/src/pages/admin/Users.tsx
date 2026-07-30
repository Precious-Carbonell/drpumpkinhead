import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

interface AdminUser {
  id: number;
  username: string;
}

const emptyForm = { username: '', password: '' };

export default function Users() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/users`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
  };

  useEffect(load, []);

  const openNew = () => { setEditId(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (u: AdminUser) => {
    setEditId(u.id);
    setForm({ username: u.username, password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    const url = editId ? `${API_URL}/api/users/${editId}` : `${API_URL}/api/users`;
    const method = editId ? 'PUT' : 'POST';

    const body = editId && !form.password
      ? { username: form.username }
      : { username: form.username, password: form.password };

    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this admin user?')) return;
    const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed');
      return;
    }
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">User Management</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New User</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Username</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td className="actions">
                  <button onClick={() => openEdit(u)}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>
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
              <h3>{editId ? 'Edit User' : 'New User'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="login-error">{error}</div>}
              <div className="form-field">
                <label>Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>{editId ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editId} />
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
