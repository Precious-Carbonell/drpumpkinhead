import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';
function getToken() { return localStorage.getItem('token') || ''; }

interface Commission {
  id: number;
  client_id: number;
  client_name: string;
  queue_number: number;
  commission_type: string;
  price: number;
  mode_of_payment: string;
  payment_type: string;
  payment_status: string;
  commission_status: string;
  progress_percentage: number;
  date_created: string;
  due_date: string;
  remarks: string;
}

interface Client { id: number; full_name: string; }
interface PriceOption { id: number; category: string; commission_type: string; price_php: number; }

const emptyForm = {
  client_id: 0, queue_number: 0, commission_type: '', price: 0,
  mode_of_payment: '', payment_type: '', payment_status: 'Unpaid',
  commission_status: 'Queued', progress_percentage: 0, due_date: '', remarks: '',
};

export default function Commissions() {
  const [rows, setRows] = useState<Commission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [priceOptions, setPriceOptions] = useState<PriceOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };

  const load = () => {
    fetch(`${API_URL}/api/commissions`, { headers }).then(r => r.json()).then(setRows).catch(() => {});
    fetch(`${API_URL}/api/clients`, { headers }).then(r => r.json()).then(setClients).catch(() => {});
    fetch(`${API_URL}/api/prices`, { headers }).then(r => r.json()).then(setPriceOptions).catch(() => {});
  };

  useEffect(load, []);

  const openNew = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Commission) => {
    setEditId(c.id);
    setForm({
      client_id: c.client_id, queue_number: c.queue_number, commission_type: c.commission_type,
      price: c.price, mode_of_payment: c.mode_of_payment, payment_type: c.payment_type,
      payment_status: c.payment_status, commission_status: c.commission_status,
      progress_percentage: c.progress_percentage, due_date: c.due_date || '', remarks: c.remarks || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editId ? `${API_URL}/api/commissions/${editId}` : `${API_URL}/api/commissions`;
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify(form) });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this commission?')) return;
    await fetch(`${API_URL}/api/commissions/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Commissions</h1>
        <button className="admin-btn primary" onClick={openNew}><Plus size={16} /> New</button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Q#</th><th>Client</th><th>Type</th><th>Price</th><th>Status</th><th>Progress</th><th>Payment</th><th>Due</th><th>Created</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id}>
                <td>{c.queue_number}</td>
                <td>{c.client_name}</td>
                <td>{c.commission_type}</td>
                <td>₱{c.price}</td>
                <td><span className="badge">{c.commission_status}</span></td>
                <td>{c.progress_percentage}%</td>
                <td><span className="badge">{c.payment_status}</span></td>
                <td>{c.due_date || '—'}</td>
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
              <h3>{editId ? 'Edit Commission' : 'New Commission'}</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Client</label>
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
                  <label>Commission Type</label>
                  <select
                    value={form.commission_type}
                    onChange={e => {
                      const selected = priceOptions.find(p => `${p.category} - ${p.commission_type}` === e.target.value);
                      setForm({
                        ...form,
                        commission_type: e.target.value,
                        price: selected ? selected.price_php : form.price,
                      });
                    }}
                  >
                    <option value="">Select type...</option>
                    {priceOptions.map(p => {
                      const label = `${p.category} - ${p.commission_type}`;
                      return <option key={p.id} value={label}>{label} (₱{p.price_php})</option>;
                    })}
                  </select>
                </div>
                <div className="form-field">
                  <label>Price (₱)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Mode of Payment</label>
                  <select value={form.mode_of_payment} onChange={e => setForm({ ...form, mode_of_payment: e.target.value })}>
                    <option value="">Select...</option>
                    <option>GCash</option>
                    <option>PayPal</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Type</label>
                  <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value })}>
                    <option value="">Select...</option>
                    <option>Full</option>
                    <option>Half</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Payment Status</label>
                  <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })}>
                    <option>Unpaid</option>
                    <option>Partial</option>
                    <option>Paid</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Commission Status</label>
                  <select value={form.commission_status} onChange={e => setForm({ ...form, commission_status: e.target.value })}>
                    <option>Queued</option>
                    <option>In Progress</option>
                    <option>Sketching</option>
                    <option>Coloring</option>
                    <option>Final Review</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Progress %</label>
                  <input type="number" min={0} max={100} value={form.progress_percentage} onChange={e => setForm({ ...form, progress_percentage: Number(e.target.value) })} />
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
