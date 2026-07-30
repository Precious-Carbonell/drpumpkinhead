import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface AuditEntry {
  id: number;
  action: string;
  entity: string;
  entity_id: number;
  details: string;
  created_at: string;
}

const PAGE_SIZE = 10;

function getActionIcon(action: string) {
  switch (action) {
    case 'CREATE': return <Plus size={14} />;
    case 'UPDATE': return <Pencil size={14} />;
    case 'DELETE': return <Trash2 size={14} />;
    default: return <FileText size={14} />;
  }
}

function getActionBadgeClass(action: string) {
  switch (action) {
    case 'CREATE': return 'badge-green';
    case 'UPDATE': return 'badge-gold';
    case 'DELETE': return 'badge-red';
    default: return '';
  }
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/audit-log`)
      .then(r => r.json())
      .then(setLogs)
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginated = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="admin-page-title">Audit Logs</h1>
        <span className="audit-total">{logs.length} entries</span>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>ID</th>
              <th>Details</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(entry => (
              <tr key={entry.id}>
                <td>
                  <span className={`badge ${getActionBadgeClass(entry.action)}`}>
                    {getActionIcon(entry.action)} {entry.action}
                  </span>
                </td>
                <td>{entry.entity}</td>
                <td>#{entry.entity_id}</td>
                <td className="audit-details-cell">{entry.details || '—'}</td>
                <td className="cell-date">
                  {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No audit logs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button
            className="pagination-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
