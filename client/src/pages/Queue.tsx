import { useEffect, useState } from 'react';
import { Users, Clock, Loader } from 'lucide-react';
import './Queue.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface PublicCommission {
  maskedName: string;
  commissionType: string;
  queuePosition: number;
  commissionStatus: string;
  progressPercentage: number;
  estimatedCompletion: string;
}

function getStatusClass(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes('sketch') || lower.includes('coloring') || lower.includes('rendering'))
    return 'status-active';
  if (lower.includes('queue') || lower.includes('waitlist'))
    return 'status-pending';
  if (lower.includes('complete') || lower.includes('done'))
    return 'status-done';
  return '';
}

export default function Queue() {
  const [commissions, setCommissions] = useState<PublicCommission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/commissions/public?_t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setCommissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeCount = commissions.filter(c => {
    const s = c.commissionStatus.toLowerCase();
    return s.includes('sketch') || s.includes('coloring') || s.includes('rendering');
  }).length;

  return (
    <main className="queue-page">
      <div className="container">
        <div className="queue-header">
          <img src="/queue.png" alt="Commission Queue" className="queue-heading-img" />
          <p>
            See where your commission is in the queue. Find your masked name below
            to check your status and estimated completion date.
          </p>
        </div>

        <div className="queue-stats">
          <div className="queue-stat-card">
            <Users size={20} />
            <div>
              <span className="stat-number">{commissions.length}</span>
              <span className="stat-label">In Queue</span>
            </div>
          </div>
          <div className="queue-stat-card">
            <Clock size={20} />
            <div>
              <span className="stat-number">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="queue-loading">
            <Loader size={24} className="spin" />
            <span>Loading queue...</span>
          </div>
        ) : commissions.length === 0 ? (
          <div className="queue-empty">
            <p>No commissions in queue right now.</p>
          </div>
        ) : (
          <div className="queue-table-wrapper">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Commission Type</th>
                  <th>Queue #</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Est. Completion</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission, index) => (
                  <tr key={index}>
                    <td className="cell-name">{commission.maskedName}</td>
                    <td>{commission.commissionType}</td>
                    <td className="cell-queue">#{commission.queuePosition}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(commission.commissionStatus)}`}>
                        {commission.commissionStatus}
                      </span>
                    </td>
                    <td>
                      <div className="cell-progress">
                        <div className="mini-progress-bar">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${commission.progressPercentage}%` }}
                          />
                        </div>
                        <span className="progress-text">{commission.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="cell-date">
                      {commission.estimatedCompletion
                        ? new Date(commission.estimatedCompletion).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


      <div className="queue-note">
        <p><strong>How the queue works:</strong></p>
        <ul>
          <li><strong>Waitlisted</strong> - On the list, but work hasn't started yet (awaiting payment)</li>
          <li><strong>Queued</strong> - Payment confirmed, but hasn't been started yet.</li>
          <li><strong>Sketching → Coloring → Rendering</strong> - Actively being worked on.</li>
        </ul>
        <p>
          <strong>Privacy note:</strong> Names are masked for privacy.
          Only the first and last letters of each name part are shown.
        </p>
      </div>
      
    </div>

    </main>
  );
}
